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

const SvgIconEmptyChats = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 89 89"
      {...props}
    >
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#B25D95'}
        d="M86.441 85.581a3.7 3.7 0 0 1-3.004 1.557H5.562a3.7 3.7 0 0 1-3.003-1.557c14.647-32.578 11.607-25.81 15.982-35.526h51.917c4.71 10.476 1.224 2.744 15.983 35.526"
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#DEBAD1'}
        d="M18.541 25.951v24.104c-4.71 10.476-1.224 2.745-15.983 35.526a3.52 3.52 0 0 1-.704-2.15V57.471zM87.146 57.472V83.43c.008.775-.24 1.531-.705 2.151-14.648-32.577-11.607-25.81-15.983-35.526V25.951z"
      />
      <Path
        fill={props.fillColor2 || props.fill ? props.fill : '#C88AB2'}
        d="M87.145 57.472V83.43a3.71 3.71 0 0 1-3.708 3.708H5.562a3.71 3.71 0 0 1-3.708-3.708V57.472H33.54a1.854 1.854 0 0 1 1.854 1.576A9.27 9.27 0 0 0 51.1 64.036a9.4 9.4 0 0 0 2.578-4.988 1.854 1.854 0 0 1 1.854-1.576zM70.458 25.951H18.54v24.104h51.917z"
      />
      <Path
        fill={props.fillColor3 || props.fill ? props.fill : '#E0E0E0'}
        d="M61.188 18.535a16.688 16.688 0 1 0-19.6 16.409l2.078 4.19a.945.945 0 0 0 1.668 0l2.077-4.19a16.69 16.69 0 0 0 13.776-16.41"
      />
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#B25D95'}
        d="m47.114 18.535 4.264-4.246a1.862 1.862 0 1 0-2.633-2.633L44.5 15.92l-4.246-4.264a1.862 1.862 0 0 0-2.633 2.633l4.265 4.246-4.264 4.246a1.863 1.863 0 0 0 1.316 3.178 1.86 1.86 0 0 0 1.316-.545l4.246-4.265 4.246 4.265a1.862 1.862 0 1 0 2.633-2.633z"
      />
      <Path
        fill={props.fillColor3 || props.fill ? props.fill : '#E0E0E0'}
        d="M20.395 70.451H9.27c-1.024 0-1.854.83-1.854 1.854v7.417c0 1.024.83 1.854 1.854 1.854h11.125c1.024 0 1.854-.83 1.854-1.854v-7.417c0-1.024-.83-1.854-1.854-1.854"
      />
      <Path
        fill={props.fillColor2 || props.fill ? props.fill : '#C88AB2'}
        d="M16.688 77.868h-3.709a1.854 1.854 0 1 1 0-3.709h3.709a1.854 1.854 0 1 1 0 3.709"
      />
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#B25D95'}
        d="M31.52 81.576h-3.708a1.854 1.854 0 1 1 0-3.708h3.708a1.854 1.854 0 1 1 0 3.708M35.229 74.16h-7.417a1.854 1.854 0 1 1 0-3.709h7.417a1.854 1.854 0 1 1 0 3.709"
      />
    </Svg>
  );
};

export default SvgIconEmptyChats;
