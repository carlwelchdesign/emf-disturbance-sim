import { renderHook, act } from '@testing-library/react';
import { useFPSMonitor } from '../../hooks/useFPSMonitor';
import { useLabStore } from '../../hooks/useLabStore';

jest.mock('../../hooks/useLabStore');

describe('useFPSMonitor', () => {
  const mockUpdatePerformance = jest.fn();
  const mockSetLOD = jest.fn();
  const storeState = {
    updatePerformance: mockUpdatePerformance,
    setLOD: mockSetLOD,
    settings: { lod: 'high' as const },
  };

  let rafCallback: FrameRequestCallback | null = null;

  beforeEach(() => {
    rafCallback = null;
    mockUpdatePerformance.mockClear();
    mockSetLOD.mockClear();

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

  it('reduces quality after sustained low fps', () => {
    renderHook(() => useFPSMonitor());

    act(() => {
      rafCallback?.(1000);
    });

    expect(mockUpdatePerformance).toHaveBeenCalledWith(expect.any(Number));
    expect(mockSetLOD).toHaveBeenCalledWith('low');
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
});
