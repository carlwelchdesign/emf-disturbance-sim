'use client';
/**
 * MaxwellFieldOverlay — time-indexed field visualization overlay for Maxwell run outputs.
 * Extends existing field visualization with keyboard-accessible time-navigation.
 *
 * A11Y-001: Full keyboard navigation, tabIndex, ARIA roles and labels.
 */
import React, { useCallback } from 'react';
import { Box, IconButton, Slider, Typography, Tooltip } from '@mui/material';
import { useActiveFieldOutput } from '../../hooks/useMaxwellRunSelectors';
import { useLabStore } from '../../hooks/useLabStore';

export interface MaxwellFieldOverlayProps {
  className?: string;
}

export function MaxwellFieldOverlay({ className }: MaxwellFieldOverlayProps) {
  const fieldOutput = useActiveFieldOutput();
  const currentStep = useLabStore((s) => s.maxwellCurrentStep);
  const setCurrentStep = useLabStore((s) => s.setMaxwellCurrentStep);

  const timeAxis = fieldOutput?.timeAxis ?? [];
  const totalSteps = timeAxis.length;

  const goFirst = useCallback(() => setCurrentStep(0), [setCurrentStep]);
  const goPrev = useCallback(() => setCurrentStep(Math.max(0, currentStep - 1)), [setCurrentStep, currentStep]);
  const goNext = useCallback(() => setCurrentStep(Math.min(totalSteps - 1, currentStep + 1)), [setCurrentStep, currentStep, totalSteps]);
  const goLast = useCallback(() => setCurrentStep(totalSteps - 1), [setCurrentStep, totalSteps]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft': e.preventDefault(); goPrev(); break;
      case 'ArrowRight': e.preventDefault(); goNext(); break;
      case 'Home': e.preventDefault(); goFirst(); break;
      case 'End': e.preventDefault(); goLast(); break;
    }
  }, [goPrev, goNext, goFirst, goLast]);

  if (!fieldOutput || totalSteps === 0) {
    return null;
  }

  const currentTime = timeAxis[currentStep] ?? 0;
  const validationStatus = fieldOutput.validationStatus;

  return (
    <Box
      role="region"
      aria-label="Maxwell field time navigation"
      className={className}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        bgcolor: 'rgba(0,0,0,0.7)',
        borderRadius: 1,
        p: 1,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        zIndex: 10,
      }}
      onKeyDown={handleKeyDown}
    >
      {/* Validation status badge */}
      <Box
        role="status"
        aria-label={`Validation status: ${validationStatus}`}
        sx={{
          px: 1,
          py: 0.25,
          borderRadius: 0.5,
          bgcolor: validationStatus === 'validated' ? 'success.dark' : 'warning.dark',
          color: 'white',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          textTransform: 'uppercase',
        }}
      >
        {validationStatus === 'validated' ? 'Validated' : 'Unvalidated'}
      </Box>

      <Tooltip title="First step (Home)">
        <IconButton
          size="small"
          onClick={goFirst}
          disabled={currentStep === 0}
          aria-label="Go to first time step"
          tabIndex={0}
          sx={{ color: 'white' }}
        >
          ⏮
        </IconButton>
      </Tooltip>

      <Tooltip title="Previous step (←)">
        <IconButton
          size="small"
          onClick={goPrev}
          disabled={currentStep === 0}
          aria-label="Go to previous time step"
          tabIndex={0}
          sx={{ color: 'white' }}
        >
          ◀
        </IconButton>
      </Tooltip>

      {/* Time slider */}
      <Box sx={{ width: 160, px: 1 }}>
        <Slider
          value={currentStep}
          min={0}
          max={Math.max(0, totalSteps - 1)}
          step={1}
          onChange={(_, v) => setCurrentStep(v as number)}
          aria-label="Time step selector"
          aria-valuetext={`Step ${currentStep + 1} of ${totalSteps}, t = ${currentTime.toExponential(2)} s`}
          size="small"
          sx={{ color: 'white' }}
          tabIndex={0}
        />
      </Box>

      <Tooltip title="Next step (→)">
        <IconButton
          size="small"
          onClick={goNext}
          disabled={currentStep >= totalSteps - 1}
          aria-label="Go to next time step"
          tabIndex={0}
          sx={{ color: 'white' }}
        >
          ▶
        </IconButton>
      </Tooltip>

      <Tooltip title="Last step (End)">
        <IconButton
          size="small"
          onClick={goLast}
          disabled={currentStep >= totalSteps - 1}
          aria-label="Go to last time step"
          tabIndex={0}
          sx={{ color: 'white' }}
        >
          ⏭
        </IconButton>
      </Tooltip>

      {/* Current time display */}
      <Typography
        variant="caption"
        sx={{ color: 'white', minWidth: 80 }}
        aria-live="polite"
        aria-label={`Current time: ${currentTime.toExponential(2)} seconds, step ${currentStep + 1} of ${totalSteps}`}
      >
        t = {currentTime.toExponential(2)} s
      </Typography>
    </Box>
  );
}
