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

const SvgIconTabUser = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 29 28"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#000'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.333}
        d="M24.135 24.5v-2.333A4.667 4.667 0 0 0 19.47 17.5h-9.334a4.667 4.667 0 0 0-4.666 4.667V24.5M14.802 12.833a4.667 4.667 0 1 0 0-9.333 4.667 4.667 0 0 0 0 9.333"
      />
    </Svg>
  );
};

export default SvgIconTabUser;
