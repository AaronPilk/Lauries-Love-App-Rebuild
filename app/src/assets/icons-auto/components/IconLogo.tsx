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

const SvgIconLogo = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 75 75"
      {...props}
    >
      <Circle
        cx={37.5}
        cy={37.5}
        r={37.5}
        fill={props.fillColor0 || props.fill ? props.fill : '#88677F'}
      />
      <Path
        stroke={props.strokeColor1 || props.stroke ? props.stroke : '#fff'}
        d="M5.7 25.05c.9 5.4 6.75 15.75 17.85 13.35m0 0c7.754-1.676 9.9-10.35 9.9-13.8-.05-2.9-1.26-8.7-5.7-8.7-4.2 0-3.9 5.25-4.2 5.4zm0 0v1.5c-.076 1.295-.493 3.231-1.418 4.95m0 0c-.898 1.666-2.274 3.127-4.282 3.6-1.05-.05-3.15-.51-3.15-1.95s2.3-1.7 3.45-1.65zm0 0h3.518c3.6.45 11.49 1.62 14.25 2.7 2.1.822 1.2 1.8 9.6 1.35q.144-.031.3-.074m0 0c3.127-.866 9.46-5.3 9.75-13.576.274-7.795-5.1-8.7-5.85-8.7-1.3-.05-3.9 1.02-3.9 5.7zm0 0v.974c-.2 1.456-.744 3.665-1.722 5.55m0 0c-.97 1.87-2.366 3.42-4.278 3.6-.9 0-2.76-.39-3-1.95.052-.9 1.581-2.49 7.278-1.65Zm0 0c5.224.25 16.752.93 21.072 1.65M38.94 40.239c-.603-4.553 1.743-7.273 3.96-7.689 2.4-.45 1.65 4.2 1.5 5.85-.12 1.32-2.45 6.95-3.6 9.6-15.284-10.998-3.772-14.924-1.86-7.761Zm0 0q.074.562.21 1.161a7.5 7.5 0 0 0-.21-1.161Z"
      />
    </Svg>
  );
};

export default SvgIconLogo;
