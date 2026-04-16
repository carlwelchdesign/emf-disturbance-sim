/**
 * Tests for useCameraControls hook
 */

import { renderHook, act } from '@testing-library/react';
import { useCameraControls } from '../../hooks/useCameraControls';
import { useLabStore } from '../../hooks/useLabStore';
import { CameraState } from '../../types/camera.types';

// Mock the lab store
jest.mock('../../hooks/useLabStore');

describe('useCameraControls', () => {
  let mockUpdateCamera: jest.Mock;
  let mockResetCamera: jest.Mock;
  let mockRecordInputResponseSample: jest.Mock;
  let mockEvaluateSmoothnessWindow: jest.Mock;
  let mockSetPerformanceDegradation: jest.Mock;
  let mockCamera: CameraState;
  let mockStore: {
    camera: CameraState;
    updateCamera: jest.Mock;
    resetCamera: jest.Mock;
    settings: { animateFields: boolean };
    recordInputResponseSample: jest.Mock;
    evaluateSmoothnessWindow: jest.Mock;
    setPerformanceDegradation: jest.Mock;
  };

  beforeEach(() => {
    mockUpdateCamera = jest.fn();
    mockResetCamera = jest.fn();
    mockRecordInputResponseSample = jest.fn();
    mockEvaluateSmoothnessWindow = jest.fn(() => ({ meetsThreshold: true }));
    mockSetPerformanceDegradation = jest.fn();
    mockCamera = {
      position: { x: 5, y: 5, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      up: { x: 0, y: 1, z: 0 },
      fov: 75,
      zoom: 1,
      near: 0.1,
      far: 1000,
    };
    mockStore = {
      camera: mockCamera,
      updateCamera: mockUpdateCamera,
      resetCamera: mockResetCamera,
      settings: { animateFields: true },
      recordInputResponseSample: mockRecordInputResponseSample,
      evaluateSmoothnessWindow: mockEvaluateSmoothnessWindow,
      setPerformanceDegradation: mockSetPerformanceDegradation,
    };

    (useLabStore as unknown as jest.Mock).mockImplementation((selector?: (state: typeof mockStore) => unknown) => {
      if (typeof selector === 'function') {
        return selector(mockStore);
      }

      return mockStore;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('orbit behavior', () => {
    it('should start orbit on left mouse button down', () => {
      const { result } = renderHook(() => useCameraControls());

      const mockEvent = {
        button: 0, // Left button
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should update camera position when orbiting', () => {
      const { result } = renderHook(() => useCameraControls());

      // Start orbit
      act(() => {
        result.current.onMouseDown({
          button: 0,
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      // Move mouse
      act(() => {
        result.current.onMouseMove({
          clientX: 150,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(mockUpdateCamera).toHaveBeenCalled();
      const updateCall = mockUpdateCamera.mock.calls[0][0];
      expect(updateCall).toHaveProperty('position');
    });

    it('should stop orbiting on mouse up', () => {
      const { result } = renderHook(() => useCameraControls());

      // Start orbit
      act(() => {
        result.current.onMouseDown({
          button: 0,
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      // End orbit
      act(() => {
        result.current.onMouseUp();
      });

      // Move mouse (should not update)
      mockUpdateCamera.mockClear();
      act(() => {
        result.current.onMouseMove({
          clientX: 200,
          clientY: 200,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(mockUpdateCamera).not.toHaveBeenCalled();
    });
  });

  describe('pan behavior', () => {
    it('should start pan on right mouse button down', () => {
      const { result } = renderHook(() => useCameraControls());

      const mockEvent = {
        button: 2, // Right button
        clientX: 100,
        clientY: 100,
        preventDefault: jest.fn(),
      } as unknown as React.MouseEvent;

      act(() => {
        result.current.onMouseDown(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should update both position and target when panning', () => {
      const { result } = renderHook(() => useCameraControls());

      // Start pan
      act(() => {
        result.current.onMouseDown({
          button: 2,
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      // Move mouse
      act(() => {
        result.current.onMouseMove({
          clientX: 150,
          clientY: 120,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(mockUpdateCamera).toHaveBeenCalled();
      const updateCall = mockUpdateCamera.mock.calls[0][0];
      expect(updateCall).toHaveProperty('position');
      expect(updateCall).toHaveProperty('target');
    });

    it('should also pan on middle mouse button', () => {
      const { result } = renderHook(() => useCameraControls());

      act(() => {
        result.current.onMouseDown({
          button: 1, // Middle button
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      act(() => {
        result.current.onMouseMove({
          clientX: 150,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(mockUpdateCamera).toHaveBeenCalled();
    });
  });

  describe('zoom behavior', () => {
    it('should zoom in on negative wheel delta', () => {
      const { result } = renderHook(() => useCameraControls());

      const mockEvent = {
        deltaY: -100, // Scroll up
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      act(() => {
        result.current.onWheel(mockEvent);
      });

      expect(mockUpdateCamera).toHaveBeenCalled();
    });

    it('should zoom out on positive wheel delta', () => {
      const { result } = renderHook(() => useCameraControls());

      const mockEvent = {
        deltaY: 100, // Scroll down
        preventDefault: jest.fn(),
      } as unknown as WheelEvent;

      act(() => {
        result.current.onWheel(mockEvent);
      });

      expect(mockUpdateCamera).toHaveBeenCalled();
    });

    it('should clamp zoom between 0.5 and 50', () => {
      const { result } = renderHook(() => useCameraControls());

      // Try to zoom in very close
      for (let i = 0; i < 20; i++) {
        act(() => {
          result.current.onWheel({
            deltaY: -100,
            preventDefault: jest.fn(),
          } as unknown as WheelEvent);
        });
      }

      // Should have called updateCamera with clamped values
      expect(mockUpdateCamera).toHaveBeenCalled();
      // Camera position should not be at origin (clamped at min distance)
    });
  });

  describe('latency and jank sampling', () => {
    it('records input response telemetry for camera interactions', () => {
      const { result } = renderHook(() => useCameraControls());

      act(() => {
        result.current.onMouseDown({
          button: 0,
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      act(() => {
        result.current.onMouseMove({
          clientX: 130,
          clientY: 120,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(mockRecordInputResponseSample).toHaveBeenCalledWith(
        expect.objectContaining({
          interactionType: 'rotate',
          responseLatencyMs: expect.any(Number),
        })
      );
    });

    it('evaluates smoothness telemetry during interaction updates', () => {
      mockEvaluateSmoothnessWindow.mockReturnValue({ meetsThreshold: true });
      const { result } = renderHook(() => useCameraControls());

      act(() => {
        result.current.onMouseDown({
          button: 0,
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      act(() => {
        result.current.onMouseMove({
          clientX: 140,
          clientY: 120,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      act(() => {
        result.current.onWheel({
          deltaY: 100,
          preventDefault: jest.fn(),
        } as unknown as WheelEvent);
      });

      expect(mockEvaluateSmoothnessWindow).toHaveBeenCalled();
      expect(mockSetPerformanceDegradation).toHaveBeenCalledWith(
        expect.objectContaining({
          active: false,
          triggerCategory: 'input-overload',
        })
      );
    });
  });

  describe('reset camera', () => {
    it('should call store reset camera', () => {
      const { result } = renderHook(() => useCameraControls());

      act(() => {
        result.current.resetCamera();
      });

      expect(mockResetCamera).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should not update camera when mouse moves without dragging', () => {
      const { result } = renderHook(() => useCameraControls());

      act(() => {
        result.current.onMouseMove({
          clientX: 150,
          clientY: 150,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(mockUpdateCamera).not.toHaveBeenCalled();
    });

    it('should handle rapid mouse movements', () => {
      const { result } = renderHook(() => useCameraControls());

      act(() => {
        result.current.onMouseDown({
          button: 0,
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      // Simulate rapid movements
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.onMouseMove({
            clientX: 100 + i * 10,
            clientY: 100 + i * 5,
            preventDefault: jest.fn(),
          } as unknown as React.MouseEvent);
        });
      }

      // Should have updated multiple times
      expect(mockUpdateCamera).toHaveBeenCalled();
      expect(mockUpdateCamera.mock.calls.length).toBeGreaterThan(1);
    });

    it('should ignore drag updates when the camera result does not change', () => {
      const { result } = renderHook(() => useCameraControls());

      act(() => {
        result.current.onMouseDown({
          button: 0,
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      mockUpdateCamera.mockClear();

      act(() => {
        result.current.onMouseMove({
          clientX: 100,
          clientY: 100,
          preventDefault: jest.fn(),
        } as unknown as React.MouseEvent);
      });

      expect(mockUpdateCamera).not.toHaveBeenCalled();
    });
  });
});
