'use client';

import React, { useEffect, useState } from 'react';
import { Button, Snackbar, Alert } from '@mui/material';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

interface GooglePhotosPickerProps {
  onImageSelected: (imageUrl: string) => void;
}

// Type definitions for Google Picker API
interface GooglePickerResponse {
  action: string;
  docs?: Array<{
    url?: string;
    thumbnails?: Array<{ url?: string }>;
  }>;
}

interface GoogleAuthResponse {
  access_token?: string;
  error?: string;
}

interface GoogleAuth2 {
  authorize: (
    config: { client_id: string; scope: string; immediate: boolean },
    callback: (response: GoogleAuthResponse) => void
  ) => void;
}

interface GooglePickerBuilder {
  addView: (view: unknown) => GooglePickerBuilder;
  setOAuthToken: (token: string) => GooglePickerBuilder;
  setDeveloperKey: (key: string) => GooglePickerBuilder;
  setCallback: (callback: (data: GooglePickerResponse) => void) => GooglePickerBuilder;
  build: () => { setVisible: (visible: boolean) => void };
}

interface GooglePicker {
  PickerBuilder: new () => GooglePickerBuilder;
  ViewId: {
    PHOTOS: unknown;
  };
}

interface GoogleAPI {
  load: (api: string, callback: () => void) => void;
  auth2?: GoogleAuth2;
}

// Extend the Window interface to include Google Photos Picker API
declare global {
  interface Window {
    google?: {
      picker?: GooglePicker;
    };
    gapi?: GoogleAPI;
  }
}

export default function GooglePhotosPicker({ onImageSelected }: GooglePhotosPickerProps) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    // Load Google API script
    const loadGoogleAPI = () => {
      if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
        setIsReady(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => setIsReady(true);
      script.onerror = () => setError('Failed to load Google Photos Picker API');
      document.body.appendChild(script);
    };

    loadGoogleAPI();
  }, []);

  const handleAuthorize = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

    if (!clientId || !apiKey) {
      setError(
        'Google Photos Picker is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID and NEXT_PUBLIC_GOOGLE_API_KEY environment variables.'
      );
      return;
    }

    if (!window.gapi) {
      setError('Google API not loaded');
      return;
    }

    window.gapi.load('auth2', () => {
      if (!window.gapi?.auth2) {
        setError('Google Auth2 not loaded');
        return;
      }
      window.gapi.auth2.authorize(
        {
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/photoslibrary.readonly',
          immediate: false,
        },
        (response: GoogleAuthResponse) => {
          if (response.error) {
            setError('Authorization failed: ' + response.error);
            return;
          }
          if (response.access_token) {
            openPicker(response.access_token, apiKey);
          }
        }
      );
    });
  };

  const openPicker = (token: string, apiKey: string) => {
    if (!window.google?.picker) {
      setError('Google Picker API not available');
      return;
    }

    if (!window.gapi) {
      setError('Google API not loaded');
      return;
    }

    window.gapi.load('picker', () => {
      if (!window.google?.picker) {
        setError('Google Picker API not available');
        return;
      }
      const picker = new window.google.picker.PickerBuilder()
        .addView(window.google.picker.ViewId.PHOTOS)
        .setOAuthToken(token)
        .setDeveloperKey(apiKey)
        .setCallback(pickerCallback)
        .build();
      picker.setVisible(true);
    });
  };

  const pickerCallback = async (data: GooglePickerResponse) => {
    if (data.action === 'picked' && data.docs && data.docs.length > 0) {
      const doc = data.docs[0];
      
      try {
        // Get the base URL of the photo
        const baseUrl = doc.url || doc.thumbnails?.[0]?.url;
        
        if (!baseUrl) {
          console.error('Google Photos API returned incomplete data:', doc);
          setError('Could not get photo URL from Google Photos. The photo may not be accessible.');
          return;
        }

        // Fetch and compress the image
        const response = await fetch(baseUrl);
        const blob = await response.blob();
        
        // Import compression utility
        const { compressImageFile } = await import('@/libs/imageCompression');
        const compressedBase64 = await compressImageFile(blob);
        onImageSelected(compressedBase64);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError('Failed to load photo: ' + errorMessage);
        console.error('Error loading photo from Google Photos:', err);
      }
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<PhotoLibraryIcon />}
        onClick={handleAuthorize}
        disabled={!isReady}
      >
        Google Photos
      </Button>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
