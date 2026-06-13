const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix: lucide-react-native uses .mjs ESM icons that Metro can't resolve by default on web
config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  'mjs',
];

module.exports = withNativeWind(config, { input: "./src/global.css" });

