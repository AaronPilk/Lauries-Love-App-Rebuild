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

const SvgIconMailProfile = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M3.333 3.333h13.334c.916 0 1.666.75 1.666 1.667v10c0 .916-.75 1.666-1.666 1.666H3.333c-.916 0-1.666-.75-1.666-1.666V5c0-.917.75-1.667 1.666-1.667"
      />
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M18.333 5 10 10.833 1.667 5"
      />
    </Svg>
  );
};

export default SvgIconMailProfile;
