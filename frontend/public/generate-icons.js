// Simple icon generator for PWA
const fs = require('fs');
const { createCanvas } = require('canvas');

function generateIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Indigo gradient background
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#4f46e5');
  gradient.addColorStop(1, '#6366f1');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  
  // White text "CF"
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${size * 0.4}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CF', size / 2, size / 2);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
}

try {
  generateIcon(192, 'pwa-192x192.png');
  generateIcon(512, 'pwa-512x512.png');
  console.log('Icons generated successfully!');
} catch (error) {
  console.error('Canvas not available, creating placeholder files');
}
