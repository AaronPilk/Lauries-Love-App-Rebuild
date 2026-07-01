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

const SvgIconCheck = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 12 12"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#0E0E0E'}
        d="M10.375.75h-8.75a.875.875 0 0 0-.875.875v8.75a.875.875 0 0 0 .875.875h8.75a.875.875 0 0 0 .875-.875v-8.75a.875.875 0 0 0-.875-.875m-1.75 6.125h-5.25v-1.75h5.25z"
      />
    </Svg>
  );
};

export default SvgIconCheck;
