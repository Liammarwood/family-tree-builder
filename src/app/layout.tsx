"use client";

import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Family Tree Builder</title>
        <meta name="description" content="Family Tree Builder which saves the structure offline and localised" />
        <meta name="keywords" content="Family Tree" />
        <meta property="og:title" content="Family Tree Builder" />
        <meta property="og:description" content="Family Tree Builder which saves the structure offline and localised" />
        <meta property="og:type" content="website" />
        
        {/* PWA Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#1976d2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FamilyTree" />
        
        {/* Manifest Link */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Icons */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body
        className={`antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
