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

const SvgIconLocationProfile = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.104}
        clipPath="url(#icon-location-profile_svg__a)"
      >
        <Path d="M17.5 8.333c0 5.833-7.5 10.833-7.5 10.833s-7.5-5-7.5-10.833a7.5 7.5 0 1 1 15 0" />
        <Path d="M10 10.834a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5" />
      </G>
      <Defs>
        <ClipPath id="icon-location-profile_svg__a">
          <Path fill="#fff" d="M0 0h20v20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconLocationProfile;
