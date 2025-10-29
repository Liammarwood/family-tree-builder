"use client";
import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { useConfiguration } from '@/hooks/useConfiguration';

type Props = {
  children: React.ReactNode;
}

export default function ThemeFromConfig({ children }: Props) {
  const { nodeColor, fontFamily } = useConfiguration();

  const theme = React.useMemo(() => createTheme({
    palette: {
      primary: {
        main: nodeColor || '#1976d2',
      },
    },
    typography: {
      fontFamily: fontFamily || undefined,
    },
  }), [nodeColor, fontFamily]);

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
