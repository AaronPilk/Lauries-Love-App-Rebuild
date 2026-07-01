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

const SvgIconComments = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <G clipPath="url(#icon-comments_svg__a)">
        <Path
          stroke={props.strokeColor || props.stroke ? props.stroke : '#3D112D'}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={props.strokeWidth || 2}
          d="M12.4 22.024H3.176a.84.84 0 0 1-.838-.838v-9.224A10.063 10.063 0 1 1 12.4 22.024"
        />
        <Rect
          width={10}
          height={2}
          x={7}
          y={10}
          fill={props.fillColor || props.fill ? props.fill : '#3D112D'}
          rx={1}
        />
        <Rect
          width={10}
          height={2}
          x={7}
          y={14}
          fill={props.fillColor || props.fill ? props.fill : '#3D112D'}
          rx={1}
        />
      </G>
      <Defs>
        <ClipPath id="icon-comments_svg__a">
          <Path fill="#fff" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconComments;
