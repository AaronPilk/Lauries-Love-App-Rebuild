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

const SvgIconFileTextProfile = (originalProps: IconType) => {
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
        d="M11.667 1.667H5a1.667 1.667 0 0 0-1.667 1.667v13.333A1.667 1.667 0 0 0 5 18.334h10a1.666 1.666 0 0 0 1.667-1.667v-10z"
      />
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M11.667 1.667v5h5M13.333 10.833H6.667M13.333 14.167H6.667M8.333 7.5H6.667"
      />
    </Svg>
  );
};

export default SvgIconFileTextProfile;
