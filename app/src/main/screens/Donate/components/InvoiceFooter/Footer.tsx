import React from 'react';

import Button from 'components/Button/Button';
import { CommonActions, useNavigation } from '@react-navigation/native';
import { PATHS_DONATE_TAB, PATHS_HOME_TAB } from 'main/navigators/paths';
import { View } from 'react-native';

interface FooterProps {
  isNew?: boolean;
  onSave: () => void;
  onShare: () => void;
}

export default function Footer(props: FooterProps) {
  const navigation = useNavigation();

  const navigateToHomeScreen = () => {
    navigation.navigate('Home', {
      screen: PATHS_HOME_TAB.homeTabMain,
    });

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: PATHS_DONATE_TAB.donateTabMain }],
      }),
    );
  };

  const navigateHistory = () => {
    navigation.navigate('Donate', {
      screen: PATHS_DONATE_TAB.donateTabMain,
      params: {
        showHistory: true,
      },
    });
  };

  return (
    <View style={{ justifyContent: 'flex-end' }}>
      <Button
        title={props.isNew ? 'Go Home' : 'Share'}
        variant="primary"
        onPress={props.isNew ? navigateToHomeScreen : props.onShare}
      />
      <Button
        title={props.isNew ? 'Donation history' : 'Download'}
        variant="secondary"
        onPress={props.isNew ? navigateHistory : props.onSave}
      />
    </View>
  );
}
