import { Animated, Text, TextInput, View } from 'react-native';
import React, {
  Fragment,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

import colors from 'styles/colors';
import { styles } from './OTPInput.styles';

interface OTPInputProps {
  code: string[];
  error: string;
  setCode: (codes: string[]) => void;
  setError: (error: string) => void;
}

export default function OTPInput({
  code,
  setCode,
  error,
  setError,
}: OTPInputProps) {
  const [height, setHeight] = useState(0);

  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: error && height ? height : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [error, height]);

  // Refs for each TextInput element
  const refs: RefObject<TextInput>[] = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  function handleChange(text: string, index: number) {
    // If text length is greater than 1, handle it as pasting
    if (text.length > 1) {
      // Split pasted text into individual characters
      const newCodes = text.split('');
      // Update code state
      setCode(newCodes);
      // Focus on the last input
      refs[5]!.current?.focus();
      return;
    }
    // Clear any existing error message
    setError('');

    // Update the code array with the new character
    const newCodes = [...code!];
    newCodes[index] = text;
    setCode(newCodes);

    // Move focus to the next input if text is not empty and it's not the last input
    if (text !== '' && index < 5) {
      refs[index + 1]!.current?.focus();
    }
  }

  return (
    <View>
      <View style={styles.container}>
        {code.map((digit, index) => (
          <Fragment key={index}>
            <TextInput
              autoComplete="sms-otp"
              returnKeyType="next"
              inputMode="numeric"
              onChangeText={text => handleChange(text, index)}
              value={digit}
              maxLength={index === 0 ? code.length : 1}
              autoFocus={index === 0}
              ref={refs[index]}
              onKeyPress={({ nativeEvent: { key } }) => {
                if (key === 'Backspace' && index > 0) {
                  handleChange('', index - 1);
                  refs[index - 1]!.current!.focus();
                }
              }}
              style={[
                styles.textInput,
                { borderColor: error ? colors.error[400] : 'transparent' },
              ]}
            />
            {index === 2 && <Text style={styles.separator}>-</Text>}
          </Fragment>
        ))}
      </View>
      <View style={styles.animatedContainer}>
        <Animated.View style={{ height: animatedHeight }}>
          <Text style={styles.errorTextAnimated}>{error}</Text>
        </Animated.View>
        <Text
          onLayout={layout => setHeight(layout.nativeEvent.layout.height)}
          style={styles.errorTextAbsolute}
        >
          {error}
        </Text>
      </View>
    </View>
  );
}
