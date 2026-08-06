// Sentry removed (was breaking the Xcode 26 build). Use Expo's default Metro
// config directly instead of Sentry's getSentryExpoConfig wrapper.
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
