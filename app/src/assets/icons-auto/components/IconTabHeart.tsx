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

const SvgIconTabHeart = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 29 28"
      {...props}
    >
      <G clipPath="url(#icon-tab-heart_svg__a)">
        <Path
          stroke={props.strokeColor || props.stroke ? props.stroke : '#000'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={props.strokeWidth || 2.333}
          d="M24.615 5.379a6.417 6.417 0 0 0-9.076 0l-1.237 1.236-1.237-1.236a6.418 6.418 0 1 0-9.076 9.076l1.236 1.237 9.077 9.077 9.077-9.077 1.236-1.237a6.415 6.415 0 0 0 0-9.076"
        />
      </G>
      <Defs>
        <ClipPath id="icon-tab-heart_svg__a">
          <Path d="M.302 0h28v28h-28z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconTabHeart;
