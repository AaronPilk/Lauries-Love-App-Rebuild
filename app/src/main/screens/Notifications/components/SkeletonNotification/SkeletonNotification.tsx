import { Animated, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import styles from './SkeletonNotification.styles';

export default function SkeletonNotification() {
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(animation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const interpolateBackgroundColor = animation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e0e0e0', '#c0c0c0'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.skeletonImage,
          {
            backgroundColor: interpolateBackgroundColor,
          },
        ]}
      />
      <Animated.View
        style={[
          styles.skeletonItem,
          {
            backgroundColor: interpolateBackgroundColor,
          },
        ]}
      />
    </View>
  );
}
