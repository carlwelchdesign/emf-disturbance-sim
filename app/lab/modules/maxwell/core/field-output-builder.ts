/**
 * Field Output Packing — creates time-indexed FieldOutputSet from FDTD snapshots.
 */
import { FieldOutputSet, FieldTensor, GridSpec } from '../../../types/maxwell.types';

export function buildFieldOutput(
  runId: string,
  timeAxis: number[],
  electricSnapshots: { step: number; time: number; ex: number[]; ey: number[]; ez: number[] }[],
  magneticSnapshots: { step: number; time: number; ex: number[]; ey: number[]; ez: number[] }[],
  nx: number, ny: number, nz: number,
  dx: number, dy: number, dz: number,
): FieldOutputSet {
  const grid: GridSpec = { nx, ny, nz, dx, dy, dz };

  const electricFieldSeries: FieldTensor[] = electricSnapshots.map((s) => ({
    step: s.step,
    time: s.time,
    ex: s.ex,
    ey: s.ey,
    ez: s.ez,
  }));

  const magneticFieldSeries: FieldTensor[] = magneticSnapshots.map((s) => ({
    step: s.step,
    time: s.time,
    ex: s.ex,
    ey: s.ey,
    ez: s.ez,
  }));

  return {
    runId,
    timeAxis,
    electricFieldSeries,
    magneticFieldSeries,
    samplingMetadata: {
      grid,
      units: 'V/m',
      coordinateSystem: 'cartesian',
    },
    validationStatus: 'non_validated',
  };
}
