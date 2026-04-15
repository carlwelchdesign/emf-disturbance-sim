import { createTheme } from '@mui/material/styles';
import { ThemeMode } from '../types/visualization.types';

const sharedPalette = {
  primary: {
    main: '#38bdf8',
    light: '#7dd3fc',
    dark: '#0284c7',
  },
  secondary: {
    main: '#94a3b8',
    light: '#cbd5e1',
    dark: '#64748b',
  },
  error: {
    main: '#ef4444',
  },
  warning: {
    main: '#f59e0b',
  },
  success: {
    main: '#10b981',
  },
  info: {
    main: '#6366f1',
  },
};

/**
 * MUI theme for the EMF/RF Visualization Lab
 */
export function createEmfTheme(mode: ThemeMode) {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      ...sharedPalette,
      background: isDark
        ? {
            default: '#020617',
            paper: '#0f172a',
          }
        : {
            default: '#f8fafc',
            paper: '#ffffff',
          },
      text: isDark
        ? {
            primary: '#f1f5f9',
            secondary: '#94a3b8',
          }
        : {
            primary: '#0f172a',
            secondary: '#475569',
          },
    },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Keep button text readable
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12, // Rounded corners for modern feel
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          overflow: 'hidden',
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableRipple: false, // Keep ripple for better feedback
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          // Visible focus indicator
          '&:focus-visible': {
            outline: '2px solid #38bdf8',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
            // Visible focus indicator for keyboard navigation
            '&:focus-visible, &.Mui-focusVisible': {
              boxShadow: '0 0 0 4px rgba(56, 189, 248, 0.3)',
            },
          },
          '& .MuiSlider-track': {
            transition: 'background-color 0.2s',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          // Visible focus indicator
          '&:focus-visible': {
            outline: '2px solid #38bdf8',
            outlineOffset: '2px',
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          // Visible focus indicator
          '&:focus-visible': {
            outline: '2px solid #38bdf8',
            outlineOffset: '-2px',
          },
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e293b',
          fontSize: '0.875rem',
          padding: '8px 12px',
          borderRadius: 6,
        },
      },
    },
  },
  });
}
