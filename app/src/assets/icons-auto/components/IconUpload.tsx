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

const SvgIconUpload = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 9 12"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#FBFEFF'}
        d="M2.625 8.813h3.75v-3.75h2.5L4.5.688.125 5.063h2.5zM4.5 2.456l1.356 1.357h-.731v3.75h-1.25v-3.75h-.731zM.125 10.063h8.75v1.25H.125z"
      />
    </Svg>
  );
};

export default SvgIconUpload;
