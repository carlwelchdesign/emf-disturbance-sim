'use client';

import { useCallback, useEffect, useMemo } from 'react';
import MuiSlider, { SliderProps as MuiSliderProps } from '@mui/material/Slider';
import { debounce } from '@mui/material/utils';

/**
 * Slider component wrapping MUI Slider
 * Includes throttling/debouncing for performance
 */
export interface SliderProps extends Omit<MuiSliderProps, 'onChange'> {
  /**
   * Callback when value changes (debounced for performance)
   */
  onChange?: (value: number | number[]) => void;

  /**
   * Debounce delay in milliseconds (default: 16ms for 60fps)
   */
  debounceMs?: number;

  /**
   * ARIA label for accessibility (required)
   */
  'aria-label': string;
}

export function Slider({
  onChange,
  debounceMs = 16,
  ...props
}: SliderProps) {
  const debouncedOnChange = useMemo(
    () =>
      debounce((value: number | number[]) => {
        onChange?.(value);
      }, debounceMs),
    [onChange, debounceMs]
  );

  useEffect(() => {
    return () => {
      debouncedOnChange.clear();
    };
  }, [debouncedOnChange]);

  const handleChange = useCallback(
    (_event: Event, value: number | number[]) => {
      debouncedOnChange(value);
    },
    [debouncedOnChange]
  );

  return <MuiSlider {...props} onChange={handleChange} />;
}
