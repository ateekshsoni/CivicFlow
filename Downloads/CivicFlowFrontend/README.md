# CivicFlow Frontend

A modern, responsive web application for managing civic services and government applications. Built with React, TypeScript, and Tailwind CSS to provide citizens with an intuitive interface for accessing and completing various government services.

## 🚀 Features

- **User Authentication**: Secure login system with local storage persistence
- **Service Management**: Create, edit, and track civic service applications
- **Real-time Sync Status**: Monitor application synchronization with government systems
- **Admin Panel**: Administrative tools for managing services and users
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Form Validation**: Robust form handling with React Hook Form
- **Modern UI Components**: Built with shadcn/ui for consistent, accessible components

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives with shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts
- **Animations**: Motion
- **Form Handling**: React Hook Form
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js (version 18 or higher)
- npm, yarn, or pnpm package manager

## 🚀 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CivicFlowFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📜 Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the project for production
- `npm run preview` - Preview the production build locally

## 🏗️ Project Structure

```
src/
├── app/
│   ├── App.tsx                 # Main application component
│   ├── components/
│   │   ├── admin-panel.tsx     # Administrative interface
│   │   ├── auth-modal.tsx      # User authentication modal
│   │   ├── dashboard.tsx       # User dashboard
│   │   ├── form-filling.tsx    # Service application forms
│   │   ├── home-screen.tsx     # Landing page
│   │   ├── service-completion.tsx # Completion confirmation
│   │   ├── services-list.tsx   # Available services listing
│   │   ├── sync-status.tsx     # Synchronization status
│   │   └── figma/
│   │       └── ImageWithFallback.tsx
│   └── ui/                     # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       └── ... (other shadcn/ui components)
├── styles/
│   ├── fonts.css
│   ├── index.css
│   ├── tailwind.css
│   └── theme.css
└── main.tsx                    # Application entry point
```

## 🎯 Core Features

### Service Management
- Browse available civic services
- Create new service applications
- Edit draft applications
- Track application status (draft, syncing, synced)
- View completed applications with reference IDs

### User Experience
- Intuitive navigation between screens
- Form validation and error handling
- Responsive design for mobile and desktop
- Dark/light theme support
- Loading states and feedback

### Administrative Tools
- Service management interface
- User management capabilities
- System monitoring and analytics

## 🔧 Configuration

The application uses Vite for configuration. Key settings can be found in:

- `vite.config.ts` - Build and development configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration

## 📱 Supported Services

The application currently supports the following civic services:

- Business License applications
- Housing Benefit applications
- University Scholarship applications
- Voter Registration
- Building Permits
- Tax Declarations
- Health Insurance applications
- Driver License Renewal

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project includes components from [shadcn/ui](https://ui.shadcn.com/) (MIT License) and photos from [Unsplash](https://unsplash.com) (Unsplash License).

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Unsplash](https://unsplash.com) for the stock photography
- [Radix UI](https://www.radix-ui.com/) for the accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
  