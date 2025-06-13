module.exports = {
  root: true,
  parser: '@babel/eslint-parser',
  parserOptions: {
    requireConfigFile: true,
    babelOptions: { configFile: './babel.config.js' },
    ecmaVersion: 2021,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  env: {
    'react-native/react-native': true,
    es2021: true,
  },
  extends: [
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    '@react-native',
    'plugin:import/errors',
    'plugin:import/warnings',
  ],
  plugins: [
    'react',
    'react-native',
    'react-hooks',
    'import',
  ],
  settings: {
    'import/core-modules': ['react-native'],

    'import/resolver': {
      'babel-module': {
        root: ['./src'],
        alias: { '@': './src' },
        extensions: ['.js', '.jsx', '.json'],
      },
    },
  },
  rules: {
    'import/no-unresolved': ['error', { ignore: ['react-native'] }],
  },
};
