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

const SvgIconPlusCircle = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 18 19"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#911766'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.5}
        clipPath="url(#icon-plus-circle_svg__a)"
      >
        <Path d="M9 16.993a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15M9 6.493v6M6 9.493h6" />
      </G>
      <Defs>
        <ClipPath id="icon-plus-circle_svg__a">
          <Path fill="#fff" d="M0 .493h18v18H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconPlusCircle;
