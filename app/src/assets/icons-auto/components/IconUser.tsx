import React from 'react';
import { IconType } from '../icon.types';
import {
  Svg,
  Path,
} from 'react-native-svg';

const SvgIconUser = (originalProps: IconType) => {
  const { ...props } = originalProps;

  return (
    <Svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
    <Path d="M16.6667 17.5V15.8333C16.6667 14.9493 16.3155 14.1014 15.6904 13.4763C15.0653 12.8512 14.2174 12.5 13.3334 12.5L6.66671 12.5C5.78265 12.5 4.93481 12.8512 4.30968 13.4763C3.68456 14.1014 3.33337 14.9493 3.33337 15.8333L3.33337 17.5" stroke="#3D112D" stroke-width="2.1045" stroke-linecap="round" stroke-linejoin="round"/>
    <Path d="M10.0001 9.16667C11.841 9.16667 13.3334 7.67428 13.3334 5.83333C13.3334 3.99238 11.841 2.5 10.0001 2.5C8.15913 2.5 6.66675 3.99238 6.66675 5.83333C6.66675 7.67428 8.15913 9.16667 10.0001 9.16667Z" stroke="#3D112D" stroke-width="2.1045" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
  );
};

export default SvgIconUser;
