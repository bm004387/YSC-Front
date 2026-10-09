module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [['module:react-native-dotenv', { whitelist: ['API_BASE_URL'] }]],
};
