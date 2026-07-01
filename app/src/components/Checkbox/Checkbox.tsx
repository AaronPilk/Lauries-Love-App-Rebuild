import { IconCheckbox } from 'assets/icons-auto/components';
import React from 'react';
import { FunctionComponent, useState } from 'react';
import { Text } from 'react-native';
import { TouchableOpacity, View } from 'react-native'
import colors from 'styles/colors';
import { styles } from './Checkbox.styles';


interface CheckboxProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}
const Checkbox: FunctionComponent<CheckboxProps> = ({ label, value, onChange }) => {
  return (
      <TouchableOpacity
        onPress={() => onChange(!value)}
        accessibilityRole="checkbox"
        style={styles.checkboxContainer}
      >
        <View
          style={[
            styles.checkbox,
            value && styles.selectedCheckbox,
          ]}
        >
          {value && (
            <IconCheckbox
              width={14}
              height={14}
              stroke={colors.neutral[100]}
            />
          )}
        </View>
        <Text style={styles.checkboxText}>
          {label}
        </Text>
      </TouchableOpacity>
  )
}
export default Checkbox;