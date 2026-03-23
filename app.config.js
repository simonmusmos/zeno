// Reads .env values and exposes them via Constants.expoConfig.extra
// .env is gitignored — never committed.
const { TIINGO_TOKEN } = process.env;

module.exports = ({ config }) => ({
  ...config,
  extra: {
    ...config.extra,
    tiingoToken: TIINGO_TOKEN ?? '',
  },
});
