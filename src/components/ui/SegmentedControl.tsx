import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors } from '../../theme';
import { fonts } from '../../theme/typography';

interface Option {
  label: string;
  value: string;
}

interface SegmentedControlProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
}

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map(opt => {
        const active = opt.value === value;
        return (
          <TabOption
            key={opt.value}
            label={opt.label}
            active={active}
            onPress={() => onChange(opt.value)}
          />
        );
      })}
      {/* Hairline base — sits behind all active indicators */}
      <View style={styles.baseHairline} pointerEvents="none" />
    </View>
  );
}

function TabOption({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const opacity = useRef(new Animated.Value(active ? 1 : 0.45)).current;

  const handlePressIn = () => {
    if (!active) {
      Animated.timing(opacity, { toValue: 0.7, duration: 80, useNativeDriver: true }).start();
    }
  };
  const handlePressOut = () => {
    if (!active) {
      Animated.timing(opacity, { toValue: 0.45, duration: 120, useNativeDriver: true }).start();
    }
  };

  return (
    <Pressable
      style={styles.tab}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.Text style={[styles.label, active && styles.labelActive, { opacity }]}>
        {label}
      </Animated.Text>
      {/* Active gold underline — overlaps base hairline */}
      {active && <View style={styles.activeIndicator} />}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'relative',
  },
  baseHairline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  label: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    letterSpacing: -0.1,
    color: colors.textSecondary,
  },
  labelActive: {
    fontFamily: fonts.displayBold,
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
});
