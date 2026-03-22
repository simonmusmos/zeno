import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../theme';

interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  if (!label) {
    return <View style={styles.line} />;
  }

  return (
    <View style={styles.row}>
      <View style={[styles.line, styles.flex]} />
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.line, styles.flex]} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
  line: {
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    fontSize: 12,
    color: colors.textDisabled,
    fontWeight: '500',
  },
});
