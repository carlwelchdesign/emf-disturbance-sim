'use client';

import { useEffect, useRef } from 'react';
import { useLabStore } from './useLabStore';

export function useFPSMonitor() {
  const updatePerformance = useLabStore((state) => state.updatePerformance);
  const setLOD = useLabStore((state) => state.setLOD);
  const currentLOD = useLabStore((state) => state.settings.lod);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const recoveryStreak = useRef(0);
  const lowStreak = useRef(0);

  useEffect(() => {
    let animationFrame = 0;

    const tick = (time: number) => {
      frameCount.current += 1;
      const elapsed = time - lastTime.current;

      if (elapsed >= 1000) {
        const fps = (frameCount.current * 1000) / elapsed;
        updatePerformance(fps);
        const nextLod = fps < 30 ? 'low' : fps < 45 ? 'medium' : 'high';

        if (nextLod === 'low') {
          lowStreak.current += 1;
          recoveryStreak.current = 0;
        } else if (nextLod === 'high') {
          recoveryStreak.current += 1;
          lowStreak.current = 0;
        } else {
          lowStreak.current = 0;
          recoveryStreak.current = 0;
        }

        const stableLod =
          nextLod === 'low'
            ? 'low'
            : nextLod === 'medium'
            ? 'medium'
            : recoveryStreak.current >= 2
            ? 'high'
            : currentLOD === 'low'
            ? 'medium'
            : 'high';

        if (stableLod !== currentLOD) {
          setLOD(stableLod);
        }

        frameCount.current = 0;
        lastTime.current = time;
      }

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [currentLOD, updatePerformance, setLOD]);
}
