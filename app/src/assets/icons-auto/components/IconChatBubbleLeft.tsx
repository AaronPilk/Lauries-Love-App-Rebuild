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

const SvgIconChatBubbleLeft = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 19 19"
      {...props}
    >
      <Path
        stroke={props.strokeColor || props.stroke ? props.stroke : '#911766'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        d="M16.625 11.875a1.583 1.583 0 0 1-1.583 1.583h-9.5l-3.167 3.167V3.958a1.583 1.583 0 0 1 1.583-1.583h11.084a1.584 1.584 0 0 1 1.583 1.583z"
      />
    </Svg>
  );
};

export default SvgIconChatBubbleLeft;
