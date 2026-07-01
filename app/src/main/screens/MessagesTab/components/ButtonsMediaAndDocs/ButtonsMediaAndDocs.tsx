import React, { FunctionComponent, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';

// styles
import styles from './ButtonsMediaAndDocs.styles';

type ButtonsMediaAndDocsProps = {
  type: 'photos' | 'videos' | 'docs';
  setTypeSelected: (type: 'photos' | 'videos' | 'docs') => void;
};

const ButtonsMediaAndDocs: FunctionComponent<ButtonsMediaAndDocsProps> = ({
  type,
  setTypeSelected,
}) => {
  const [width, setWidth] = useState(0);
  const buttonPhotosRef = useRef<View>(null);
  const buttonVideosRef = useRef<View>(null);
  const buttonDocsRef = useRef<View>(null);
  const opacityFirstLine = useRef(new Animated.Value(0)).current;
  const opacitySecondLine = useRef(new Animated.Value(1)).current;
  const leftPosition = useRef(new Animated.Value(2)).current;

  const setTypeSelectedAnimation = (type: 'photos' | 'videos' | 'docs') => {
    if (type === 'photos')
      Animated.parallel([
        Animated.timing(opacityFirstLine, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacitySecondLine, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftPosition, {
          toValue: 2,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => setTypeSelected(type));

    if (type === 'videos')
      Animated.parallel([
        Animated.timing(opacityFirstLine, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacitySecondLine, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftPosition, {
          toValue: 68,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => setTypeSelected(type));

    if (type === 'docs')
      Animated.parallel([
        Animated.timing(opacityFirstLine, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacitySecondLine, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(leftPosition, {
          toValue: width - 65,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start(() => setTypeSelected(type));
  };

  return (
    <View
      style={styles.container}
      onLayout={event => setWidth(event.nativeEvent.layout.width)}
    >
      <Animated.View
        style={[
          styles.backgroundButton,
          {
            left: leftPosition,
          },
        ]}
      />
      <TouchableOpacity
        ref={buttonPhotosRef}
        style={styles.button}
        onPress={() => setTypeSelectedAnimation('photos')}
      >
        <Text style={[styles.title, type === 'photos' && styles.titleSelected]}>
          Photos
        </Text>
      </TouchableOpacity>
      <Animated.View style={[styles.line, { opacity: opacityFirstLine }]} />
      <TouchableOpacity
        ref={buttonVideosRef}
        style={styles.button}
        onPress={() => setTypeSelectedAnimation('videos')}
      >
        <Text style={[styles.title, type === 'videos' && styles.titleSelected]}>
          Videos
        </Text>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.line,
          {
            opacity: opacitySecondLine,
          },
        ]}
      />
      <TouchableOpacity
        ref={buttonDocsRef}
        style={styles.button}
        onPress={() => setTypeSelectedAnimation('docs')}
      >
        <Text style={[styles.title, type === 'docs' && styles.titleSelected]}>
          Docs
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ButtonsMediaAndDocs;
