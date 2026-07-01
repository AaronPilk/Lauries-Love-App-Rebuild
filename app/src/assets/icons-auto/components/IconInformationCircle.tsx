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

const SvgIconInformationCircle = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <G
        stroke={props.strokeColor || props.stroke ? props.stroke : '#737373'}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={props.strokeWidth || 2}
        clipPath="url(#icon-information-circle_svg__a)"
      >
        <Path d="M12 21.993c5.523 0 10-4.477 10-10s-4.477-10-10-10-10 4.477-10 10 4.477 10 10 10M12 15.993v-4M12 7.993h.01" />
      </G>
      <Defs>
        <ClipPath id="icon-information-circle_svg__a">
          <Path fill="#fff" d="M0-.007h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
};

export default SvgIconInformationCircle;
