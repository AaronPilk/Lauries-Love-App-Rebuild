import React from 'react';
import { View } from 'react-native';

import styles from './Progress.styles';

type Props = {
  value: number;
};

export default function Progress({ value }: Props) {
  return (
    <View style={styles.container}>
      <View style={[styles.progress, { width: `${value}%` }]} />
    </View>
  );
}
