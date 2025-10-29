# PWA Setup Documentation

This document describes the PWA (Progressive Web App) setup for the Family Tree Builder application.

## What Has Been Implemented

### 1. Service Worker Configuration
- Configured `next-pwa` in `next.config.ts` to generate service workers
- Service worker is automatically generated during build
- Disabled in development mode for easier debugging
- Enabled in production builds

### 2. PWA Manifest
- Created `public/manifest.json` with:
  - App name: "Family Tree Builder"
  - Short name: "FamilyTree"
  - Description: "Build and manage your family tree offline"
  - Theme colors matching the app design (#1976d2)
  - Background color: #f3f6fa
  - Display mode: standalone (app-like experience)
  - Icons in two sizes (192x192 and 512x512)

### 3. PWA Icons
- Generated two icon sizes:
  - 192x192 pixels (required for most devices)
  - 512x512 pixels (required for splash screens and high-res displays)
- Icons feature a simple family tree design with theme color background (#1976d2)
- Located in `public/icons/`

### 4. Mobile Meta Tags
- Added comprehensive mobile and PWA meta tags to `layout.tsx`:
  - `viewport` with proper scaling settings
  - `theme-color` for browser UI theming
  - `mobile-web-app-capable` for Android
  - `apple-mobile-web-app-capable` for iOS
  - `apple-mobile-web-app-status-bar-style` for iOS status bar
  - `apple-mobile-web-app-title` for iOS home screen
  - `apple-touch-icon` for iOS icon

### 5. Enhanced IndexedDB Compatibility
- Added browser compatibility checks for IndexedDB
- Better error messages for Safari private mode
- Added `onblocked` handler for database conflicts
- User-friendly error messages instead of technical errors

## Testing the PWA

### On Desktop (Chrome/Edge)

1. Build and serve the production app:
   ```bash
   npm run build
   npx serve out
   ```

2. Open Chrome DevTools (F12)
3. Go to the "Application" tab
4. Check "Manifest" section to verify PWA metadata
5. Check "Service Workers" section to verify registration
6. Install the PWA:
   - Click the install icon in the address bar (⊕)
   - Or use the three-dot menu → "Install Family Tree Builder"

### On Mobile (iOS Safari)

1. Deploy the app to a server (or use ngrok for local testing)
2. Open the app in Safari
3. Tap the "Share" button
4. Scroll down and tap "Add to Home Screen"
5. The app icon will appear on your home screen
6. Launch the app from the home screen - it will open in standalone mode

**Note:** iOS Safari requires HTTPS for service workers (except localhost)

### On Mobile (Android Chrome)

1. Deploy the app to a server (or use ngrok for local testing)
2. Open the app in Chrome
3. A banner will appear asking "Add Family Tree Builder to Home screen"
4. Or use the three-dot menu → "Add to Home screen"
5. The app icon will appear on your home screen
6. Launch the app from the home screen - it will open in standalone mode

### IndexedDB Testing on Mobile

1. Create a family tree in the app
2. Add some nodes
3. Close the app completely
4. Reopen the app - your data should persist
5. Go offline (airplane mode)
6. The app should still work with your saved data

## Safari Private Mode Compatibility

When using Safari in private browsing mode, IndexedDB is disabled. The app will show a user-friendly error message:
> "Your browser doesn't support offline storage. Please use a different browser or disable private browsing mode."

This is expected behavior and not a bug.

## Updating PWA Icons

If you need to regenerate the PWA icons:

1. Install dependencies (if not already installed):
   ```bash
   npm install --save-dev sharp
   ```

2. Run the icon generation script:
   ```bash
   node scripts/generate-icons.js
   ```

3. Rebuild the app:
   ```bash
   npm run build
   ```

## Caching Strategy

The service worker uses the following caching strategies:

- **Start URL**: NetworkFirst (always try network first, fallback to cache)
- **Static Assets** (JS, CSS, images): StaleWhileRevalidate (use cache, update in background)
- **API Routes**: NetworkFirst with 10s timeout
- **Google Fonts**: Cached for faster loading
- **Cross-origin requests**: NetworkFirst with 10s timeout

## File Structure

```
family-tree-builder/
├── public/
│   ├── icons/
│   │   ├── icon-192x192.png
│   │   └── icon-512x512.png
│   ├── manifest.json
│   ├── sw.js (generated)
│   └── workbox-*.js (generated)
├── scripts/
│   └── generate-icons.js
├── src/
│   ├── app/
│   │   └── layout.tsx (PWA meta tags)
│   ├── hooks/
│   │   └── useFamilyTree.tsx (enhanced IndexedDB)
│   └── libs/
│       └── backup.ts (IndexedDB checks)
└── next.config.ts (PWA configuration)
```

## Troubleshooting

### Service Worker Not Registering
- Make sure you built the app (`npm run build`)
- Check that you're testing the production build (not dev server)
- Service workers are disabled in development mode

### Icons Not Showing
- Verify icons exist in `public/icons/`
- Check browser console for 404 errors
- Clear browser cache and rebuild

### App Not Installing
- Verify you're using HTTPS (or localhost)
- Check that manifest.json is accessible
- Ensure all required manifest fields are present

### IndexedDB Errors on Mobile
- Check if you're in private browsing mode
- Verify IndexedDB is enabled in browser settings
- Check browser console for specific error messages

## Browser Support

- ✅ Chrome/Edge (Desktop & Android): Full PWA support with all features
- ✅ Safari (iOS 11.3+): PWA support with limitations (no install prompt banner, must use Share menu to add to home screen, limited service worker scope)
- ✅ Firefox (Desktop & Android): Service worker support
- ⚠️ Safari Private Mode: IndexedDB disabled (expected behavior, not a bug)
