import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { colors } from '../../theme';
import { fonts } from '../../theme/typography';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface BoxInputProps extends TextInputProps {
  icon: IoniconsName;
  error?: string;
  isPassword?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Bordered box input with left icon — matches the reference design.
 * Dark surface, subtle border, focus highlight on border.
 */
export function BoxInput({
  icon,
  error,
  isPassword = false,
  containerStyle,
  value = '',
  onChangeText,
  placeholder,
  ...rest
}: BoxInputProps) {
  const [isFocused, setFocused] = useState(false);
  const [isVisible, setVisible] = useState(false);

  const secure = isPassword && !isVisible;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <View
        style={[
          styles.row,
          isFocused && styles.rowFocused,
          !!error && styles.rowError,
        ]}
      >
        <Ionicons
          name={icon}
          size={17}
          color={isFocused ? colors.accent : colors.textMuted}
          style={styles.iconLeft}
        />

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          selectionColor={colors.accent}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />

        {isPassword && (
          <Pressable onPress={() => setVisible(v => !v)} hitSlop={12} style={styles.eyeBtn}>
            <Ionicons
              name={isVisible ? 'eye-outline' : 'eye-off-outline'}
              size={17}
              color={colors.textMuted}
            />
          </Pressable>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    height: 54,
    paddingHorizontal: 14,
  },
  rowFocused: {
    borderColor: colors.accentDim,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  rowError: {
    borderColor: colors.error,
  },
  iconLeft: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    color: colors.textPrimary,
    padding: 0,
    margin: 0,
  },
  eyeBtn: {
    paddingLeft: 8,
  },
  error: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: colors.error,
    letterSpacing: 0.2,
    paddingHorizontal: 2,
  },
});
