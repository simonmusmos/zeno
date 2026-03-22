import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Button } from '../../components/ui';
import { CURRENCIES } from '../../data/currencies';
import { useOnboarding } from '../../store/onboarding.store';
import { colors, spacing, radii } from '../../theme';
import { fonts } from '../../theme/typography';
import type { Currency } from '../../types/currency.types';
import type { OnboardingStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'BaseCurrency'>;

function sparklePath(cx: number, cy: number, s: number): string {
  const i = s * 0.2;
  return (
    `M ${cx} ${cy - s} L ${cx + i} ${cy - i} L ${cx + s} ${cy} ` +
    `L ${cx + i} ${cy + i} L ${cx} ${cy + s} L ${cx - i} ${cy + i} ` +
    `L ${cx - s} ${cy} L ${cx - i} ${cy - i} Z`
  );
}

const SPARKLES = [
  { x: 338, y: 72,  s: 5.5, gold: true,  op: 0.80 },
  { x: 298, y: 130, s: 3.5, gold: true,  op: 0.55 },
  { x: 52,  y: 110, s: 3,   gold: false, op: 0.38 },
  { x: 358, y: 420, s: 4.5, gold: true,  op: 0.60 },
  { x: 24,  y: 380, s: 3,   gold: false, op: 0.35 },
  { x: 362, y: 680, s: 4,   gold: false, op: 0.38 },
  { x: 40,  y: 720, s: 3.5, gold: true,  op: 0.45 },
];

export function BaseCurrencyScreen({ navigation }: Props) {
  const { baseCurrency, setBaseCurrency } = useOnboarding();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Currency>(baseCurrency);

  const headerOp = useRef(new Animated.Value(0)).current;
  const headerY  = useRef(new Animated.Value(20)).current;
  const listOp   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOp, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(headerY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(listOp, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const filtered = query.trim()
    ? CURRENCIES.filter(
        c =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : CURRENCIES;

  const handleContinue = () => {
    setBaseCurrency(selected);
    navigation.navigate('AddAccount');
  };

  return (
    <View style={styles.root}>
      {/* Background — matches HookScreen */}
      <LinearGradient
        colors={['#0D1830', colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Sparkle stars */}
      <Svg
        width="390" height="844" viewBox="0 0 390 844"
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        {SPARKLES.map((sp, i) => (
          <Path
            key={i}
            d={sparklePath(sp.x, sp.y, sp.s)}
            fill={sp.gold ? colors.accent : '#FFFFFF'}
            opacity={sp.op}
          />
        ))}
      </Svg>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* ── Header ─────────────────────────────────────── */}
        <Animated.View
          style={[styles.header, { opacity: headerOp, transform: [{ translateY: headerY }] }]}
          accessibilityLabel="Step 2 of 4 — Base Currency"
        >
          <View style={styles.stepBadge} accessibilityElementsHidden>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>STEP 2 OF 4</Text>
          </View>
          <Text style={styles.title}>Base{'\n'}Currency</Text>
          <Text style={styles.subtitle}>
            All accounts are converted to this for totals.
          </Text>
        </Animated.View>

        {/* ── Search ─────────────────────────────────────── */}
        <View
          style={styles.searchWrap}
          accessibilityLabel="Search currencies"
        >
          <Ionicons name="search" size={16} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search currencies…"
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.accent}
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search currencies"
            accessibilityHint="Filter the list by currency name or code"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => setQuery('')}
              hitSlop={12}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={17} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>

        {/* ── Currency list ───────────────────────────────── */}
        <Animated.View style={[{ flex: 1 }, { opacity: listOp }]}>
          <FlatList
            data={filtered}
            keyExtractor={item => item.code}
            style={styles.list}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel="Currency list"
            renderItem={({ item }) => (
              <CurrencyRow
                currency={item}
                isSelected={selected.code === item.code}
                onPress={() => setSelected(item)}
              />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </Animated.View>

        {/* ── CTA ────────────────────────────────────────── */}
        <View style={styles.cta}>
          <Button
            label={`Continue with ${selected.code}`}
            onPress={handleContinue}
            accessibilityLabel={`Continue with ${selected.name} (${selected.code})`}
            accessibilityHint="Proceed to the next onboarding step"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

function CurrencyRow({
  currency,
  isSelected,
  onPress,
}: {
  currency: Currency;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[styles.row, isSelected && styles.rowSelected]}
        onPressIn={() =>
          Animated.timing(scale, { toValue: 0.98, duration: 80, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }).start()
        }
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ checked: isSelected }}
        accessibilityLabel={`${currency.name}, ${currency.code}, ${currency.symbol}`}
        accessibilityHint={isSelected ? 'Currently selected' : 'Tap to select this currency'}
      >
        {/* Left accent bar */}
        <View style={[styles.selectBar, isSelected && styles.selectBarActive]} />

        {/* Symbol box */}
        <View style={[styles.rowSymbolBox, isSelected && styles.rowSymbolBoxActive]}>
          <Text
            style={[styles.rowSymbol, isSelected && styles.rowSymbolActive]}
            accessibilityElementsHidden
          >
            {currency.symbol}
          </Text>
        </View>

        {/* Name + code */}
        <View style={styles.rowInfo}>
          <Text style={[styles.rowCode, isSelected && styles.rowCodeActive]}>
            {currency.code}
          </Text>
          <Text style={styles.rowName}>{currency.name}</Text>
        </View>

        {isSelected && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={colors.accent}
            accessibilityElementsHidden
          />
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.md,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
  stepText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.accent,
    opacity: 0.8,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 40,
    lineHeight: 44,
    letterSpacing: -1.5,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    gap: spacing.sm,
  },
  searchIcon: {
    width: 16,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
    margin: 0,
  },

  // List
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.lg,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.xl + 3 + 12 + 40 + 12,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingRight: spacing.md,
    gap: 12,
  },
  rowSelected: {
    backgroundColor: 'rgba(212,165,32,0.07)',
  },
  selectBar: {
    width: 3,
    height: 34,
    borderRadius: 2,
    backgroundColor: 'transparent',
    marginLeft: spacing.md,
  },
  selectBarActive: {
    backgroundColor: colors.accent,
  },
  rowSymbolBox: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowSymbolBoxActive: {
    backgroundColor: 'rgba(212,165,32,0.12)',
    borderColor: 'rgba(212,165,32,0.30)',
  },
  rowSymbol: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: colors.textSecondary,
  },
  rowSymbolActive: {
    color: colors.accent,
  },
  rowInfo: {
    flex: 1,
  },
  rowCode: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    letterSpacing: -0.1,
    color: '#FFFFFF',
  },
  rowCodeActive: {
    color: colors.accent,
  },
  rowName: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // CTA
  cta: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
});
