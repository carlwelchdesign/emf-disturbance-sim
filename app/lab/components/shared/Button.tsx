'use client';

import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';

/**
 * Button component wrapping MUI Button
 * Provides consistent styling and accessibility
 */
export interface ButtonProps extends MuiButtonProps {
  /**
   * ARIA label for accessibility (required if no visible text)
   */
  'aria-label'?: string;
}

export function Button(props: ButtonProps) {
  return <MuiButton {...props} />;
}
