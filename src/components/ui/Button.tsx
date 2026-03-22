import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../../theme';
import { fonts } from '../../theme/typography';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  isLoading = false,
  disabled,
  style,
  fullWidth = true,
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.timing(scale, {
      toValue: 0.97, duration: 90,
      easing: Easing.out(Easing.quad), useNativeDriver: true,
    }).start();

  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1, friction: 5, tension: 180, useNativeDriver: true,
    }).start();

  const content = isLoading ? (
    <ActivityIndicator
      size="small"
      color={variant === 'primary' ? '#1A1000' : colors.accent}
    />
  ) : (
    <Text style={[styles.label, styles[`${variant}Label`], styles[`${size}LabelSize`]]}>
      {label}
    </Text>
  );

  return (
    <Animated.View
      style={[fullWidth && styles.fullWidth, { transform: [{ scale }] }, style]}
    >
      {/* Shadow glow only on primary */}
      {variant === 'primary' && !isDisabled && (
        <View style={styles.glowLayer} pointerEvents="none" />
      )}

      <Pressable
        style={[styles.base, styles[`${size}Size`], styles[variant], isDisabled && styles.disabled]}
        disabled={isDisabled}
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={onPress}
        {...rest}
      >
        {/* Gradient fill for primary */}
        {variant === 'primary' && (
          <LinearGradient
            colors={['#E8B828', '#B07C0A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}
        {content}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { width: '100%' },
  glowLayer: {
    position: 'absolute',
    inset: -1,
    borderRadius: radii.md + 1,
    backgroundColor: 'transparent',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  disabled: { opacity: 0.35 },

  primary:   { borderColor: 'transparent', backgroundColor: colors.primary },
  secondary: { borderColor: colors.border, backgroundColor: colors.transparent },
  ghost:     { borderColor: 'transparent', backgroundColor: colors.transparent },

  smSize: { paddingVertical: 10, paddingHorizontal: spacing.md },
  mdSize: { paddingVertical: 14, paddingHorizontal: spacing.lg },
  lgSize: { paddingVertical: 17, paddingHorizontal: spacing.lg },

  label:          { letterSpacing: 0.2 },
  primaryLabel:   { fontFamily: fonts.sansSemiBold, fontSize: 15, color: '#1A1000' },
  secondaryLabel: { fontFamily: fonts.sansMedium,   fontSize: 15, color: colors.textSecondary },
  ghostLabel:     { fontFamily: fonts.sansMedium,   fontSize: 15, color: colors.textMuted },

  smLabelSize: { fontSize: 13 },
  mdLabelSize: { fontSize: 14 },
  lgLabelSize: { fontSize: 15 },
});
