import React, { FunctionComponent } from 'react';
import { Keyboard, Platform, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// styles
import styles from './BackgroundDonate.styles';

type BackgroundDonateProps = {
  children: React.ReactNode;
};

const BackgroundDonate: FunctionComponent<BackgroundDonateProps> = ({
  children,
}) => {
  const { top } = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.universalContainer,
        { paddingTop: Platform.OS === 'android' ? 16 : top },
      ]}
    >
      {children}
    </View>
  );
};

export default BackgroundDonate;
