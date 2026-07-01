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

const SvgIconQrMini = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#0085FF'}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 8.537H1M13.753 5.73V4.721a2.49 2.49 0 0 0-2.488-2.488h-.804M2.247 5.73V4.721a2.49 2.49 0 0 1 2.488-2.488h.824M13.753 8.537v2.716a2.49 2.49 0 0 1-2.488 2.488h-.804M2.247 8.537v2.716a2.49 2.49 0 0 0 2.488 2.488h.824"
      />
    </Svg>
  );
};

export default SvgIconQrMini;
