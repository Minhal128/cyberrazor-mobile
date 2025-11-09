const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add support for .txt files as assets
config.resolver.assetExts.push('txt');

module.exports = config;
