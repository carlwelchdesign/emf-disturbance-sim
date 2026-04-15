/**
 * Performance Warning overlay component
 * Displays when too many sources are added
 */

'use client';

import { Alert, AlertTitle, Collapse } from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { SOURCE_LIMITS } from '../../types/source.types';

/**
 * PerformanceWarning component
 * Shows warning when approaching or exceeding recommended source limit
 */
export function PerformanceWarning() {
  const sourceCount = useLabStore((state) => state.sources.length);
  const performance = useLabStore((state) => state.performance);

  const recommendedLimit = Math.max(1, Math.floor(SOURCE_LIMITS.maxSources.v1 * 0.8));
  const isNearLimit = sourceCount >= recommendedLimit;
  const isAtLimit = sourceCount >= SOURCE_LIMITS.maxSources.v1;
  const isLowPerformance = performance.isLowPerformance;

  const showWarning = isNearLimit || isAtLimit || isLowPerformance;

  if (!showWarning) {
    return null;
  }

  return (
    <Collapse in={showWarning}>
      <Alert
        severity={isAtLimit || isLowPerformance ? 'error' : 'warning'}
        sx={{
          position: 'absolute',
          top: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          minWidth: 400,
          maxWidth: 600,
        }}
      >
        <AlertTitle>
          {isAtLimit
            ? 'Maximum Sources Reached'
            : isLowPerformance
            ? 'Performance Warning'
            : 'Approaching Source Limit'}
        </AlertTitle>
        {isAtLimit && (
          <>
            Maximum of {SOURCE_LIMITS.maxSources.v1} sources reached. Remove sources to add more.
          </>
        )}
        {!isAtLimit && isLowPerformance && (
          <>
            Frame rate below 30 FPS ({performance.currentFPS.toFixed(0)} FPS). Consider reducing source count or lowering visualization quality.
          </>
        )}
        {!isAtLimit && !isLowPerformance && isNearLimit && (
          <>
            {sourceCount} of {SOURCE_LIMITS.maxSources.v1} sources active. Performance may degrade with additional sources.
          </>
        )}
      </Alert>
    </Collapse>
  );
}
