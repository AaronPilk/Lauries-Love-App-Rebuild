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

const SvgIconEmptyFiles = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 86 87"
      {...props}
    >
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#B25D95'}
        d="M84.941 84.588a3.7 3.7 0 0 1-3.004 1.558H4.062a3.7 3.7 0 0 1-3.003-1.558c14.647-32.577 11.607-25.81 15.982-35.525h51.917c4.71 10.475 1.224 2.744 15.983 35.525"
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#DEBAD1'}
        d="M17.041 24.959v24.104c-4.71 10.476-1.223 2.744-15.983 35.525a3.52 3.52 0 0 1-.704-2.15V56.479zM85.646 56.48v25.958c.008.775-.24 1.53-.705 2.15-14.648-32.577-11.607-25.81-15.983-35.525V24.959z"
      />
      <Path
        fill={props.fillColor2 || props.fill ? props.fill : '#C88AB2'}
        d="M85.645 56.48v25.958a3.71 3.71 0 0 1-3.708 3.708H4.062a3.71 3.71 0 0 1-3.708-3.709V56.48H32.04a1.854 1.854 0 0 1 1.854 1.576A9.272 9.272 0 0 0 49.6 63.043a9.4 9.4 0 0 0 2.578-4.988 1.854 1.854 0 0 1 1.854-1.576zM68.958 24.959H17.04v24.104h51.917z"
      />
      <Path
        fill={props.fillColor3 || props.fill ? props.fill : '#E0E0E0'}
        d="M59.688 17.542a16.688 16.688 0 1 0-19.6 16.41l2.078 4.19a.946.946 0 0 0 1.668 0l2.077-4.19a16.69 16.69 0 0 0 13.776-16.41"
      />
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#B25D95'}
        d="m45.614 17.542 4.264-4.246a1.862 1.862 0 1 0-2.633-2.633L43 14.928l-4.246-4.265a1.862 1.862 0 0 0-2.633 2.633l4.265 4.246-4.264 4.246a1.862 1.862 0 0 0 2.632 2.633L43 20.156l4.246 4.265a1.862 1.862 0 0 0 2.633-2.633z"
      />
      <Path
        fill={props.fillColor3 || props.fill ? props.fill : '#E0E0E0'}
        d="M18.895 69.459H7.77c-1.024 0-1.854.83-1.854 1.854v7.416c0 1.024.83 1.855 1.854 1.855h11.125c1.024 0 1.854-.83 1.854-1.855v-7.416c0-1.024-.83-1.855-1.854-1.855"
      />
      <Path
        fill={props.fillColor2 || props.fill ? props.fill : '#C88AB2'}
        d="M15.188 76.875h-3.709a1.854 1.854 0 1 1 0-3.709h3.709a1.854 1.854 0 0 1 0 3.709"
      />
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#B25D95'}
        d="M30.02 80.583h-3.708a1.854 1.854 0 1 1 0-3.708h3.708a1.854 1.854 0 1 1 0 3.708M33.729 73.167h-7.417a1.854 1.854 0 1 1 0-3.709h7.417a1.854 1.854 0 1 1 0 3.709"
      />
    </Svg>
  );
};

export default SvgIconEmptyFiles;
