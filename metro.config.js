const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add resolver configuration for path aliases
config.resolver.alias = {
  '$components': path.resolve(__dirname, 'lib/components'),
  '$helpers': path.resolve(__dirname, 'lib/helpers'),
  '$redux': path.resolve(__dirname, 'lib/redux'),
  '$hooks': path.resolve(__dirname, 'lib/hooks'),
  '$constants': path.resolve(__dirname, 'lib/constants'),
  '$assets': path.resolve(__dirname, 'assets'),
  '$services': path.resolve(__dirname, 'src/services'),
  '$utils': path.resolve(__dirname, 'src/utils'),
  '$types': path.resolve(__dirname, 'lib/types'),
};

module.exports = config;
