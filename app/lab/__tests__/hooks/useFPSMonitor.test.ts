import { renderHook } from '@testing-library/react';
import { useFPSMonitor } from '../../hooks/useFPSMonitor';

describe('useFPSMonitor', () => {
  it('mounts without throwing', () => {
    expect(() => renderHook(() => useFPSMonitor())).not.toThrow();
  });
});
