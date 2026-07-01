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

const SvgIconLockProfile = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#000'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M15.833 9.167H4.167c-.92 0-1.667.746-1.667 1.667v5.833c0 .92.746 1.667 1.667 1.667h11.666c.92 0 1.667-.747 1.667-1.667v-5.833c0-.92-.746-1.667-1.667-1.667M5.833 9.167V5.834a4.167 4.167 0 0 1 8.334 0v3.333"
      />
    </Svg>
  );
};

export default SvgIconLockProfile;
