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

const SvgIconMagnifyingGlass = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#A6A6A6'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.104}
        d="M9.167 15.833a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333M17.5 17.5l-3.625-3.625"
      />
    </Svg>
  );
};

export default SvgIconMagnifyingGlass;
