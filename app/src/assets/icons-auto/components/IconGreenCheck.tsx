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

const SvgIconGreenCheck = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 61 61"
      {...props}
    >
      <G clipPath="url(#icon-green-check_svg__a)">
        <Path
          fill={props.fillColor || props.fill ? props.fill : '#50B748'}
          d="M30.5 61C47.345 61 61 47.345 61 30.5S47.345 0 30.5 0 0 13.655 0 30.5 13.655 61 30.5 61"
        />
        <Path
          fill={props.fillColor || props.fill ? props.fill : '#10A711'}
          d="M36.918 60.28a31 31 0 0 0 1.744-.391 31 31 0 0 0 2.89-.966q1.422-.55 2.783-1.24a30.5 30.5 0 0 0 5.124-3.292 30.5 30.5 0 0 0 4.369-4.244 30.5 30.5 0 0 0 5.813-10.632q.386-1.276.66-2.582L42.18 18.813a16.45 16.45 0 0 0-11.673-4.844 16.48 16.48 0 0 0-11.687 4.844 16.505 16.505 0 0 0 0 23.368z"
        />
        <Path
          fill={props.fillColor || props.fill ? props.fill : '#fff'}
          d="M30.503 13.969c4.224 0 8.448 1.614 11.681 4.844a16.506 16.506 0 0 1 0 23.368 16.51 16.51 0 0 1-23.368 0 16.506 16.506 0 0 1 0-23.368 16.48 16.48 0 0 1 11.687-4.844m7.523 11.442a1.3 1.3 0 0 0-.66.262l-9.288 6.964-4.303-4.3c-.933-.971-2.77.864-1.797 1.797l5.083 5.083a1.314 1.314 0 0 0 1.66.12l10.167-7.625c.854-.623.327-2.283-.73-2.298a1 1 0 0 0-.13 0z"
        />
      </G>
      <Defs>
        <ClipPath id="icon-green-check_svg__a">
          <Path fill="#fff" d="M0 0h61v61H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconGreenCheck;
