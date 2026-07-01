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

const SvgIconPaperAirplane = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 14"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.333}
        clipPath="url(#icon-paper-airplane_svg__a)"
      >
        <Path d="M12.833 1.16 6.417 7.577M12.833 1.16 8.75 12.827l-2.333-5.25-5.25-2.334z" />
      </G>
      <Defs>
        <ClipPath id="icon-paper-airplane_svg__a">
          <Path fill="#fff" d="M0-.007h14v14H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconPaperAirplane;
