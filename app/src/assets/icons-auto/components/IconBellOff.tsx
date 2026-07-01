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

const SvgIconBellOff = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 30 31"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#737373'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 3.157}
        clipPath="url(#icon-bell-off_svg__a)"
      >
        <Path d="M10.7 4.125a8.75 8.75 0 0 1 13.05 7.625v5m-6.588 10a2.5 2.5 0 0 1-4.325 0m8.413-5H2.5A3.75 3.75 0 0 0 6.25 18v-6.25a8.75 8.75 0 0 1 .975-4.025zM1.25 1.75l27.5 27.5" />
      </G>
      <Defs>
        <ClipPath id="icon-bell-off_svg__a">
          <Path fill="#fff" d="M0 .5h30v30H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconBellOff;
