# CivicFlow SDK: Build & Integration Report

How we turn the current CivicFlow MVP into an SDK, and how existing platforms adopt it.

Sources: `civicflow-mvp.html`, `docs/problem_statement.md`, `docs/civicflow_strategy_plan.md`, `docs/civicflow_pitch_and_faq.md`, and the code in `backend/` and `frontend/` as of this report. Anything not in the code today is marked **(proposed)**.

---

## Summary

- CivicFlow's product is the reliability loop (queue on-device → sync with idempotency → forward to the gov API), not the portal UI. The SDK packages that loop so it can sit in front of portals governments already run.
- About half the loop exists today: IndexedDB caching, draft autosave, a local submission queue, and an idempotent batch sync endpoint. Auto-sync, retries, encryption, Background Sync, auth, and the gov adapter are not built or not wired in.
- The proposal is a pnpm monorepo: a framework-agnostic `@civicflow/core`, thin bindings (`@civicflow/react`, a drop-in script / web component), and `@civicflow/server` with a versioned sync contract and pluggable gov adapters. All proposed.
- Platforms adopt it through four paths: npm for SPAs, a script tag for server-rendered portals, storage adapters for mobile/hybrid apps, and a REST sync contract plus adapters on the backend.
- Adoption starts with one form in a pilot, beginning in observe-only mode, before expanding.
- Apache-2.0 suits this. It's permissive, includes a patent grant, and lets integrators embed the SDK in proprietary portals. Every dependency in use is permissively licensed.

---

## 1. Current state

### What exists in code

| Area | File(s) | What it does | SDK fit |
|---|---|---|---|
| IndexedDB layer | `frontend/src/db/db.js` | `civicflow-db` v4 with `schemas`, `forms`, `submissions` stores (via `idb`) | **Core.** Needs namespacing and non-destructive migrations |
| Schema fetch + cache | `frontend/src/services/fetchSechemaService.js` | Fetches `/forms/:id`, retries, falls back to IndexedDB | **Core** (schema cache). Axios and `import.meta.env` need removing |
| Forms list cache | `frontend/src/services/fetchForms.js` | Fetches `/forms`, caches in IndexedDB | Optional core (catalogue) |
| Submission queue | `frontend/src/services/fetchSubmissions.js` | Saves submissions with `synced: pending/synced/failed`, retry metadata | **Core** (queue store) |
| Sync engine | `frontend/src/services/syncSubmission.js` | Batch POST of pending items, reconciles `syncedIds` / `failedSyncs` | **Core**, after the bug fixes in §4 |
| Auto-sync scheduler | `frontend/src/services/autoSync.js` | `online` listener (3s debounce), 2-min interval, retry-delay helpers | **Core**, but currently never started |
| Network status | `frontend/src/hooks/useNetworkStatus.js` | React hook over `online`/`offline` events | **`@civicflow/react`**. Currently unused |
| Schema-driven renderer | `frontend/src/components/ServiceForm.jsx` | Renders `fields[]`, 1s debounced draft autosave, submit to queue | Split: draft logic → core; renderer → `@civicflow/react` (optional) |
| Device identity | `frontend/src/utils/userId.js` | Anonymous UUID in `localStorage` | Core, made optional/host-supplied |
| PWA / service worker | `frontend/vite.config.js` | `vite-plugin-pwa` `generateSW`: precache + `NetworkFirst` API cache | App-specific. SDK ships its own SW module |
| Schema endpoints | `backend/src/app.js` `GET /forms`, `GET /forms/:id` | Serve JSON files from `src/schemas` | **`@civicflow/server`** (schema registry) |
| Sync endpoint | `backend/src/app.js` `POST /api/sync-submissions` | Writes `src/submissions/YYYY-MM/<id>.json`, skips existing IDs | **`@civicflow/server`** (becomes the v0 sync contract) |
| Ops endpoints | `/health`, `/status`, `/ping`, Render keep-alive | Monitoring and hosting workaround | App-specific (keep-alive) / server (health) |

### App-specific (stays in the demo app)

Pages (`HomePage`, `ServiceForms`, `UserSubmissions`, dashboard placeholders), Tailwind styling, the Render keep-alive, Netlify config, and `SampleForm.jsx`.

### Not built yet

AES-GCM encryption at rest, Background Sync, wipe-after-acknowledgement, auth/deferred OTP, schema versioning, cryptographic timestamps, gov API adapter, MongoDB, BullMQ retry queue, Ajv validation, and observability. Note that `civicflow-mvp.html` says "nothing is built yet" and picks Next.js, but the repo is a working React + Vite MVP. The SDK plan below keeps the core framework-agnostic, so this choice doesn't block extraction.

---

## 2. How we build the SDK (proposed)

### 2.1 Package architecture

pnpm workspace monorepo. The current `frontend/` becomes `apps/demo` and consumes the packages, so the demo becomes the SDK's first integration test.

```
civicflow/
├── packages/
│   ├── schema/        @civicflow/schema   – form schema spec, JSON Schema meta-schema, Ajv validators, TS types
│   ├── core/          @civicflow/core     – queue, storage, crypto, sync engine, scheduler, events (no framework, no DOM UI)
│   ├── sw/            @civicflow/sw       – service-worker module: Background Sync handler + replay
│   ├── react/         @civicflow/react    – Provider, hooks, optional <CivicFlowForm/> renderer
│   ├── web/           @civicflow/web      – IIFE bundle: CivicFlow.init/wrap + <civicflow-form> web component
│   └── server/        @civicflow/server   – Express router for the sync contract, idempotency store, adapter interface
├── adapters/          @civicflow/adapter-rest, -webhook, -queue (BullMQ), -soap (later)
├── apps/
│   ├── demo/          current frontend
│   ├── reference-server/  current backend on @civicflow/server
│   └── mock-gov/      flaky gov API (30% failures, 10s latency) for demos and tests
└── docs/
```

`@civicflow/sdk` (the name used in `civicflow-mvp.html`) is a convenience meta-package that re-exports `core` + `web`.

### 2.2 Core responsibilities

| Concern | Design |
|---|---|
| Storage | `StorageAdapter` interface. Default IndexedDB (via `idb`, already a dependency, or Dexie per the MVP stack). Adapters for React Native / Capacitor SQLite. Database name namespaced per app: `civicflow:<appId>` |
| Queue | Records: `{ id, formId, schemaVersion, status, attempts, nextAttemptAt, createdAt, completedAt, ciphertext, iv }`. States: `draft → queued → sending → acknowledged → wiped`, plus `failed`, `needs-auth`, `needs-input` (schema changed), `dead` |
| Idempotency | `id = crypto.randomUUID()` assigned once at enqueue and sent as `Idempotency-Key` on every attempt |
| Sync engine | Single-flight lock (shared across tabs via Web Locks API, falling back to BroadcastChannel), per-item send, exponential backoff with jitter (1s, 2s, 4s… capped), honours `Retry-After` |
| Triggers | Background Sync (Chromium), `online`, `visibilitychange`, app start, manual `flush()` |
| Conflicts | Push-only, so no merge is needed. A server `409 schema_mismatch` moves the item to `needs-input` with the missing fields listed |
| Events | `queued`, `sending`, `synced`, `failed`, `needs-auth`, `needs-input`, `network` |
| Transport | `fetch` only (no axios). Pluggable `Transport` for native HTTP clients |

### 2.3 Public API sketch

```ts
import { createCivicFlow } from '@civicflow/core';

const cf = createCivicFlow({
  appId: 'pune-municipal',
  endpoint: 'https://civicflow.municipality.gov/api',
  encryption: { mode: 'aes-gcm' },           // or { mode: 'envelope', serverPublicKey }
  sync: { backgroundSync: true, retry: { baseMs: 1000, maxMs: 300_000, maxAttempts: 10 } },
  getAuthToken: async () => session.token,    // called at send time, never stored in the queue
});

const id = await cf.enqueue('scholarship-2026', formData);   // persisted (encrypted) before any network call
cf.on('synced', ({ id, receipt }) => showReceipt(receipt.referenceNo));
cf.on('needs-auth', ({ id }) => promptOtp(id));             // deferred authentication
await cf.flush();                                            // manual trigger
```

React binding:

```tsx
import { CivicFlowProvider, useCivicFlowForm, useNetworkStatus } from '@civicflow/react';

function Scholarship() {
  const { register, submit, draftSavedAt, status } = useCivicFlowForm('scholarship-2026');
  const { isOnline } = useNetworkStatus();
  return <form onSubmit={submit}>{/* host's own inputs via register('fullName') */}</form>;
}
```

Drop-in for any page:

```html
<script src="https://cdn.municipality.gov/civicflow/web.iife.js"
        data-endpoint="https://civicflow.municipality.gov/api" defer></script>
<script>
  addEventListener('DOMContentLoaded', () =>
    CivicFlow.wrap(document.querySelector('#application-form'), { formId: 'scholarship-2026' }));
</script>
```

`wrap()` autosaves the form's fields as a draft and intercepts `submit`. It serializes `FormData` and enqueues it, then shows the host-provided "saved on your device" banner.

### 2.4 Schema standardization

Today's schema is a custom `{ id, title, description, fields: [{ key, label, type, required, placeholder }] }`. Proposed v1 keeps that shape for rendering and adds:

- `schemaVersion` (integer) and `$schema` URI pointing to the published meta-schema.
- A generated JSON Schema (`dataSchema`) so the same file validates in the browser and on the server with Ajv.
- Field additions: `options` (select/radio), `pattern`, `min`/`max`, `maxLength`, `file` type with `accept` and `maxBytes`, `sensitive: true` (PII flag for logging/redaction), and `i18n` labels.
- A one-way migration script for the 7 existing files in `backend/src/schemas/`.

### 2.5 Build tooling

| Need | Choice |
|---|---|
| Workspace | pnpm workspaces (Turborepo optional for caching) |
| Language | TypeScript, `strict`, `.d.ts` shipped |
| Library builds | `tsup`: ESM + CJS, `sideEffects: false` for tree-shaking, `exports` map per entry |
| Drop-in bundle | Vite library mode → IIFE/UMD `web.iife.js`, size budget enforced with `size-limit` (target ≤ 15 kB gzip for core + web) |
| SW module | Built as a separate entry that can be loaded with `importScripts`, imported into Workbox/Serwist, or used standalone |
| Release | Changesets for semver + changelogs, npm provenance, signed tags |

### 2.6 Service worker and Background Sync

The SDK must not take over a host's service worker. Three modes:

1. **Host already has a SW** (Workbox, Serwist, custom): add `importScripts('/civicflow-sw.js')` or `import { registerCivicFlowSync } from '@civicflow/sw'`. It registers a `sync` handler for tag `civicflow-flush` that reads the queue from IndexedDB and replays it.
2. **No SW:** the SDK registers its own minimal SW at a configurable scope.
3. **No SW allowed** (strict CSP, WebViews): page-only mode using `online`, `visibilitychange`, and app-start triggers.

Background Sync only exists in Chromium browsers. Safari, iOS Safari, and Firefox always use the page-level fallback, which matches the success criterion of syncing on next app open.

### 2.7 Security

| Topic | Approach |
|---|---|
| Encryption at rest | AES-GCM-256 via Web Crypto. A non-extractable `CryptoKey` is generated per device and stored in IndexedDB (structured-clone). Each record gets a fresh 12-byte IV, and `id + formId + schemaVersion` is used as AAD |
| Envelope mode (zero-trust) | Optional: wrap the data key with the government's public key (ECDH/RSA-OAEP) so the CivicFlow middleware forwards ciphertext it can't read. This answers the strategy doc's "no plain-text PII on our servers" point |
| Wipe | The record is deleted only after a `2xx` receipt is persisted. `acknowledged → wiped` is atomic in one IndexedDB transaction |
| Auth tokens | Never stored in the queue. `getAuthToken()` is called at send time. A `401` sets the item to `needs-auth` (deferred OTP) |
| CSRF | Bearer tokens in `Authorization`, not cookies. If a host must use cookies, it uses `SameSite=Strict` plus a double-submit token header supported by `@civicflow/server` |
| PII | No PII in logs or events (IDs only). `sensitive` fields are redacted in the server's error logs. Data retention is configurable server-side (MongoDB TTL index per the MVP stack) |
| Server hardening | Body size limits, schema validation (Ajv), per-key rate limiting, strict CORS allow-list, and an idempotency store keyed by `Idempotency-Key` + tenant |
| Limits stated honestly | Encryption protects data at rest, not an unlocked, compromised device |

### 2.8 Testing strategy

- **Unit (Vitest + `fake-indexeddb`):** queue state machine, backoff maths, crypto round-trip, migrations.
- **Contract tests:** one test suite run against `@civicflow/server` and against any third-party implementation of the sync contract.
- **E2E (Playwright):** `context.setOffline(true)` mid-form, reload, submit, go online. Assert one server record and an empty local store. Run on Chromium, WebKit, and Firefox to cover both the Background Sync and fallback paths.
- **Chaos:** `apps/mock-gov` with a 30% failure rate and 10s latency. Assert 100% eventual delivery and 0 duplicates (the MVP success criteria).
- **Multi-tab:** two tabs flushing at once must not double-send.

### 2.9 Versioning and docs

- SemVer per package. Breaking changes to the **sync contract** or **schema spec** are versioned separately (`/v1/…`, `schemaVersion`) because they outlive client releases. Queued items may sit on a device for days.
- Server supports the current and previous contract versions.
- Docs: quick start per integration path, sync contract (OpenAPI 3.1), schema spec, security/data-custody whitepaper for procurement, and a migration guide from the v0 `/api/sync-submissions` endpoint.

### 2.10 Licensing implications

The project is **Apache-2.0** (`LICENSE`; `license` field in both `package.json` files).

- Integrators, including system integrators building proprietary government portals, can embed and modify the SDK without opening their own code. They must keep the license text and notices.
- Apache-2.0 includes an express patent grant, which government legal teams generally prefer over bare MIT.
- Trademarks aren't licensed (section 6), so "CivicFlow" stays protected for the commercial offerings in the pitch FAQ (enterprise licensing, analytics upsell).
- Recommendations: add a `NOTICE` file, add `"license": "Apache-2.0"` and SPDX headers (`// SPDX-License-Identifier: Apache-2.0`) to published packages, and adopt a DCO sign-off so inbound contributions stay clean.
- Dependencies are compatible. Runtime candidates are `idb` (ISC), Dexie (Apache-2.0), Workbox/Serwist (MIT), Ajv (MIT), Express (MIT), and BullMQ (MIT). In the current frontend lockfile, the only entries outside the MIT/ISC/BSD/Apache family are build- or dev-only: `lightningcss` (MPL-2.0, via Tailwind), `caniuse-lite` (CC-BY-4.0), and `argparse` (Python-2.0). None ship in the SDK bundle.

---

## 3. How existing platforms absorb it

### 3.1 Integration paths

| Platform | Path | Effort for the integrating team |
|---|---|---|
| **React SPA** | `npm i @civicflow/react`, wrap the app in `<CivicFlowProvider>`, swap the submit handler for `useCivicFlowForm` | Hours per form |
| **Vue / Angular / Svelte** | `npm i @civicflow/core`. Write a thin composable/service over the core events (≈50 lines). Official bindings come later if there's demand | Hours to a day |
| **Legacy / server-rendered portals** (JSP, PHP, ASP.NET, Drupal) | Script tag + `CivicFlow.wrap(form)` or `<civicflow-form form-id="…">`. The original `<form>` markup stays. Replay goes to the CivicFlow middleware, which forwards to the portal's existing action URL or API | A day, mostly CSP/hosting approvals |
| **Capacitor / Ionic** | Same npm path. IndexedDB works in the WebView. Optionally use a SQLite storage adapter for durability across WebView cache clears | Hours |
| **React Native** | `@civicflow/core` with the `react-native` storage adapter (SQLite/MMKV) and a NetInfo network adapter. No service worker. Background flush through the host's background task library | Days |
| **Native app with WebView** | Treat as a web page. Service worker support in embedded WebViews is limited, so expect the page-only fallback | Hours |

### 3.2 Backend integration

The client only talks to the **CivicFlow sync contract**. The government system is reached through an adapter.

**Sync contract v1 (proposed):**

```
POST /v1/submissions
Authorization: Bearer <token>            (optional until deferred auth)
Idempotency-Key: <uuid>
Content-Type: application/json

{ "formId": "scholarship-2026", "schemaVersion": 3,
  "completedAt": "2026-01-31T18:20:00Z", "payload": { … } | "ciphertext": "…" }
```

| Response | Meaning | SDK action |
|---|---|---|
| `201` / `200` (replay) | Stored; body `{ receiptId, referenceNo? }` | Mark acknowledged, wipe |
| `202` | Stored, gov forwarding pending | Wipe locally; poll or receive webhook for `referenceNo` |
| `401` | Auth required | `needs-auth` → host prompts OTP |
| `409 schema_mismatch` | Schema changed; body lists missing fields | `needs-input` |
| `422` | Validation failed | `failed` (no auto-retry) |
| `429` / `5xx` | Overloaded or down | Retry with backoff, honour `Retry-After` |

**Adapters** (server-side, proposed):

```ts
export interface GovAdapter {
  submit(sub: VerifiedSubmission, ctx: AdapterContext): Promise<{ referenceNo: string }>;
}
```

- `adapter-rest`: map fields and POST to an existing REST API.
- `adapter-webhook`: sign and push to the department's endpoint.
- `adapter-queue`: BullMQ + Redis with backoff and dead-letter queue, for gov APIs that can't take spikes.
- `adapter-soap`: later, for older systems.

All forwarding runs through a retry queue. The server dedupes on `Idempotency-Key` before forwarding, because legacy APIs usually aren't idempotent.

**Auth integration:** `@civicflow/server` validates OIDC/OAuth2 JWTs (issuer + JWKS config) for citizen sessions and API keys for server-to-server calls. On the client, the SDK never handles credentials. The host supplies `getAuthToken()`, which can drive an Aadhaar/DigiLocker-style OTP flow once the device is back online.

**Data mapping:** a per-form mapping file translates CivicFlow field keys to the gov API's shape:

```json
{ "formId": "scholarship-2026", "target": "rest",
  "map": { "fullName": "applicant_name", "income": "annual_income_inr" } }
```

A CLI `civicflow schema import <url|html>` (proposed) scans an existing HTML form's inputs and drafts a schema plus mapping for review.

### 3.3 What the integrator does vs what the SDK handles

| Integrating team | CivicFlow SDK / server |
|---|---|
| Choose forms and author or approve schemas and mappings | Render (optional), autosave drafts, validate |
| Host the CivicFlow server on-prem or in a private cloud | Queue, encrypt, retry, dedupe, wipe |
| Provide auth (OIDC/OTP) via `getAuthToken()` | Defer submission until auth succeeds |
| Configure the gov adapter and credentials | Forward with backoff and dead-letter handling |
| Own UI copy (banners, receipts) and accessibility of their markup | Emit events and status for that UI |
| Data retention policy and DPDP/GDPR sign-off | Enforce TTLs, redact PII in logs |

### 3.4 Phased adoption

1. **Observe:** add the script/SDK in observe-only mode on one high-traffic form. It records failed submits and abandonment but doesn't queue. This builds the baseline for the "≥ 50% fewer lost-form tickets" criterion.
2. **Protect one form:** turn on drafts + queue + sync for that form (for example a scholarship application). Keep the legacy submit path as fallback behind a feature flag.
3. **Harden:** enable encryption, deferred auth, and the queue adapter. Run the deadline-day load test against `mock-gov`.
4. **Expand:** onboard more forms by schema + mapping only, with no frontend redeploy.
5. **Operate:** observability dashboard (recovered sessions, gov API uptime), SLA reporting.

---

## 4. Gaps to fix before SDK extraction

| # | Gap | Where | Fix |
|---|---|---|---|
| 1 | Auto-sync is never started; sync is manual only | `frontend/src/services/autoSync.js` (`startAutoSync` has no caller) | Start it at app boot in `main.jsx` (core: scheduler) |
| 2 | Failed submissions are never retried | `syncSubmission.js` filters only `synced === "pending"`. `shouldRetrySubmission` in `autoSync.js` is unused | Include `failed` items whose backoff has elapsed |
| 3 | Partial-failure responses aren't reconciled | `syncSubmission.js` updates local status only `if (response.data.success)`, but the server sets `success: false` when any item fails. Synced items stay `pending` and failed items are never marked | Reconcile `syncedIds` and `failedSyncs` regardless of the top-level flag |
| 4 | No API URL fallback for sync/status | `syncSubmission.js`, `pages/HomePage.jsx` use `import.meta.env.VITE_API_URL` directly (other services default to `localhost:4000`) | Single config object passed into core |
| 5 | Weak idempotency key | `fetchSubmissions.js` `generateSubmissionId` uses `Math.random()` | `crypto.randomUUID()`, sent as `Idempotency-Key` |
| 6 | ID sanitization can collide | `app.js` strips `[^a-zA-Z0-9-]` from `submissionId`, while form IDs may contain `_`. Two distinct IDs can map to one file and the second is silently treated as a duplicate | Reject invalid IDs instead of rewriting them. Store by an idempotency key |
| 7 | Plain-text PII at rest; no wipe after ack | `fetchSubmissions.js` stores `formData` unencrypted. Synced records are kept forever | AES-GCM per §2.7. Delete on acknowledgement |
| 8 | Destructive DB migration | `db/db.js` deletes the `submissions` store when upgrading from `< 4`, dropping unsynced data | Versioned, non-destructive migrations; never drop queued data |
| 9 | Hard-coded names and origins | `db/db.js` (`civicflow-db`), `vite.config.js` (Render URL and `localhost:4000` in `runtimeCaching`) | Namespaced DB name; SW config from init options |
| 10 | Framework/bundler coupling in services | `axios` and `import.meta.env` in `services/*` | `fetch` + injected config |
| 11 | Queue tied to `localStorage` user ID | `getUserSubmissions` filters by `getUserId()`. Clearing `localStorage` orphans queued items | Queue independent of identity; identity optional metadata |
| 12 | No server-side validation or auth | `POST /api/sync-submissions` accepts any `formData`, doesn't check `formId` exists, and spreads client fields into the stored record. No auth or rate limit | Ajv validation against the schema, auth middleware, rate limiting, explicit body limit (`express.json()` defaults to 100 kB, too small for uploads) |
| 13 | CWD-relative file storage | `app.js` resolves `src/schemas` and `src/submissions` from `process.cwd()` | Paths relative to the module or config; storage interface (files → MongoDB) |
| 14 | Inconsistent response envelopes | `GET /forms/:id` returns the raw schema; other routes return `{ success, … }` | Fix in sync contract v1 |
| 15 | Custom schema format, no version | `backend/src/schemas/*.json` | Schema spec v1 with `schemaVersion` (§2.4) |
| 16 | No Background Sync | `vite.config.js` uses `generateSW` with no sync handler | `@civicflow/sw` module (§2.6) |
| 17 | No tests or types | `backend/package.json` `test` is a placeholder; no frontend tests; plain JS | Vitest + Playwright (§2.8), TypeScript |
| 18 | Committed runtime data | `backend/src/submissions/2025-12/complaint-form-….json` is tracked in git and contains personal contact details | Remove from history if needed, `.gitignore` `backend/src/submissions/*/` |
| 19 | Committed generated files | `frontend/dev-dist/` (dev SW + Workbox bundles) is tracked | `.gitignore` it |
| 20 | Unused pieces | `useNetworkStatus` has no consumer; `AdminDashboard`/`InstituteDashboard` aren't routed | Wire into the demo or drop |

---

## 5. Phased roadmap

| Phase | Milestone | Exit criteria |
|---|---|---|
| **0. Stabilize MVP** | Fix gaps 1–8 and 12 in the current app; add `apps/mock-gov` | Airplane-mode demo loses 0 bytes; 100% eventual delivery and 0 duplicates against 30% failures / 10s latency |
| **1. Extract core** | Monorepo; `@civicflow/schema`, `@civicflow/core` (TS) with storage/transport adapters; demo app consumes it | Demo works unchanged on the package; unit + contract tests green |
| **2. Contract + server** | Sync contract v1 (OpenAPI), `@civicflow/server` with idempotency store, Ajv validation, auth middleware, MongoDB storage; v0 endpoint kept as shim | Contract suite passes; old clients still sync |
| **3. Custody + browser coverage** | AES-GCM at rest, wipe-on-ack, `@civicflow/sw` Background Sync with fallback | E2E green on Chromium, WebKit, Firefox; DevTools shows no plain text, empty store after ack |
| **4. Bindings + drop-in** | `@civicflow/react`, `@civicflow/web` (IIFE + web component), size budget | A static HTML form is made offline-safe with a script tag alone |
| **5. Gov adapters + deferred auth** | `adapter-rest`, `-webhook`, `-queue` (BullMQ); OTP `needs-auth` flow; schema versioning `needs-input` | Mock gov integration end-to-end with dead-letter review |
| **6. Pilot + 1.0** | One municipal or university form live; observability dashboard; security whitepaper; 1.0.0 published | Pilot success criteria from `civicflow-mvp.html` reported weekly |
