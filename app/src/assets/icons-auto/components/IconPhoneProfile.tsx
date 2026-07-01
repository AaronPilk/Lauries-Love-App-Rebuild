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

const SvgIconPhoneProfile = (originalProps: IconType) => {
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
        d="M18.333 14.1v2.5a1.666 1.666 0 0 1-1.816 1.667 16.5 16.5 0 0 1-7.192-2.558 16.25 16.25 0 0 1-5-5 16.5 16.5 0 0 1-2.558-7.225 1.667 1.667 0 0 1 1.658-1.817h2.5A1.67 1.67 0 0 1 7.592 3.1c.105.8.301 1.586.583 2.342A1.67 1.67 0 0 1 7.8 7.2L6.742 8.26a13.33 13.33 0 0 0 5 5L12.8 12.2a1.67 1.67 0 0 1 1.758-.375c.757.283 1.542.478 2.342.584a1.667 1.667 0 0 1 1.433 1.691"
      />
    </Svg>
  );
};

export default SvgIconPhoneProfile;
