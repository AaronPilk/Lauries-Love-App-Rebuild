import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

// providers
import { useUserAWSProvider } from 'providers/UserAWSProvider/UserAWSProvider';

const useAuth = (isNotBack: boolean = false) => {
  const { userAWS, signOutAWS } = useUserAWSProvider();
  const navigation = useNavigation();

  const logOut = async () => {
    try {
      if (userAWS) await signOutAWS();
      navigation.navigate('Authentication', {
        screen: 'login',
      });
    } catch (error) {
      if (__DEV__) console.warn('Failed to log out', error);
    }
  };

  const onPressBack = async () => {
    const isBack = navigation.canGoBack();

    if (isBack && !isNotBack) navigation.goBack();
    else
      Alert.alert('Log out', 'Are you sure you want to log out?', [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log out',
          onPress: logOut,
        },
      ]);
  };

  return {
    onPressBack,
  };
};

export default useAuth;
