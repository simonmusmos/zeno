import React, { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors, radii, spacing } from '../../theme';

interface AnimatedInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

/**
 * Floating label input — the label lives inside the field and
 * animates up + shrinks when the field is focused or has a value.
 */
export function AnimatedInput({
  label,
  error,
  containerStyle,
  isPassword = false,
  value = '',
  onChangeText,
  secureTextEntry,
  ...rest
}: AnimatedInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const raised = isFocused || (value !== undefined && value.length > 0);
  const floatAnim = useRef(new Animated.Value(raised ? 1 : 0)).current;

  const animate = (toValue: number) => {
    Animated.timing(floatAnim, {
      toValue,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animate(1);
    rest.onFocus?.(undefined as any);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value || value.length === 0) animate(0);
    rest.onBlur?.(undefined as any);
  };

  const labelTop = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 8],
  });

  const labelSize = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 11],
  });

  const labelOpacity = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1],
  });

  const secure = (isPassword || secureTextEntry) ? !isVisible : false;
  const showToggle = isPassword || secureTextEntry;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={[
          styles.container,
          isFocused && styles.containerFocused,
          !!error && styles.containerError,
        ]}
      >
        {/* Floating label */}
        <Animated.Text
          style={[
            styles.label,
            {
              top: labelTop,
              fontSize: labelSize,
              opacity: labelOpacity,
              color: isFocused ? colors.accent : colors.textSecondary,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Animated.Text>

        {/* Text input */}
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholderTextColor="transparent"
          selectionColor={colors.primary}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />

        {/* Password visibility toggle */}
        {showToggle && (
          <Pressable
            onPress={() => setIsVisible(v => !v)}
            style={styles.toggle}
            hitSlop={12}
          >
            <Text style={styles.toggleText}>{isVisible ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  container: {
    height: 64,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-end',
    position: 'relative',
  },
  containerFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceRaised,
  },
  containerError: {
    borderColor: colors.error,
  },
  label: {
    position: 'absolute',
    left: spacing.md,
    fontWeight: '500',
    letterSpacing: 0.2,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '400',
    color: colors.textPrimary,
    paddingBottom: 10,
    paddingTop: 0,
    height: 64,
  },
  toggle: {
    paddingBottom: 10,
    paddingLeft: spacing.sm,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    paddingHorizontal: 2,
  },
});
