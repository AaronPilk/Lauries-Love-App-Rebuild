import type { Config } from 'jest';

export default async (): Promise<Config> => {
  return {
    preset: 'react-native',
    verbose: true,
    setupFilesAfterEnv: [
      './node_modules/react-native-gesture-handler/jestSetup.js',
      '<rootDir>/jest.setup.js',
    ],
    transform: {
      '^.+\\.(js)$': [
        'babel-jest',
        {
          plugins: ['babel-plugin-syntax-hermes-parser'],
        },
      ],
      '^.+\\.(ts|tsx)$': 'babel-jest',
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
