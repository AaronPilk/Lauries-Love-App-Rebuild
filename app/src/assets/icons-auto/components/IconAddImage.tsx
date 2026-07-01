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

const SvgIconAddImage = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#fff'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M16 5h6M19 2v6M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5"
      />
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#fff'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4"
      />
    </Svg>
  );
};

export default SvgIconAddImage;
