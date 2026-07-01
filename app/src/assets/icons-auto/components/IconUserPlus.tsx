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

const SvgIconUserPlus = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 15 16"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#737373'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.667}
        clipPath="url(#icon-user-plus_svg__a)"
      >
        <Path d="M10 13.625v-1.25a2.5 2.5 0 0 0-2.5-2.5H3.125a2.5 2.5 0 0 0-2.5 2.5v1.25M5.313 7.375a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5M12.5 5.5v3.75M14.375 7.375h-3.75" />
      </G>
      <Defs>
        <ClipPath id="icon-user-plus_svg__a">
          <Path fill="#fff" d="M0 .5h15v15H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconUserPlus;
