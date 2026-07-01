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

const SvgIconMinusCircle = (originalProps: IconType) => {
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
        clipPath="url(#icon-minus-circle_svg__a)"
      >
        <Path d="M15 28c6.903 0 12.5-5.596 12.5-12.5S21.903 3 15 3C8.096 3 2.5 8.596 2.5 15.5S8.096 28 15 28M10 15.5h10" />
      </G>
      <Defs>
        <ClipPath id="icon-minus-circle_svg__a">
          <Path fill="#fff" d="M0 .5h30v30H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconMinusCircle;
