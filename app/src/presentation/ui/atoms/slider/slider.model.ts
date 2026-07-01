export type SliderValue = number | Array<number>;

export interface SliderContainerProps {
  trackMarks: Array<number>;
  value: SliderValue;
  onChange: (arg: SliderValue) => void;
}

export interface CustomSliderProps {
  container: Pick<SliderContainerProps, 'trackMarks'>;
  maximumValue: number;
  step: number;
  minimumValue: number;
  value?: SliderValue;
  onChange?: (arg: SliderValue) => void;
}
