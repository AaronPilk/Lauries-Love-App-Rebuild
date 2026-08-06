import { registerRootComponent } from 'expo';
import { LogBox } from 'react-native';
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';

import App from './src/main/App';

// Set up Firebase messaging background handler
// Wrap in try-catch in case Firebase isn't initialized yet
try {
  const messaging = require('@react-native-firebase/messaging').default;
  messaging().setBackgroundMessageHandler(async (remoteMessage: any) => {
    // Background message handler
  });
} catch (error) {
  // Firebase messaging not initialized
}

registerRootComponent(App);
