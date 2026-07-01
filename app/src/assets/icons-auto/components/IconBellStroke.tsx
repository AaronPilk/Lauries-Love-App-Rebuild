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

const SvgIconBellStroke = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 26 26"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#A6A6A6'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.078}
        d="M14.798 22.35a2.078 2.078 0 0 1-3.595 0m12.186-4.156H2.611a3.117 3.117 0 0 0 3.117-3.116V9.883a7.272 7.272 0 0 1 14.544 0v5.195a3.117 3.117 0 0 0 3.117 3.116"
      />
    </Svg>
  );
};

export default SvgIconBellStroke;
