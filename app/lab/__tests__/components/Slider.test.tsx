import { render, fireEvent, act } from '@testing-library/react';
import { SliderProps as MuiSliderProps } from '@mui/material/Slider';
import { Slider } from '../../components/shared/Slider';
import { DualModeControl } from '../../components/shared/DualModeControl';

type MockSliderProps = Pick<MuiSliderProps, 'aria-label' | 'onChange' | 'value'>;

jest.mock('@mui/material/Slider', () => ({
  __esModule: true,
  default: ({ onChange, ...props }: MockSliderProps) => (
    <input
      data-testid={`slider-${props['aria-label']}`}
      aria-label={props['aria-label']}
      value={props.value as number}
      onChange={(event) => onChange?.(event as unknown as Event, Number((event.target as HTMLInputElement).value), 0)}
    />
  ),
}));

describe('Slider and dual-mode controls', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('debounces change callbacks', () => {
    const onChange = jest.fn();
    const { getByTestId } = render(<Slider aria-label="Test" onChange={onChange} />);

    fireEvent.change(getByTestId('slider-Test'), { target: { value: '42' } });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(20);
    });

    expect(onChange).toHaveBeenCalledWith(42);
  });

  it('keeps dual-mode slider and numeric input synchronized', () => {
    const onChange = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <DualModeControl label="Frequency" value={2.4} min={1} max={30} step={0.1} onChange={onChange} />
    );

    fireEvent.change(getByTestId('slider-Frequency'), { target: { value: '5' } });
    act(() => {
      jest.advanceTimersByTime(20);
    });
    expect(onChange).toHaveBeenCalledWith(5);

    fireEvent.change(getByLabelText(/Frequency numeric input/i), { target: { value: '6.5' } });
    expect(onChange).toHaveBeenCalledWith(6.5);
  });
});
