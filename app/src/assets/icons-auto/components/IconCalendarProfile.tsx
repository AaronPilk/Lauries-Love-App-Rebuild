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

const SvgIconCalendarProfile = (originalProps: IconType) => {
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
        strokeWidth={props.strokeWidth || 2.104}
        d="M15.833 3.333H4.167C3.247 3.333 2.5 4.079 2.5 5v11.666c0 .92.746 1.667 1.667 1.667h11.666c.92 0 1.667-.746 1.667-1.667V5c0-.92-.746-1.667-1.667-1.667M13.334 1.667V5M6.667 1.667V5M2.5 8.334h15"
      />
    </Svg>
  );
};

export default SvgIconCalendarProfile;
