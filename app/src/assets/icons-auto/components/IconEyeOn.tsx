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

const SvgIconEyeOn = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#A6A6A6'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8"
      />
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#A6A6A6'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6"
      />
    </Svg>
  );
};

export default SvgIconEyeOn;
