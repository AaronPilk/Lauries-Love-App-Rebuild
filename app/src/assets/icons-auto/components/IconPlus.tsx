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

const SvgIconPlus = (originalProps: IconType) => {
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
        strokeWidth={props.strokeWidth || 1.667}
        d="M10 4.167v11.666M4.167 10h11.667"
      />
    </Svg>
  );
};

export default SvgIconPlus;
