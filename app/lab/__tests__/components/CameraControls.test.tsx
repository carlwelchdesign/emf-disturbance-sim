import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CameraControls } from '../../components/Canvas3D/CameraControls';

const handlers = {
  onMouseDown: jest.fn(),
  onMouseMove: jest.fn(),
  onMouseUp: jest.fn(),
  onWheel: jest.fn(),
};

jest.mock('../../hooks/useCameraControls', () => ({
  useCameraControls: () => handlers,
}));

describe('CameraControls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a full-surface camera control layer', () => {
    render(<CameraControls />);
    expect(screen.getByLabelText(/3d camera controls/i)).toBeInTheDocument();
  });

  it('dispatches drag and wheel interactions to camera handlers', () => {
    render(<CameraControls />);
    const layer = screen.getByLabelText(/3d camera controls/i);
    fireEvent.mouseDown(layer);
    fireEvent.mouseMove(layer);
    fireEvent.mouseUp(layer);
    fireEvent.wheel(layer);

    expect(handlers.onMouseDown).toHaveBeenCalled();
    expect(handlers.onMouseMove).toHaveBeenCalled();
    expect(handlers.onMouseUp).toHaveBeenCalled();
    expect(handlers.onWheel).toHaveBeenCalled();
  });

  it('ends drag interaction when pointer leaves layer', () => {
    render(<CameraControls />);
    const layer = screen.getByLabelText(/3d camera controls/i);
    fireEvent.mouseLeave(layer);
    expect(handlers.onMouseUp).toHaveBeenCalled();
  });
});
