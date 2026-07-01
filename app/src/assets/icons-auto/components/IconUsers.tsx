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

const SvgIconUsers = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 17 12"
      {...props}
    >
      <Path
        fill={props.fillColor || props.fill ? props.fill : '#911766'}
        fillRule="evenodd"
        d="M3.428 9.005a4 4 0 0 0-.595-.043c-1.55 0-2.416.855-2.748 1.28a.43.43 0 0 0-.083.263C0 10.662 0 10.87 0 11.077c0 .233.181.423.405.423h2.903a1.3 1.3 0 0 1-.07-.423c0-.482 0-1.055.002-1.394 0-.241.066-.476.188-.678m9.12 2.495H4.452a.4.4 0 0 1-.286-.124.43.43 0 0 1-.118-.3l.001-1.39v-.003c0-.097.033-.191.091-.267.503-.6 2.02-2.147 4.36-2.147 2.648 0 3.978 1.545 4.384 2.127a.44.44 0 0 1 .068.235v1.446c0 .112-.042.22-.118.299a.4.4 0 0 1-.286.124m1.144 0h2.903c.224 0 .405-.19.405-.423v-.58a.44.44 0 0 0-.084-.257c-.333-.423-1.2-1.278-2.75-1.278q-.298 0-.564.039c.104.192.16.409.16.631v1.445q0 .22-.07.423M2.833 3.885C1.716 3.885.81 4.832.81 6s.906 2.115 2.023 2.115S4.857 7.168 4.857 6 3.95 3.885 2.833 3.885m11.334 0c-1.117 0-2.024.947-2.024 2.115s.906 2.115 2.024 2.115S16.19 7.168 16.19 6s-.907-2.115-2.024-2.115M8.5.5C6.936.5 5.667 1.827 5.667 3.462c0 1.634 1.27 2.961 2.833 2.961s2.833-1.327 2.833-2.961C11.333 1.827 10.063.5 8.5.5"
        clipRule="evenodd"
      />
    </Svg>
  );
};

export default SvgIconUsers;
