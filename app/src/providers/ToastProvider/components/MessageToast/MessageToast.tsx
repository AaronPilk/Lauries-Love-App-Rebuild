import React, { FunctionComponent, useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';

// types
import { ToastType } from 'providers/ToastProvider/ToastProvider.types';

// styles
import styles from './MessageToast.styles';

type MessageToastProps = {
  message: ToastType;
  onFinish: () => void;
};

const MessageToast: FunctionComponent<MessageToastProps> = ({
  message,
  onFinish,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

  const finishHide = () => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      onFinish();
    });
  };

  const startShow = () => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start(() => {
      const timeout = setTimeout(finishHide, message.interval || 5000);
      return () => clearTimeout(timeout);
    });
  };

  useEffect(() => {
    startShow();
  }, []);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        message.position === 'top' && styles.containerTop,
      ]}
      onPress={finishHide}
    >
      <View style={styles.main}>
        {message.title && <Text style={styles.title}>{message.title}</Text>}
        <Text style={styles.message}>{message.message}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MessageToast;
