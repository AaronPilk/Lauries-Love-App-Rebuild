import React from 'react';
import { View } from 'react-native';
import { styles } from './slider.styles';
import { SliderContainerProps } from './slider.model';

export default function SliderContainer(
  props: SliderContainerProps & { children: JSX.Element },
) {
  const { trackMarks, onChange, value } = props;
  let renderTrackMarkComponent: (index: number) => JSX.Element;

  if (trackMarks?.length && (!Array.isArray(value) || value?.length === 1)) {
    renderTrackMarkComponent = (index: number) => {
      const currentMarkValue = trackMarks[index];

      const style =
        currentMarkValue > Math.max(Array.isArray(value) ? value[0] : value)
          ? styles.activeMark
          : styles.inactiveMark;
      return <View style={style} />;
    };
  }

  const renderChildren = () => {
    return React.Children.map(props.children, (child: React.ReactElement) => {
      if (child) {
        return React.cloneElement(child, {
          onValueChange: onChange,
          renderTrackMarkComponent,
          trackMarks,
          value,
        });
      }

      return child;
    });
  };

  return <View>{renderChildren()}</View>;
}
