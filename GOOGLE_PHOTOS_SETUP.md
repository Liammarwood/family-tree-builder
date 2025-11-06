# Google Photos Picker Setup

This document explains how to configure the Google Photos Picker feature for avatar selection.

## Overview

The application now supports selecting avatar pictures directly from Google Photos. The integration is fully client-side and includes automatic image compression to ensure images are under 500KB for efficient storage.

## Configuration

To enable the Google Photos Picker feature, you need to configure Google Cloud credentials:

### 1. Create a Google Cloud Project

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Photos Library API
   - Google Picker API

### 2. Create OAuth 2.0 Credentials

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > OAuth client ID**
3. Select **Web application** as the application type
4. Add authorized JavaScript origins:
   - `http://localhost:3000` (for development)
   - Your production domain (e.g., `https://yourdomain.com`)
5. Add authorized redirect URIs (if needed):
   - `http://localhost:3000` (for development)
   - Your production domain
6. Save and note down your **Client ID**

### 3. Get an API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API key**
3. (Optional but recommended) Restrict the API key to:
   - **API restrictions**: Select "Google Photos Library API" and "Picker API"
   - **Application restrictions**: Set to "HTTP referrers" and add your domains
4. Save and note down your **API Key**

### 4. Configure Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
NEXT_PUBLIC_GOOGLE_API_KEY=your_api_key_here
```

**Note**: These variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser.

## Usage

Once configured, users can:

1. Click the **"Google Photos"** button when adding or editing a person's avatar
2. Authenticate with their Google account (first time only)
3. Browse and select a photo from their Google Photos library
4. The selected image will be automatically:
   - Fetched from Google Photos
   - Compressed to under 500KB
   - Cropped using the existing avatar cropper
   - Saved with the person's details

## Image Compression

Both the device upload and Google Photos picker now include automatic image compression:

- **Maximum size**: 500KB
- **Maximum dimensions**: 1200px on the longest side
- **Format**: JPEG with quality optimization
- **Process**: Fully client-side (no server processing required)

This ensures efficient storage and faster loading times while maintaining good image quality for avatars.

## Fallback Behavior

If the Google Photos Picker is not configured (environment variables are missing), the feature will display an error message instructing users to configure the credentials. The standard file upload will continue to work regardless.

## Privacy & Security

- All processing is done client-side in the user's browser
- No images are sent to external servers (except Google's own services during OAuth)
- Users must explicitly authorize the application to access their Google Photos
- Only read-only access to photos is requested
- Selected images are stored as base64 data URLs in the application's data structure

## Troubleshooting

### "Google Photos Picker is not configured" error

Make sure you have:
1. Added the environment variables to `.env.local`
2. Restarted the development server after adding the variables
3. Used the correct prefix `NEXT_PUBLIC_` for the variables

### "Authorization failed" error

Check that:
1. Your OAuth client ID is correct
2. Your domain is added to the authorized JavaScript origins
3. The user is logged into a Google account
4. The Google Photos Library API is enabled in your project

### Images not loading

Verify that:
1. Your API key is correct
2. The API key has access to the Google Photos Library API
3. The API key restrictions (if any) include your domain
