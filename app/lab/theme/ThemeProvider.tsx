'use client';

import { useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createEmfTheme } from './theme';
import { useLabStore } from '../hooks/useLabStore';

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme provider wrapper for the EMF/RF Lab
 * Applies dark scientific theme and CSS baseline
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeMode = useLabStore((state) => state.settings.themeMode);
  const theme = useMemo(() => createEmfTheme(themeMode), [themeMode]);

  return (
    <MUIThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MUIThemeProvider>
  );
}
