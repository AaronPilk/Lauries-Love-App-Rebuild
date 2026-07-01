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

const SvgIconArrowLeft = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 31 30"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#3D112D'}
        fillRule="evenodd"
        d="M10.15 15.663a.937.937 0 0 1 0-1.326l9.375-9.375a.937.937 0 1 1 1.325 1.326L12.138 15l8.712 8.712a.937.937 0 0 1-1.325 1.326z"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export default SvgIconArrowLeft;
