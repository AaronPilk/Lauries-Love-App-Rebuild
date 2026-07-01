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

const SvgIconBars3 = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 18 18"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.5}
        clipPath="url(#icon-bars-3_svg__a)"
      >
        <Path d="M6 4.5h9.75M6 9h9.75M6 13.5h9.75" />
      </G>
      <Defs>
        <ClipPath id="icon-bars-3_svg__a">
          <Path fill="#fff" d="M0 0h18v18H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconBars3;
