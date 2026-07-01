import React from 'react';
import { Slider as BaseSlider } from '@miblanchard/react-native-slider';
import SliderContainer from './slider.container';
import { CustomSliderProps, SliderValue } from './slider.model';
import { sliderStyles } from './slider.styles';

export default function CustomSlider(props: CustomSliderProps) {
  const { container, value, onChange, ...rest } = props;
  const [currenValue, setCurrentValue] = React.useState<number | number[]>(
    value ?? 0,
  );
  const onChangeValue = (val: SliderValue) => {
    setCurrentValue(val);
    onChange && onChange(val);
  };

  return (
    <SliderContainer
      {...container}
      value={currenValue}
      onChange={onChangeValue}
    >
      <BaseSlider {...rest} {...sliderStyles} />
    </SliderContainer>
  );
}
