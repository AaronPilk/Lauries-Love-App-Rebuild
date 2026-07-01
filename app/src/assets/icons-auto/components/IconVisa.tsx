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

const SvgIconVisa = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 38 13"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#1434CB'}
        d="m18.398.636-2.482 11.606h-3.003L15.396.636zM31.03 8.13l1.58-4.358.91 4.358zm3.351 4.112h2.776L34.732.636H32.17c-.577 0-1.064.334-1.28.85l-4.504 10.756h3.153l.626-1.734h3.851zm-7.838-3.79c.013-3.062-4.234-3.232-4.206-4.6.01-.416.406-.86 1.273-.973.43-.055 1.617-.1 2.961.52l.526-2.462A8.1 8.1 0 0 0 24.29.424C21.321.424 19.233 2 19.216 4.26c-.019 1.67 1.492 2.603 2.627 3.159 1.171.569 1.564.933 1.558 1.442-.008.778-.934 1.123-1.796 1.136-1.51.024-2.386-.408-3.083-.733l-.545 2.544c.702.322 1.997.601 3.338.616 3.155 0 5.219-1.558 5.228-3.971M14.108.637 9.243 12.242H6.069L3.675 2.979c-.145-.57-.272-.779-.713-1.02C2.24 1.569 1.048 1.202 0 .974L.071.636H5.18c.65 0 1.236.433 1.385 1.183L7.83 8.535l3.123-7.9z"
      />
    </Svg>
  );
};

export default SvgIconVisa;
