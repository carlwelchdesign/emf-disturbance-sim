'use client';
/**
 * Simulation Setup Validation UI
 * Displays configuration errors with actionable correction guidance.
 * Blocks run submission when blocking errors are present.
 *
 * A11Y-001: keyboard-accessible error focus management, ARIA alert roles.
 */
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Box, Typography, Alert, AlertTitle, List, ListItem, ListItemText,
  IconButton,
} from '@mui/material';
import { RunErrorRecord } from '../../types/maxwell.types';
import { mapErrorToUserFacing } from '../../modules/maxwell/core/error-message-mapper';

export interface SimulationSetupValidationProps {
  runId: string | null;
  errors?: RunErrorRecord[];
  className?: string;
}

export function SimulationSetupValidation({
  runId: _runId, // eslint-disable-line @typescript-eslint/no-unused-vars
  errors: propErrors,
  className,
}: SimulationSetupValidationProps) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const firstErrorRef = useRef<HTMLDivElement>(null);

  const allErrors = propErrors ?? [];
  const visibleErrors = allErrors.filter((e) => !dismissed.has(e.code));
  const blockingErrors = visibleErrors.filter((e) => e.blocking);
  const nonBlockingErrors = visibleErrors.filter((e) => !e.blocking);

  useEffect(() => {
    if (visibleErrors.length > 0 && firstErrorRef.current) {
      firstErrorRef.current.focus();
    }
  }, [visibleErrors.length]);

  const handleDismiss = useCallback((code: string) => {
    setDismissed((prev) => new Set([...prev, code]));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent, code: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleDismiss(code);
    }
  }, [handleDismiss]);

  if (visibleErrors.length === 0) {
    return (
      <Box
        role="region"
        aria-label="Simulation setup validation: no errors"
        className={className}
        sx={{ py: 0.5 }}
      >
        <Typography
          variant="caption"
          color="success.main"
          role="status"
          aria-live="polite"
          aria-label="Configuration is valid"
        >
          ✓ Configuration valid
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      role="region"
      aria-label={`Simulation setup validation: ${visibleErrors.length} error${visibleErrors.length !== 1 ? 's' : ''}`}
      className={className}
    >
      {blockingErrors.map((error, idx) => {
        const userError = mapErrorToUserFacing(error);
        return (
          <Alert
            key={error.code}
            severity="error"
            role="alert"
            aria-live="assertive"
            aria-atomic="true"
            ref={idx === 0 ? firstErrorRef : undefined}
            tabIndex={-1}
            sx={{ mb: 1 }}
            action={
              <IconButton
                size="small"
                onClick={() => handleDismiss(error.code)}
                onKeyDown={(e) => handleKeyDown(e, error.code)}
                aria-label={`Dismiss error: ${userError.title}`}
                tabIndex={0}
              >
                ✕
              </IconButton>
            }
          >
            <AlertTitle>{userError.title}</AlertTitle>
            <Typography variant="body2">{error.message}</Typography>
            {userError.recommendedActions.length > 0 && (
              <Box sx={{ mt: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                  Recommended actions:
                </Typography>
                <List dense disablePadding>
                  {userError.recommendedActions.map((action, i) => (
                    <ListItem key={i} disableGutters sx={{ py: 0 }}>
                      <ListItemText primary={`• ${action}`} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </Alert>
        );
      })}

      {nonBlockingErrors.map((error) => {
        const userError = mapErrorToUserFacing(error);
        return (
          <Alert
            key={error.code}
            severity="warning"
            role="alert"
            aria-live="polite"
            sx={{ mb: 1 }}
            action={
              <IconButton
                size="small"
                onClick={() => handleDismiss(error.code)}
                aria-label={`Dismiss warning: ${userError.title}`}
                tabIndex={0}
              >
                ✕
              </IconButton>
            }
          >
            <AlertTitle>{userError.title}</AlertTitle>
            <Typography variant="body2">{error.message}</Typography>
          </Alert>
        );
      })}

      {blockingErrors.length > 0 && (
        <Typography
          variant="caption"
          color="error"
          role="status"
          aria-live="assertive"
          aria-label={`${blockingErrors.length} blocking error${blockingErrors.length !== 1 ? 's' : ''} must be resolved before running`}
        >
          {blockingErrors.length} blocking error{blockingErrors.length !== 1 ? 's' : ''} — resolve before running
        </Typography>
      )}
    </Box>
  );
}
