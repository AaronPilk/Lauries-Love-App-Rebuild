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

const SvgIconTabMessageCircle = (originalProps: IconType) => {
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
        d="M24.552 13.417a9.8 9.8 0 0 1-1.05 4.433 9.92 9.92 0 0 1-8.867 5.483 9.8 9.8 0 0 1-4.433-1.05L3.552 24.5l2.217-6.65a9.8 9.8 0 0 1-1.05-4.433 9.92 9.92 0 0 1 5.483-8.867 9.8 9.8 0 0 1 4.433-1.05h.584a9.893 9.893 0 0 1 9.333 9.333z"
      />
    </Svg>
  );
};

export default SvgIconTabMessageCircle;
