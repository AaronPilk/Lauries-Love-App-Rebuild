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

const SvgIconCamera = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 28 28"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#000'}
        d="M16.281 14.594a2.531 2.531 0 1 1-5.062 0 2.531 2.531 0 0 1 5.062 0"
      />
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#000'}
        fillRule="evenodd"
        d="M4.469 8.688a2.53 2.53 0 0 0-2.532 2.53v8.438a2.53 2.53 0 0 0 2.532 2.532H23.03a2.53 2.53 0 0 0 2.532-2.532V11.22a2.53 2.53 0 0 0-2.532-2.531H21.55a2.53 2.53 0 0 1-1.79-.742l-1.893-1.892a2.53 2.53 0 0 0-1.79-.742h-4.652c-.672 0-1.316.267-1.79.742L7.74 7.946a2.53 2.53 0 0 1-1.79.742zm14.343 5.906a5.062 5.062 0 1 1-10.124 0 5.062 5.062 0 0 1 10.125 0"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export default SvgIconCamera;
