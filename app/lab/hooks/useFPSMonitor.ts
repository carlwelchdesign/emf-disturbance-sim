'use client';

import { useEffect, useRef } from 'react';
import { useLabStore } from './useLabStore';

export function useFPSMonitor() {
  const updatePerformance = useLabStore((state) => state.updatePerformance);
  const setLOD = useLabStore((state) => state.setLOD);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());

  useEffect(() => {
    let animationFrame = 0;

    const tick = (time: number) => {
      frameCount.current += 1;
      const elapsed = time - lastTime.current;

      if (elapsed >= 1000) {
        const fps = (frameCount.current * 1000) / elapsed;
        updatePerformance(fps);
        setLOD(fps < 30 ? 'low' : fps < 45 ? 'medium' : 'high');
        frameCount.current = 0;
        lastTime.current = time;
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [updatePerformance, setLOD]);
}
