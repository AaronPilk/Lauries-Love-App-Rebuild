import React, { FunctionComponent, useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// types
import { LoggedOutParamList } from 'types/navigation';

// providers
import { useUserDBProvider } from 'providers/UserDBProvider/UserDBProvider';

// navigators
import AuthenticationNavigator from './auth/auth.navigator';

// screens
import IntroScreen from 'main/screens/Intro/intro.screen';

const Stack = createStackNavigator<LoggedOutParamList>();

const LoggedOutNavigator: FunctionComponent = () => {
  const { userDB } = useUserDBProvider();

  const initialRouteName = useMemo(
    () => (userDB ? 'Authentication' : 'Intro'),
    [userDB],
  );

  return (
    <Stack.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Intro"
        component={IntroScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen name="Authentication" component={AuthenticationNavigator} />
    </Stack.Navigator>
  );
};

export default LoggedOutNavigator;
