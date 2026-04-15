import { render, fireEvent, act } from '@testing-library/react';
import { SliderProps as MuiSliderProps } from '@mui/material/Slider';
import { Slider } from '../../components/shared/Slider';

type MockSliderProps = Pick<MuiSliderProps, 'aria-label' | 'onChange'>;

jest.mock('@mui/material/Slider', () => ({
  __esModule: true,
  default: ({ onChange, ...props }: MockSliderProps) => (
    <input
      data-testid="slider"
      aria-label={props['aria-label']}
      onChange={(event) => onChange?.(event as unknown as Event, Number((event.target as HTMLInputElement).value), 0)}
    />
  ),
}));

describe('Slider throttling', () => {
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

    fireEvent.change(getByTestId('slider'), { target: { value: '42' } });
    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(20);
    });

    expect(onChange).toHaveBeenCalledWith(42);
  });
});
