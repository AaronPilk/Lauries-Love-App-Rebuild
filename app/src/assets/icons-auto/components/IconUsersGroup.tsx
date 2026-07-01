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

const SvgIconUsersGroup = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 25"
      {...props}
    >
      <Path
        stroke={props.strokeColor0 || props.stroke ? props.stroke : '#F9F9F8'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M17 21.493v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
      />
      <Path
        stroke={props.strokeColor1 || props.stroke ? props.stroke : '#fff'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M9 11.493a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21.493v-2a4 4 0 0 0-3-3.87M16 3.623a4 4 0 0 1 0 7.75"
      />
    </Svg>
  );
};

export default SvgIconUsersGroup;
