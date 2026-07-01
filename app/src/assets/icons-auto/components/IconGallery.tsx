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

const SvgIconGallery = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 21"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#000'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.104}
        d="M15.833 3.481H4.167c-.92 0-1.667.747-1.667 1.667v11.667c0 .92.746 1.666 1.667 1.666h11.666c.92 0 1.667-.746 1.667-1.666V5.148c0-.92-.746-1.667-1.667-1.667"
      />
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#000'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2.104}
        d="M7.083 9.315a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5M17.5 13.482l-4.167-4.167-9.166 9.167"
      />
    </Svg>
  );
};

export default SvgIconGallery;
