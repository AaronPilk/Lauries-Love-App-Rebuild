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

const SvgIconCameraAvatar = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 21"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#737373'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.104}
        clipPath="url(#icon-camera-avatar_svg__a)"
      >
        <Path d="M19.167 16.823a1.667 1.667 0 0 1-1.667 1.666h-15a1.667 1.667 0 0 1-1.667-1.666V7.656A1.667 1.667 0 0 1 2.5 5.989h3.333L7.5 3.49h5l1.667 2.5H17.5a1.667 1.667 0 0 1 1.667 1.667z" />
        <Path d="M10 15.156a3.333 3.333 0 1 0 0-6.667 3.333 3.333 0 0 0 0 6.667" />
      </G>
      <Defs>
        <ClipPath id="icon-camera-avatar_svg__a">
          <Path fill="#fff" d="M0 .99h20v20H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconCameraAvatar;
