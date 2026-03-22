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
import { colors, spacing } from '../../theme';
import { fonts } from '../../theme/typography';

interface LineInputProps extends TextInputProps {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  isPassword?: boolean;
}

/**
 * Hairline input — no box, no card, just a label and a line.
 * The focus indicator scales in from the left, gold.
 * Feels like editorial / private banking design.
 */
export function LineInput({
  label,
  error,
  containerStyle,
  isPassword = false,
  value = '',
  onChangeText,
  secureTextEntry,
  ...rest
}: LineInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const lineScale = useRef(new Animated.Value(value.length > 0 ? 1 : 0)).current;

  const animateLine = (toValue: number) => {
    Animated.timing(lineScale, {
      toValue,
      duration: 250,
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      useNativeDriver: true,
    }).start();
  };

  const handleFocus = () => {
    setIsFocused(true);
    animateLine(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value || value.length === 0) animateLine(0);
  };

  const secure = (isPassword || secureTextEntry) ? !isVisible : false;
  const showToggle = isPassword || secureTextEntry;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      <Text style={[styles.label, isFocused && styles.labelFocused]}>
        {label}
      </Text>

      {/* Input row */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure}
          placeholderTextColor={colors.textDisabled}
          selectionColor={colors.accent}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {showToggle && (
          <Pressable onPress={() => setIsVisible(v => !v)} hitSlop={12}>
            <Text style={styles.toggle}>{isVisible ? 'HIDE' : 'SHOW'}</Text>
          </Pressable>
        )}
      </View>

      {/* Base hairline */}
      <View style={styles.baseLine} />

      {/* Animated focus line — grows from left */}
      <Animated.View
        style={[
          styles.focusLine,
          { transform: [{ scaleX: lineScale }] },
          !!error && styles.errorLine,
        ]}
      />

      {/* Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.xs,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  labelFocused: {
    color: colors.accent,
    opacity: 0.8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 17,
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  toggle: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.textMuted,
    paddingLeft: spacing.sm,
  },
  baseLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  focusLine: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: colors.accent,
    transformOrigin: 'left', // hint: scaleX from left via translateX trick below
  },
  errorLine: {
    backgroundColor: colors.error,
  },
  errorText: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: colors.error,
    marginTop: 6,
    letterSpacing: 0.2,
  },
});
