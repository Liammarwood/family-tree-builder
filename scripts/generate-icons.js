/* eslint-disable @typescript-eslint/no-require-imports */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

const sizes = [192, 512];

async function generateIcons() {
  for (const size of sizes) {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="#1976d2"/>
        <g transform="translate(${size * 0.15}, ${size * 0.15})">
          <rect x="${size * 0.35}" y="${size * 0.5}" width="${size * 0.1}" height="${size * 0.2}" fill="#8B4513"/>
          <circle cx="${size * 0.3}" cy="${size * 0.35}" r="${size * 0.12}" fill="#4CAF50"/>
          <circle cx="${size * 0.5}" cy="${size * 0.35}" r="${size * 0.12}" fill="#4CAF50"/>
          <circle cx="${size * 0.4}" cy="${size * 0.25}" r="${size * 0.12}" fill="#4CAF50"/>
          <circle cx="${size * 0.2}" cy="${size * 0.15}" r="${size * 0.05}" fill="white"/>
          <circle cx="${size * 0.4}" cy="${size * 0.15}" r="${size * 0.05}" fill="white"/>
          <circle cx="${size * 0.6}" cy="${size * 0.15}" r="${size * 0.05}" fill="white"/>
        </g>
      </svg>
    `;
    
    await sharp(Buffer.from(svg))
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    
    console.log(`Generated icon-${size}x${size}.png`);
  }
}

generateIcons().catch(console.error);
