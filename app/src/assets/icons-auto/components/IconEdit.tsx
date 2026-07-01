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

const SvgIconEdit = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#fff'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.667}
        clipPath="url(#icon-edit_svg__a)"
      >
        <Path d="M16.667 12.217v4.45A1.666 1.666 0 0 1 15 18.333H3.333a1.667 1.667 0 0 1-1.666-1.666V5a1.667 1.667 0 0 1 1.666-1.666h4.45" />
        <Path d="M15 1.667 18.333 5 10 13.333H6.667V10z" />
      </G>
      <Defs>
        <ClipPath id="icon-edit_svg__a">
          <Path fill="#fff" d="M0 0h20v20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconEdit;
