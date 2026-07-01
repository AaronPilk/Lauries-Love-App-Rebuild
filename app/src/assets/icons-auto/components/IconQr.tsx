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

const SvgIconQr = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#656A74'}
        fillRule="evenodd"
        d="M13.5 10.5h9v-9h-9zM21 9h-6V3h6zm-1.5-4.5h-3v3h3zm-18 18h9v-9h-9zM9 21H3v-6h6zm10.5-7.5V15H21v1.5h1.5v-3zm-6 4.5v-1.5H15V18zm3-3v3H15v1.5h-1.5v3h3V21H15v-1.5h3V21h1.5v1.5h3v-3H21V21h-1.5v-1.5H21v-3h-1.5v3H18V15zm0 0v-1.5h-3V15zm-9 1.5h-3v3h3zm0-12h-3v3h3zm-6 6h9v-9h-9zM9 9H3V3h6z"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export default SvgIconQr;
