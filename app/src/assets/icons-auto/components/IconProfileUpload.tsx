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

const SvgIconProfileUpload = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 32 32"
      {...props}
    >
      <Rect
        width={32}
        height={32}
        fill={props.fillColor0 || props.fill ? props.fill : '#88677F'}
        rx={16}
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#F2F4F5'}
        fillRule="evenodd"
        d="M11 10v2h-1v-2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2h-1v-2zm.705 7.705L11 17l5-5 5 5-.705.705-3.795-3.79V23h-1v-9.085z"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export default SvgIconProfileUpload;
