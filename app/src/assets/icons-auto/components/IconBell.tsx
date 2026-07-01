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

const SvgIconBell = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 16 16"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#656A74'}
        d="M14.354 9.647 13 8.293V6.5a5.007 5.007 0 0 0-4.5-4.975V.5h-1v1.025A5.007 5.007 0 0 0 3 6.5v1.793L1.647 9.647A.5.5 0 0 0 1.5 10v1.5a.5.5 0 0 0 .5.5h3.5v.5a2.5 2.5 0 0 0 5 0V12H14a.5.5 0 0 0 .5-.5V10a.5.5 0 0 0-.146-.354M9.5 12.5a1.5 1.5 0 0 1-3 0V12h3z"
      />
    </Svg>
  );
};

export default SvgIconBell;
