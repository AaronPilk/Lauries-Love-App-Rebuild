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

const SvgIconMiddleDot = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 5 6"
      {...props}
    >
      <Circle
        cx={2.179}
        cy={3}
        r={2.179}
        fill={props.fillColor || props.fill ? props.fill : '#3D112D'}
      />
    </Svg>
  );
};

export default SvgIconMiddleDot;
