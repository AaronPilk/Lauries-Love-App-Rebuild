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

const SvgIconMapPin = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 18 18"
      {...props}
    >
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#3D112D'}
        stroke={props.strokeColor0 || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.5}
        d="M15.75 7.5c0 5.25-6.75 9.75-6.75 9.75s-6.75-4.5-6.75-9.75a6.75 6.75 0 0 1 13.5 0"
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#fff'}
        stroke={props.strokeColor1 || props.stroke ? props.stroke : '#fff'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.5}
        d="M9 9.75a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5"
      />
    </Svg>
  );
};

export default SvgIconMapPin;
