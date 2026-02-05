// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Alias para imports con @
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`
};

module.exports = config;
