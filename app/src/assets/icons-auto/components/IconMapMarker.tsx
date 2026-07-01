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

const SvgIconMapMarker = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 38 38"
      {...props}
    >
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#911766'}
        stroke={props.strokeColor0 || props.stroke ? props.stroke : '#911766'}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M33.25 15.833C33.25 26.916 19 36.416 19 36.416s-14.25-9.5-14.25-20.583a14.25 14.25 0 0 1 28.5 0"
      />
      <Path
        stroke={props.strokeColor1 || props.stroke ? props.stroke : '#fff'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 1.453}
        d="M24.812 20.62v-1.452a2.906 2.906 0 0 0-2.906-2.906h-5.812a2.906 2.906 0 0 0-2.906 2.906v1.453M19 13.356a2.906 2.906 0 1 0 0-5.812 2.906 2.906 0 0 0 0 5.812"
      />
    </Svg>
  );
};

export default SvgIconMapMarker;
