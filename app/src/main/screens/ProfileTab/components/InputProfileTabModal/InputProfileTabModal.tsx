import React, { FunctionComponent, useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';

// components
import BottomSheetProfileTab from '../BottomSheetProfileTab/BottomSheetProfileTab';

// styles
import styles from './InputProfileTabModal.styles';

type InputProfileTabModalProps = {
  title: string;
  prevValue: string;
  onClose: () => void;
  onSave: (value: string) => void;
};

const YEAR_NOW = new Date().getFullYear().toString();

const InputProfileTabModal: FunctionComponent<InputProfileTabModalProps> = ({
  title,
  prevValue = YEAR_NOW,
  onClose,
  onSave,
}) => {
  const [value, setValue] = useState(prevValue || YEAR_NOW);
  const [error, setError] = useState('');

  const isDisabled = useMemo(
    () => value === prevValue || !value,
    [value, prevValue],
  );

  const onSubmit = () => {
    if (
      value.length !== 4 ||
      parseInt(value) > parseInt(YEAR_NOW) ||
      parseInt(value) < 1900
    )
      return setError('Please enter a valid year');

    onSave(value);
  };

  return (
    <BottomSheetProfileTab
      title={title}
      disabled={isDisabled}
      onClose={onClose}
      onSubmit={onSubmit}
      isInputs
    >
      <View style={styles.container}>
        <View style={styles.inputContainer}>
          <BottomSheetTextInput
            style={styles.input}
            value={value}
            onChangeText={newValue => {
              setError('');
              setValue(newValue);
            }}
            keyboardType="numeric"
            maxLength={4}
            textAlign="center"
          />
        </View>
        <Text style={styles.error}>{error}</Text>
      </View>
    </BottomSheetProfileTab>
  );
};

export default InputProfileTabModal;
