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

const SvgIconVideo = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 15"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#656A74'}
        d="M9.905 0c2.422 0 4.113 1.669 4.113 4.06v6.88c0 2.391-1.69 4.06-4.113 4.06H4.113C1.691 15 0 13.331 0 10.94V4.06C0 1.67 1.691 0 4.113 0zm8.053 2.379c.439-.223.954-.2 1.373.064.419.263.669.72.669 1.22v7.675c0 .5-.25.957-.669 1.22a1.385 1.385 0 0 1-1.374.063l-1.481-.748a1.62 1.62 0 0 1-.888-1.457V4.583c0-.621.34-1.18.888-1.456z"
      />
    </Svg>
  );
};

export default SvgIconVideo;
