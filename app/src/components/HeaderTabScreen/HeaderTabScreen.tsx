import React, { FunctionComponent } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';

// icons
import { IconArrowLeft } from 'assets/icons-auto/components';

// styles
import styles from './HeaderTabScreen.styles';

type HeaderTabScreenProps = {
  title?: string;
  onPressLeft?: () => void;
};

const HeaderTabScreen: FunctionComponent<HeaderTabScreenProps> = ({
  title,
  onPressLeft,
}) => (
  <View style={styles.container}>
    <TouchableOpacity onPress={onPressLeft} style={styles.button}>
      <IconArrowLeft width={30} height={30} />
    </TouchableOpacity>
    <Text style={styles.label}>{title}</Text>
    <TouchableOpacity
      disabled
      onPress={onPressLeft}
      style={[styles.button, styles.buttonHide]}
    >
      <IconArrowLeft width={30} height={30} />
    </TouchableOpacity>
  </View>
);

export default HeaderTabScreen;
