'use client';

import { useRef, useCallback } from 'react';
import { createSimulationEngine } from '../modules/simulation/simulation-engine';
import { ISimulationEngine } from '../modules/simulation/types';
import { RFSource } from '../types/source.types';

/**
 * Hook for field calculation using the simulation engine
 * Provides memoized calculation functions to avoid recreating the engine
 */
export function useFieldCalculator() {
  const engineRef = useRef<ISimulationEngine | null>(null);

  // Initialize engine on first use
  if (!engineRef.current) {
    engineRef.current = createSimulationEngine();
  }

  const engine = engineRef.current;

  /**
   * Calculate field at a single point
   */
  const calculateFieldAtPoint = useCallback(
    (point: { x: number; y: number; z: number }, sources: RFSource[], time?: number) => {
      return engine.calculateFieldAtPoint(point, sources, time);
    },
    [engine]
  );

  /**
   * Calculate field grid for visualization
   */
  const calculateFieldGrid = useCallback(
    (
      resolution: number,
      bounds: { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } },
      sources: RFSource[],
      time?: number
    ) => {
      return engine.calculateFieldGrid(resolution, bounds, sources, time);
    },
    [engine]
  );

  /**
   * Get backend name
   */
  const getBackendName = useCallback(() => {
    return engine.getBackendName();
  }, [engine]);

  /**
   * Check if ready
   */
  const isReady = useCallback(() => {
    return engine.isReady();
  }, [engine]);

  return {
    calculateFieldAtPoint,
    calculateFieldGrid,
    getBackendName,
    isReady,
  };
}
