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

const SvgIconUserMinus = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 17 16"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#262626'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.684}
        clipPath="url(#icon-user-minus_svg__a)"
      >
        <Path d="M11.167 14v-1.333A2.667 2.667 0 0 0 8.5 10H3.833a2.667 2.667 0 0 0-2.666 2.667V14M6.167 7.333a2.667 2.667 0 1 0 0-5.333 2.667 2.667 0 0 0 0 5.333M15.834 7.334h-4" />
      </G>
      <Defs>
        <ClipPath id="icon-user-minus_svg__a">
          <Path fill="#fff" d="M.5 0h16v16H.5z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconUserMinus;
