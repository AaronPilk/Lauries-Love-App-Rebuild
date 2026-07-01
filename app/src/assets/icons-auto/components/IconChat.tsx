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

const SvgIconChat = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 84 84"
      {...props}
    >
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#C88AB2'}
        d="M49.875 5.25h-36.75a7.875 7.875 0 0 0-7.875 7.875v36.75a7.875 7.875 0 0 0 7.875 7.875 7.64 7.64 0 0 0 4.751-1.68l4.2-3.57h6.799a2.625 2.625 0 0 0 2.625-2.625v-15.75a2.625 2.625 0 0 1 2.625-2.625h21a2.625 2.625 0 0 0 2.625-2.625v-15.75a7.875 7.875 0 0 0-7.875-7.875"
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#DEBAD1'}
        d="M70.875 26.25h-36.75a7.875 7.875 0 0 0-7.875 7.875v31.5a7.875 7.875 0 0 0 7.875 7.875h27.799l4.331 3.439a7.64 7.64 0 0 0 4.62 1.811 7.875 7.875 0 0 0 7.875-7.875v-36.75a7.875 7.875 0 0 0-7.875-7.875"
      />
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#C88AB2'}
        d="M63 44.625H42a2.625 2.625 0 0 1 0-5.25h21a2.625 2.625 0 0 1 0 5.25m0 15.75H42a2.625 2.625 0 0 1 0-5.25h21a2.625 2.625 0 0 1 0 5.25"
      />
    </Svg>
  );
};

export default SvgIconChat;
