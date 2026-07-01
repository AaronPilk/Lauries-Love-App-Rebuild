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

const SvgIconQrWhite = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 40 40"
      {...props}
    >
      <Rect
        width={40}
        height={40}
        fill={props.fillColor0 || props.fill ? props.fill : '#fff'}
        rx={20}
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#A6A6A6'}
        d="M16 29h-4a1 1 0 0 1-1-1v-4a1 1 0 0 0-2 0v4a3 3 0 0 0 3 3h4a1 1 0 0 0 0-2m14-6a1 1 0 0 0-1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 0 0 2h4a3 3 0 0 0 3-3v-4a1 1 0 0 0-1-1M28 9h-4a1 1 0 1 0 0 2h4a1 1 0 0 1 1 1v4a1 1 0 0 0 2 0v-4a3 3 0 0 0-3-3m-18 8a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 0 0-2h-4a3 3 0 0 0-3 3v4a1 1 0 0 0 1 1m8-4h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1m-1 4h-2v-2h2zm5 2h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1m1-4h2v2h-2zm-5 6h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1m-1 4h-2v-2h2zm5-1a1 1 0 0 0 1-1 1 1 0 0 0 0-2h-1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1m4-3a1 1 0 0 0-1 1v3a1 1 0 0 0 0 2h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1m-4 4a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
      />
    </Svg>
  );
};

export default SvgIconQrWhite;
