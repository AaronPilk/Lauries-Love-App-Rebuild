import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    preset: 'react-native',
    verbose: true,
    setupFilesAfterEnv: [
      './node_modules/react-native-gesture-handler/jestSetup.js',
      // NOTE: jest.setup.js was intentionally dropped from the run — it still
      // jest.mock()s legacy SDKs that were purged from the app (redux-persist,
      // aws-amplify, aws-sdk, etc.), and its `requireActual('redux-persist')`
      // throws now that the package is gone, which broke the ENTIRE suite.
      // Adapter/mapper tests mock their own deps and need none of that setup.
    ],
    transform: {
      // babel-preset-expo (see babel.config.js) already injects the Hermes
      // parser plugin — declaring it again here caused babel to throw
      // "More than one plugin attempted to override parsing".
      '^.+\\.(js|ts|tsx)$': 'babel-jest',
    },
    transformIgnorePatterns: [
      'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation|redux-persist|@miblanchard/react-native-slider|native-base|uuid|react-redux)/',
    ],
    moduleNameMapper: {
      '\\.wav$': '<rootDir>/__mocks__/fileMock.js',
      'react-native-video': '<rootDir>/__mocks__/react-native-video.js',
    },
    testEnvironment: 'jsdom',
  };
};
