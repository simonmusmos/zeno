import Constants from 'expo-constants';

/**
 * Tiingo API token — stored in .env (gitignored).
 * Set TIINGO_TOKEN=your_token in .env and rebuild.
 */
export const TIINGO_TOKEN: string =
  (Constants.expoConfig?.extra?.tiingoToken as string) ?? '';
