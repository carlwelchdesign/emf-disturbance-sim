'use client';
/**
 * Maxwell Run Status Banner
 * Surfaces instability/rejection alerts with keyboard-dismissible UI and ARIA live announcements.
 *
 * A11Y-001: keyboard-dismissible alerts, ARIA live announcement, focus management.
 */
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  Box, Alert, AlertTitle, Typography, Collapse, Stack, IconButton,
} from '@mui/material';
import { useLabStore } from '../../hooks/useLabStore';
import { useActiveRunId, useMaxwellRuns } from '../../hooks/useMaxwellRunSelectors';
import { RunErrorRecord } from '../../types/maxwell.types';
import { mapErrorToUserFacing } from '../../modules/maxwell/core/error-message-mapper';

const ALERT_STATUS_MAP: Record<string, { severity: 'error' | 'warning' | 'info' | 'success'; label: string }> = {
  validated: { severity: 'success', label: 'Run Validated' },
  non_validated: { severity: 'warning', label: 'Run Not Validated' },
  unstable: { severity: 'error', label: 'Instability Detected' },
  failed: { severity: 'error', label: 'Run Failed' },
  rejected: { severity: 'error', label: 'Run Rejected' },
  running: { severity: 'info', label: 'Run In Progress' },
  queued: { severity: 'info', label: 'Run Queued' },
};

export interface MaxwellRunStatusBannerProps {
  runId?: string | null;
  errors?: RunErrorRecord[];
  className?: string;
}

export function MaxwellRunStatusBanner({
  runId: propRunId,
  errors: propErrors,
  className,
}: MaxwellRunStatusBannerProps) {
  const activeRunId = useActiveRunId();
  const runs = useMaxwellRuns();
  const storeErrors = useLabStore((s) => s.maxwellErrors);

  const runId = propRunId !== undefined ? propRunId : activeRunId;
  const run = runs.find((r) => r.runId === runId);
  const errors = propErrors ?? (runId ? (storeErrors[runId] ?? []) : []);

  const [dismissed, setDismissed] = useState(false);
  const alertRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissed(false);
  }, [runId]);

  useEffect(() => {
    if (errors.length > 0 && alertRef.current) {
      alertRef.current.focus();
    }
  }, [errors.length]);

  const handleDismiss = useCallback(() => setDismissed(true), []);
  const handleDismissKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
      e.preventDefault();
      handleDismiss();
    }
  }, [handleDismiss]);

  const status = run?.status;
  const statusInfo = status ? ALERT_STATUS_MAP[status] : null;

  const hasErrors = errors.length > 0;
  const isNonValidatedStatus = status && ['unstable', 'failed', 'rejected', 'non_validated'].includes(status);

  if (!hasErrors && !isNonValidatedStatus && !statusInfo) {
    return (
      <Box
        aria-live="polite"
        aria-atomic="true"
        role="region"
        aria-label="Maxwell run status"
        className={className}
      />
    );
  }

  return (
    <Box
      role="region"
      aria-label="Maxwell solver run status"
      className={className}
    >
      {/* ARIA live region for screen reader announcements */}
      <Box
        aria-live="assertive"
        aria-atomic="true"
        aria-relevant="all"
        sx={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
      >
        {hasErrors && `Alert: ${errors.map((e) => e.message).join('. ')}`}
        {isNonValidatedStatus && !hasErrors && `Run status: ${status}`}
      </Box>

      {statusInfo && !dismissed && (
        <Collapse in={!dismissed}>
          <Alert
            severity={statusInfo.severity}
            role="alert"
            aria-live={statusInfo.severity === 'error' ? 'assertive' : 'polite'}
            aria-atomic="true"
            ref={alertRef}
            tabIndex={-1}
            sx={{ mb: hasErrors ? 1 : 0 }}
            action={
              <IconButton
                size="small"
                onClick={handleDismiss}
                onKeyDown={handleDismissKeyDown}
                aria-label="Dismiss status banner"
                tabIndex={0}
              >
                ✕
              </IconButton>
            }
          >
            <AlertTitle>{statusInfo.label}</AlertTitle>
            {run?.statusReason && (
              <Typography variant="body2">{run.statusReason}</Typography>
            )}
          </Alert>
        </Collapse>
      )}

      {hasErrors && (
        <Stack spacing={1}>
          {errors.map((error, idx) => {
            const userError = mapErrorToUserFacing(error);
            return (
              <Alert
                key={`${error.code}-${idx}`}
                severity={userError.severity}
                role="alert"
                aria-live={error.blocking ? 'assertive' : 'polite'}
                aria-atomic="true"
                tabIndex={idx === 0 ? -1 : undefined}
                ref={idx === 0 && !dismissed ? alertRef : undefined}
              >
                <AlertTitle>{userError.title}</AlertTitle>
                <Typography variant="body2">{error.message}</Typography>
                {userError.recommendedActions.length > 0 && (
                  <Box sx={{ mt: 0.5 }} role="list" aria-label="Recommended corrective actions">
                    {userError.recommendedActions.map((action, i) => (
                      <Typography
                        key={i}
                        variant="caption"
                        sx={{ display: 'block' }}
                        role="listitem"
                        aria-label={action}
                      >
                        → {action}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Alert>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
