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

const SvgIconInfo = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 25 24"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#A6A6A6'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        clipPath="url(#icon-info_svg__a)"
      >
        <Path d="M12.394 22c5.522 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10M12.394 16v-4M12.394 8h.01" />
      </G>
      <Defs>
        <ClipPath id="icon-info_svg__a">
          <Path fill="#fff" d="M.394 0h24v24h-24z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconInfo;
