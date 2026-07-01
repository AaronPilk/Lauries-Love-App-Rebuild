module.exports = {
  presets: [
    'babel-preset-expo',
  ],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ts', '.tsx', '.js', '.ios.js', '.android.js', '.json'],
        alias: {
          '@': './src',
          presentation: './src/presentation',
          types: './@types',
          domain: './src/domain',
          infra: './src/infra',
          main: './src/main',
          data: './src/data',
          components: './src/components',
        },
      },
    ],
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin',
  ],
  overrides: [
    {
      test: fileName => !fileName.includes('node_modules/react-native-maps'),
      plugins: [
        ['@babel/plugin-transform-class-properties', { loose: true }],
        ['@babel/plugin-transform-private-methods', { loose: true }],
        ['@babel/plugin-transform-private-property-in-object', { loose: true }],
      ],
    },
  ],
};
