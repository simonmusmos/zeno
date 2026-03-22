import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const fonts = {
  displayBold:    'Manrope_800ExtraBold',
  displayRegular: 'Manrope_400Regular',
  sansSemiBold:   'Manrope_600SemiBold',
  sansMedium:     'Manrope_500Medium',
  sansRegular:    'Manrope_400Regular',
} as const;

export const typography = StyleSheet.create({
  wordmark: {
    fontFamily: fonts.displayBold,
    fontSize: 48,
    letterSpacing: 8,
    color: colors.accent,
  },
  displayHero: {
    fontFamily: fonts.displayBold,
    fontSize: 52,
    letterSpacing: -1,
    color: colors.textPrimary,
  },
  displayLarge: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    letterSpacing: -0.5,
    color: colors.textPrimary,
  },
  headingLarge: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.textPrimary,
  },
  headingMedium: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 20,
    color: colors.textPrimary,
  },
  bodyLarge: {
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    lineHeight: 24,
    color: colors.textPrimary,
  },
  bodyMedium: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  caption: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.textMuted,
  },
  link: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.accent,
  },
});
