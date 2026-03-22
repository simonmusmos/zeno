import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radii } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'raised' | 'ghost';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.base, styles[variant], style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    borderWidth: 1,
  },
  default: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    padding: 20,
  },
  raised: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    padding: 20,
  },
  ghost: {
    backgroundColor: colors.surfaceSubtle,
    borderColor: colors.borderSubtle,
    padding: 20,
  },
});
