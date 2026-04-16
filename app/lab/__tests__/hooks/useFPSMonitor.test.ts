import { renderHook, act } from '@testing-library/react';
import { useFPSMonitor } from '../../hooks/useFPSMonitor';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('useFPSMonitor', () => {
  const mockUpdatePerformance = jest.fn();
  const mockRecordAnimationFrameSample = jest.fn();
  const mockSetPerformanceDegradation = jest.fn();
  const mockEvaluateSmoothnessWindow = jest.fn(() => ({ meetsThreshold: true }));
  const storeState = {
    updatePerformance: mockUpdatePerformance,
    recordAnimationFrameSample: mockRecordAnimationFrameSample,
    setPerformanceDegradation: mockSetPerformanceDegradation,
    evaluateSmoothnessWindow: mockEvaluateSmoothnessWindow,
    settings: { lod: 'high' as const, animateFields: true },
  };

  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    rafCallback = null;
    mockUpdatePerformance.mockClear();
    mockRecordAnimationFrameSample.mockClear();
    mockSetPerformanceDegradation.mockClear();
    mockEvaluateSmoothnessWindow.mockClear();

    (useLabStore as unknown as jest.Mock).mockImplementation((selector?: (state: typeof storeState) => unknown) => {
      if (typeof selector === 'function') {
        return selector(storeState);
      }
      return storeState;
    });

    jest.spyOn(performance, 'now').mockReturnValue(0);
    global.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      rafCallback = callback;
      return 1;
    }) as unknown as typeof requestAnimationFrame;
    global.cancelAnimationFrame = jest.fn() as unknown as typeof cancelAnimationFrame;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mounts without throwing', () => {
    expect(() => renderHook(() => useFPSMonitor())).not.toThrow();
  });

  it('tracks fps without auto-changing lod', () => {
    renderHook(() => useFPSMonitor());

    act(() => {
      rafCallback?.(1000);
    });

    expect(mockUpdatePerformance).toHaveBeenCalledWith(expect.any(Number));
  });

  it('records fps updates for observability thresholds', () => {
    renderHook(() => useFPSMonitor());
    act(() => {
      rafCallback?.(1000);
    });

    const fpsValues = mockUpdatePerformance.mock.calls.map((call) => call[0]);
    expect(fpsValues.length).toBeGreaterThan(0);
    expect(fpsValues.every((value: number) => Number.isFinite(value))).toBe(true);
  });

  it('records frame telemetry samples and updates degradation telemetry', () => {
    mockEvaluateSmoothnessWindow.mockReturnValue({ meetsThreshold: true });
    renderHook(() => useFPSMonitor());

    act(() => {
      rafCallback?.(16);
      rafCallback?.(1030);
    });

    expect(mockRecordAnimationFrameSample).toHaveBeenCalled();
    expect(mockSetPerformanceDegradation).toHaveBeenCalled();
  });
});
