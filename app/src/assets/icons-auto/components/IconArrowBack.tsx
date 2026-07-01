import React from 'react';
import { IconType } from '../icon.types';
import {
  Svg,
  Path,
  G,
  Defs,
  Polygon,
  Ellipse,
  Circle,
  Mask,
  Text,
  Stop,
  LinearGradient,
  ClipPath,
  RadialGradient,
  Rect,
} from 'react-native-svg';

const SvgIconArrowBack = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#656A74'}
        d="m15.5 20 7.5-7.5 1.05 1.05L17.6 20l6.45 6.45L23 27.5z"
      />
    </Svg>
  );
};

export default SvgIconArrowBack;
