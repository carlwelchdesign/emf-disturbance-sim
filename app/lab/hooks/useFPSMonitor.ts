'use client';

import { useEffect, useRef } from 'react';
import { useLabStore } from './useLabStore';
import { SMOOTHNESS_THRESHOLDS } from '../lib/visualization-helpers';

export function useFPSMonitor() {
  const updatePerformance = useLabStore((state) => state.updatePerformance);
  const recordAnimationFrameSample = useLabStore((state) => state.recordAnimationFrameSample);
  const setPerformanceDegradation = useLabStore((state) => state.setPerformanceDegradation);
  const evaluateSmoothnessWindow = useLabStore((state) => state.evaluateSmoothnessWindow);
  const animateFields = useLabStore((state) => state.settings.animateFields);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const lastFrameTime = useRef(performance.now());

  useEffect(() => {
    let animationFrame = 0;

    const tick = (time: number) => {
      frameCount.current += 1;
      const frameDurationMs = Math.max(0.0001, time - lastFrameTime.current);
      lastFrameTime.current = time;
      recordAnimationFrameSample({
        timestamp: Date.now(),
        frameDurationMs,
        animationActive: animateFields,
        interactionType: 'none',
        sceneMode: 'non-maxwell',
        maxwellVisible: false,
      });
      const elapsed = time - lastTime.current;

      if (elapsed >= 1000) {
        const fps = (frameCount.current * 1000) / elapsed;
        updatePerformance(fps);

        if (fps < 24) {
          setPerformanceDegradation({
            active: true,
            triggerCategory: 'frame-overload',
            startedAt: Date.now(),
            userMessage: 'Performance degraded temporarily — reducing detail for smoother animation.',
            recoveryState: 'recovering',
          });
        } else {
          const latest = evaluateSmoothnessWindow(SMOOTHNESS_THRESHOLDS.sampleWindowMs);
          if (latest?.meetsThreshold) {
            setPerformanceDegradation({
              active: false,
              triggerCategory: 'frame-overload',
              userMessage: 'Performance stable',
              recoveryState: 'restored',
            });
          }
        }

        frameCount.current = 0;
        lastTime.current = time;
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [
    animateFields,
    evaluateSmoothnessWindow,
    recordAnimationFrameSample,
    setPerformanceDegradation,
    updatePerformance,
  ]);
}
