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

const SvgIconSmileyFace = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 54 54"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 4.425}
        d="M27.34 48.907c12.22 0 22.124-9.905 22.124-22.123S39.56 4.66 27.341 4.66 5.218 14.566 5.218 26.784s9.905 22.123 22.123 22.123"
      />
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 4.425}
        d="M18.492 31.209s3.318 4.424 8.849 4.424c5.53 0 8.85-4.425 8.85-4.425M20.704 20.147h.022M33.978 20.147H34"
      />
    </Svg>
  );
};

export default SvgIconSmileyFace;
