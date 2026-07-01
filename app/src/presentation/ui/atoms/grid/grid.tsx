import React, { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { GridProps } from './grid.model';

export default function Grid(props: PropsWithChildren<GridProps>) {
  const { inTab, children } = props;
  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      style={styles.style}
      showsVerticalScrollIndicator={false}
      viewIsInsideTabBar={inTab}
      scrollEnabled
      enableOnAndroid
    >
      {children}
    </KeyboardAwareScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  style: { width: '100%' },
});
