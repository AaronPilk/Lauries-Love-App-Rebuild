module.exports = {
  env: {
    'jest/globals': true,
  },
  root: true,
  extends: '@react-native',
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-hooks/exhaustive-deps': 'off',
    quotes: ['error', 'single'],
    'object-curly-spacing': ['error', 'always'],
    'array-bracket-spacing': ['error', 'never'],
    'react/require-default-props': ['off'],
    'react/default-props-match-prop-types': ['error'],
    'react/sort-prop-types': ['error'],
    curly: 'off',
    '@typescript-eslint/func-call-spacing': 'off',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/no-shadow': ['error'],
        'no-shadow': 'off',
        'no-undef': 'off',
      },
    },
  ],
  settings: {
    'import/resolver': {
      'babel-module': {},
    },
  },
};
