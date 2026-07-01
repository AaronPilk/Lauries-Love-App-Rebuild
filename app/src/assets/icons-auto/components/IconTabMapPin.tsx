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

const SvgIconTabMapPin = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 29 28"
      {...props}
    >
      <Path
        stroke={props.strokeColor0 || props.stroke ? props.stroke : '#000'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.333}
        d="M24.552 11.666c0 8.167-10.5 15.167-10.5 15.167s-10.5-7-10.5-15.167a10.5 10.5 0 0 1 21 0"
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#fff'}
        d="M14.052 15.166a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7"
      />
    </Svg>
  );
};

export default SvgIconTabMapPin;
