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

const SvgIconMastercard = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 20 13"
      {...props}
    >
      <Path
        fill={props.fillColor0 || props.fill ? props.fill : '#FF5F00'}
        d="M12.49 1.706H7.24v9.435h5.25z"
      />
      <Path
        fill={props.fillColor1 || props.fill ? props.fill : '#EB001B'}
        d="M7.573 6.424a5.99 5.99 0 0 1 2.292-4.717 6 6 0 1 0 0 9.434 5.99 5.99 0 0 1-2.292-4.717"
      />
      <Path
        fill={props.fillColor2 || props.fill ? props.fill : '#F79E1B'}
        d="M19.573 6.424a5.999 5.999 0 0 1-9.708 4.717 6 6 0 0 0 0-9.434 6 6 0 0 1 9.708 4.717M19 10.142v-.194h.078V9.91h-.198v.04h.078v.193zm.385 0v-.233h-.06l-.07.16-.07-.16h-.061v.233h.043v-.176l.065.151h.045l.065-.151v.176z"
      />
    </Svg>
  );
};

export default SvgIconMastercard;
