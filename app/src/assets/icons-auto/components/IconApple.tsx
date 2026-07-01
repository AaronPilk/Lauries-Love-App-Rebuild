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

const SvgIconApple = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 14 16"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#FBFEFF'}
        d="M9.519 2.564c.552-.69.926-1.617.827-2.564-.807.04-1.793.533-2.364 1.224-.512.591-.966 1.557-.848 2.464.907.079 1.813-.453 2.385-1.124M10.336 3.865c-1.317-.079-2.436.747-3.065.747-.63 0-1.593-.708-2.634-.689-1.356.02-2.614.787-3.302 2.006-1.415 2.439-.373 6.057 1.003 8.043.668.983 1.473 2.065 2.534 2.026 1.003-.04 1.396-.65 2.615-.65 1.218 0 1.572.65 2.633.63 1.1-.02 1.789-.983 2.457-1.966.767-1.12 1.08-2.203 1.1-2.262-.02-.02-2.122-.826-2.141-3.245-.02-2.025 1.65-2.988 1.729-3.048-.944-1.396-2.418-1.553-2.929-1.592"
      />
    </Svg>
  );
};

export default SvgIconApple;
