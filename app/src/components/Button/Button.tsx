import React, { FunctionComponent, ReactNode } from 'react';
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

// styles
import styles from './Button.styles';

type ButtonProps = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  shape?: 'rounded';
  type?: 'secondary';
  variant?: 'primary' | 'secondary' | 'invalid';
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ViewStyle>;
  prefix?: ReactNode;
  suffix?: ReactNode;
  styleContainer?: StyleProp<ViewStyle>;
  styleTitle?: StyleProp<TextStyle>;
};

const Button: FunctionComponent<ButtonProps> = ({
  title,
  onPress,
  disabled = false,
  shape,
  type,
  style,
  variant = 'primary',
  size = 'md',
  prefix,
  suffix,
  styleContainer,
  styleTitle,
}) => {
  const isRounded = shape === 'rounded';
  const isSecondary = type === 'secondary';

  const getButtonStyle = () => {
    // depends on variant and size
    let buttonStyle;
    switch (variant) {
      case 'secondary':
        buttonStyle = styles.containerSecondary;
        if (disabled) {
          buttonStyle = { ...buttonStyle, ...styles.disabledSecondary };
        }
        break;
      case 'invalid':
        buttonStyle = styles.containerInvalid;
        if (disabled) {
          buttonStyle = { ...buttonStyle, ...styles.disabledInvalid };
        }
        break;
      default:
        buttonStyle = styles.containerPrimary;
        if (disabled) {
          buttonStyle = { ...buttonStyle, ...styles.disabledPrimary };
        }
        break;
    }
    return buttonStyle;
  };

  const getTextStyle = () => {
    // depends on variant and size
    let textStyle = styles.titlePrimary;
    if (variant === 'secondary') {
      textStyle = styles.titleSecondary;
      if (disabled) {
        textStyle = styles.titleSecondaryDisabled;
      }
    }
    if (variant === 'invalid') {
      textStyle = styles.titleInvalid;
      if (disabled) {
        textStyle = styles.titleInvalidDisabled;
      }
    }
    if (size === 'sm') {
      textStyle = { ...textStyle, ...styles.titleSm };
    }
    if (size === 'md') {
      textStyle = { ...textStyle, ...styles.titleMd };
    }
    if (size === 'lg') {
      textStyle = { ...textStyle, ...styles.titleLg };
    }
    return textStyle;
  };

  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.container,
        getButtonStyle(),
        isRounded && styles.rounded,
        isSecondary && styles.secondaryContainer,
        style,
        styleContainer,
      ]}
    >
      {prefix && prefix}
      <Text
        style={[
          styles.title,
          getTextStyle(),
          isRounded && styles.roundedTitle,
          isSecondary && styles.secondaryTitle,
          styleTitle,
        ]}
      >
        {title}
      </Text>
      {suffix && suffix}
    </TouchableOpacity>
  );
};

// Memoized: Button renders inside lists/forms; props are simple values.
export default React.memo(Button);
