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

const SvgIconTrashProfile = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 20"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#BB3A31'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M2.5 5h15M6.667 5V3.334a1.667 1.667 0 0 1 1.666-1.667h3.334a1.667 1.667 0 0 1 1.666 1.667V5m2.5 0v11.667a1.667 1.667 0 0 1-1.666 1.667H5.833a1.667 1.667 0 0 1-1.666-1.667V5zM8.333 9.167v5M11.667 9.167v5"
      />
    </Svg>
  );
};

export default SvgIconTrashProfile;
