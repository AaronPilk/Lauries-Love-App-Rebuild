import React from 'react';
import { OptionButtonProps } from './option-button.model';
import { variants } from './option-button.style';
import { Text, TouchableOpacity, View } from 'react-native';

export default function OptionButton(props: OptionButtonProps) {
  const {
    onPress,
    variant = 'solid',
    children,
    toggleArrow,
    activeArrow,
    ...rest
  } = props;
  const [isOpen, setIsOpen] = React.useState(Boolean(activeArrow));

  const styles = variants[variant];
  const [color] = styles.color.split('.');

  const onPressOption = () => {
    setIsOpen(state => !state);
    onPress();
  };
  return (
    <TouchableOpacity

      onPress={onPressOption}
    >
      <View
        style={{
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '100%',
        }}
      >
        <View style={{ alignSelf: 'center' }}>
          {typeof children === 'string' ? (
            <Text
              style={{
                fontFamily: 'mono',
                fontWeight: '600',
                textAlign: 'center',
                fontSize: 16,
                color: styles.color,
              }}
            >
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
        <View style={{ alignSelf: 'center' }}>
          {/* {toggleArrow ? (
              <Icon
                as={
                  <MaterialIcons
                    name={
                      isOpen ? 'keyboard-arrow-down' : 'keyboard-arrow-right'
                    }
                  />
                }
                size={5}
                color={color === 'gray' ? 'gray.400' : 'red.800'}
              />
            ) : (
              <Icon
                as={
                  <MaterialIcons
                    name={
                      activeArrow
                        ? 'keyboard-arrow-down'
                        : 'keyboard-arrow-right'
                    }
                  />
                }
                size={5}
                color={color === 'gray' ? 'gray.400' : 'error.800'}
              />
            )} */}
        </View>
      </View>
    </TouchableOpacity>
  );
}
