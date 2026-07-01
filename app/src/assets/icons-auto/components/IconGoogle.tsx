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

const SvgIconGoogle = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 17 16"
      {...props}
    >
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#0085FF'}
        d="M16.055 8.182q-.002-.875-.15-1.682H8.336v3.082l4.36.001a3.7 3.7 0 0 1-1.618 2.483v2h2.594c1.515-1.393 2.383-3.451 2.383-5.884"
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#34A853'}
        d="M11.079 12.067c-.722.484-1.652.767-2.74.767-2.102 0-3.885-1.406-4.524-3.303H1.14v2.063A8.06 8.06 0 0 0 8.339 16c2.176 0 4.004-.711 5.334-1.935z"
      />
      <Path
        fill={props.fillColor2 || props.fill ? props.fill : '#FABB05'}
        d="M3.563 8c0-.533.09-1.047.252-1.531V4.406H1.138A7.9 7.9 0 0 0 .282 8c0 1.292.31 2.512.856 3.593l2.677-2.062A4.8 4.8 0 0 1 3.563 8"
      />
      <Path
        fill={props.fillColor3 || props.fill ? props.fill : '#E94235'}
        d="M8.338 3.167c1.188 0 2.252.406 3.092 1.2l2.299-2.282C12.332.793 10.512 0 8.339 0a8.06 8.06 0 0 0-7.2 4.407L3.815 6.47c.639-1.897 2.422-3.303 4.523-3.303"
      />
    </Svg>
  );
};

export default SvgIconGoogle;
