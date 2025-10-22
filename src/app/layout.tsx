"use client";

import Head from "next/head";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <Head>
          <title>Family Tree Builder</title>
          <meta name="description" content="Family Tree Builder which saves the structure offline and localised" />
          <meta name="keywords" content="Family Tree" />
          <meta property="og:title" content="Family Tree Builder" />
          <meta property="og:description" content="Family Tree Builder which saves the structure offline and localised" />
          <meta property="og:type" content="website" />
        </Head>
        {children}
      </body>
    </html>
  );
}
