import 'whatwg-fetch';
import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import mockRNCNetInfo from '@react-native-community/netinfo/jest/netinfo-mock.js';

jest.mock('@react-native-community/netinfo', () => mockRNCNetInfo);
jest.mock('redux-persist', () => {
  const real = jest.requireActual('redux-persist');
  return {
    ...real,
    persistReducer: jest
      .fn()
      .mockImplementation((config, reducers) => reducers),
  };
});

// Silence the warning: Animated: `useNativeDriver` is not supported because the native animated module is missing
jest.mock('react-native/Libraries/Animated/AnimatedMock');

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('aws-amplify', () => ({
  Auth: {
    signIn: jest.fn(),
    signOut: jest.fn(),
    currentAuthenticatedUser: jest
      .fn()
      .mockResolvedValue({ username: 'test-user' }),
  },
  API: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock('aws-sdk', () => {
  return {
    config: {
      region: 'us-west-2',
    },
    S3: jest.fn().mockImplementation(() => ({
      getObject: jest.fn().mockResolvedValue({ Body: 'mocked data' }),
    })),
  };
});

jest.mock('react-native-device-info', () => {
  return {
    getUniqueId: jest.fn(() => 'test-device-id'),
    getSystemName: jest.fn(() => 'iOS'),
    getDeviceName: jest.fn(() => Promise.resolve('Test Device')),
  };
});

jest.mock('react-native-fs', () => {
  return {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  };
});

jest.mock('@react-native-firebase/messaging', () => {
  return {
    getToken: jest.fn().mockResolvedValue('mocked-token'),
    onMessage: jest.fn(),
    requestPermission: jest.fn().mockResolvedValue(true),
  };
});

jest.mock('react-native-file-viewer', () => {
  return {
    open: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('react-native-sound', () => {
  return {
    IsAndroid: true,
  };
});

jest.mock('react-native-permissions', () => {
  return {
    request: jest.fn(() => Promise.resolve('granted')),
    PERMISSIONS: {
      ANDROID: {
        CAMERA: 'android.permission.CAMERA',
        LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      },
      IOS: {
        CAMERA: 'ios.permission.CAMERA',
        LOCATION: 'ios.permission.LOCATION',
      },
    },
  };
});

jest.mock('react-native-document-picker', () => {
  return {
    pickDocument: jest.fn(() =>
      Promise.resolve({ uri: 'mockUri', name: 'mockFile' }),
    ),
  };
});

jest.mock('react-native-blob-util', () => {
  return {
    fs: {
      writeFile: jest.fn().mockResolvedValue('mocked writeFile'),
      readFile: jest.fn().mockResolvedValue('mocked readFile'),
    },
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  };
});

jest.mock('react-native-webview', () => {
  return {
    WebView: 'WebView',
  };
});

jest.mock('aws-amplify', () => {
  return {
    Amplify: {
      configure: jest.fn(),
    },
  };
});

// TODO Later delete this library, need add lingui/i18next
jest.mock('react-i18next', () => ({
  useTranslation: () => {
    return {
      t: str => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
  initReactI18next: {
    type: '3rdParty',
    init: jest.fn(),
  },
  withTranslation: () => Component => {
    Component.defaultProps = { ...Component.defaultProps, t: () => '' };
    return Component;
  },
}));
