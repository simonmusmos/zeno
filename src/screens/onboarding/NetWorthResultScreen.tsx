import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { formatCurrency } from '../../data/currencies';
import { useAuth } from '../../store/auth.store';
import { useOnboarding } from '../../store/onboarding.store';
import { colors, spacing, radii } from '../../theme';
import { fonts } from '../../theme/typography';
import type { OnboardingStackParamList } from '../../types/navigation.types';

function sparklePath(cx: number, cy: number, s: number): string {
  const i = s * 0.2;
  return (
    `M ${cx} ${cy - s} L ${cx + i} ${cy - i} L ${cx + s} ${cy} ` +
    `L ${cx + i} ${cy + i} L ${cx} ${cy + s} L ${cx - i} ${cy + i} ` +
    `L ${cx - s} ${cy} L ${cx - i} ${cy - i} Z`
  );
}

const SPARKLES = [
  { x: 340, y: 60,  s: 5,   gold: true,  op: 0.75 },
  { x: 300, y: 140, s: 3.5, gold: true,  op: 0.50 },
  { x: 50,  y: 100, s: 3,   gold: false, op: 0.35 },
  { x: 358, y: 340, s: 3.5, gold: false, op: 0.35 },
  { x: 26,  y: 300, s: 3,   gold: true,  op: 0.40 },
];

const CURRENCIES_MAP: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', PHP: '₱',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', HKD: 'HK$', SGD: 'S$',
  MYR: 'RM', INR: '₹', CNY: '¥', KRW: '₩', THB: '฿',
  IDR: 'Rp', AED: 'د.إ', BRL: 'R$', TRY: '₺', NGN: '₦',
};

type Props = NativeStackScreenProps<OnboardingStackParamList, 'NetWorthResult'>;

export function NetWorthResultScreen({ navigation }: Props) {
  const { netWorth, assets, liabilities, accounts, baseCurrency } = useOnboarding();
  const { loginWithGoogle, completeAsGuest, isLoading } = useAuth();

  const heroOp   = useRef(new Animated.Value(0)).current;
  const heroY    = useRef(new Animated.Value(20)).current;
  const cardsOp  = useRef(new Animated.Value(0)).current;
  const listOp   = useRef(new Animated.Value(0)).current;
  const sheetY   = useRef(new Animated.Value(120)).current;
  const sheetOp  = useRef(new Animated.Value(0)).current;

  const counter = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState('0.00');

  useEffect(() => {
    counter.setValue(0);
    setDisplayValue('0.00');

    const listenerId = counter.addListener(({ value }) => {
      setDisplayValue(
        value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      );
    });

    Animated.sequence([
      Animated.parallel([
        Animated.timing(heroOp,  { toValue: 1, duration: 500, easing: Easing.out(Easing.quad),  useNativeDriver: true }),
        Animated.timing(heroY,   { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(counter, { toValue: Math.abs(netWorth), duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      ]),
      Animated.timing(cardsOp, { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(listOp,  { toValue: 1, duration: 300, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(sheetOp, { toValue: 1, duration: 420, easing: Easing.out(Easing.quad),  useNativeDriver: true }),
        Animated.timing(sheetY,  { toValue: 0, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();

    return () => counter.removeListener(listenerId);
  }, [netWorth]);

  const ccy = CURRENCIES_MAP[baseCurrency.code] ?? baseCurrency.symbol ?? baseCurrency.code;

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#0D1830', colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
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

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero ─────────────────────────────────────── */}
          <Animated.View style={[styles.hero, { opacity: heroOp, transform: [{ translateY: heroY }] }]}>
            <View style={styles.heroOrb} pointerEvents="none" />
            <Text style={styles.heroLabel}>YOUR NET WORTH</Text>
            <View style={styles.heroAmountRow}>
              {netWorth < 0 && <Text style={styles.heroSign}>−</Text>}
              <Text style={styles.heroCcy}>{ccy}</Text>
              <Text style={styles.heroAmount}>{displayValue}</Text>
            </View>
            {accounts.length === 0 && (
              <Text style={styles.heroEmpty}>No accounts added yet.</Text>
            )}
          </Animated.View>

          {/* ── Stats bar ────────────────────────────────── */}
          {accounts.length > 0 && (
            <Animated.View style={[styles.statsBar, { opacity: cardsOp }]}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>ASSETS</Text>
                <Text style={styles.assetAmount}>
                  {formatCurrency(assets, baseCurrency.code)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>LIABILITIES</Text>
                <Text style={styles.liabilityAmount}>
                  {formatCurrency(liabilities, baseCurrency.code)}
                </Text>
              </View>
            </Animated.View>
          )}

          {/* ── Accounts list ────────────────────────────── */}
          {accounts.length > 0 && (
            <Animated.View style={[styles.accountList, { opacity: listOp }]}>
              <Text style={styles.sectionLabel}>ACCOUNTS</Text>
              {accounts.map((acc, idx) => (
                <View
                  key={acc.id}
                  style={[
                    styles.accountRow,
                    idx < accounts.length - 1 && styles.accountRowBorder,
                  ]}
                >
                  <View style={[
                    styles.accountDot,
                    acc.type === 'debt' ? styles.dotDebt : styles.dotAsset,
                  ]} />
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>{acc.name}</Text>
                    <Text style={styles.accountType}>{acc.type}</Text>
                  </View>
                  <Text style={[
                    styles.accountBalance,
                    acc.type === 'debt' && styles.balanceDebt,
                  ]}>
                    {formatCurrency(acc.balanceInBase, baseCurrency.code)}
                  </Text>
                </View>
              ))}
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* ── Auth bottom sheet ─────────────────────────── */}
      <Animated.View
        style={[styles.sheet, { opacity: sheetOp, transform: [{ translateY: sheetY }] }]}
      >
        {/* Gold top accent */}
        <View style={styles.sheetAccentWrap}>
          <View style={styles.sheetAccent} />
        </View>

        <View style={styles.handle} />

        <SafeAreaView edges={['bottom']}>
          {/* Step badge */}
          <View style={styles.stepBadge}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>STEP 4 OF 4</Text>
          </View>

          {/* Headline row */}
          <View style={styles.headlineRow}>
            <View style={styles.headlineTextWrap}>
              <Text style={styles.title}>Secure your data.</Text>
              <Text style={styles.subtitle}>
                Sign in to sync across devices and never lose your numbers.
              </Text>
            </View>
          </View>

          {/* Google button */}
          <GoogleButton onPress={loginWithGoogle} isLoading={isLoading} />

          {/* Or divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* Skip */}
          <Pressable
            style={styles.skipButton}
            onPress={completeAsGuest}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Continue without an account"
          >
            <Text style={styles.skipText}>Continue without an account</Text>
          </Pressable>

          <Text style={styles.finePrint}>
            By continuing you agree to our Terms & Privacy Policy.
          </Text>
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

// ── Google button ─────────────────────────────────────────────────────────────

function GoogleButton({ onPress, isLoading }: { onPress: () => void; isLoading: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[styles.googleWrap, { transform: [{ scale }] }]}>
      <Pressable
        style={[styles.googleButton, isLoading && styles.googleButtonDisabled]}
        disabled={isLoading}
        onPressIn={() =>
          Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, friction: 5, tension: 180, useNativeDriver: true }).start()
        }
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        accessibilityState={{ disabled: isLoading }}
      >
        {isLoading ? (
          <>
            <View style={styles.loadingDot} />
            <Text style={styles.googleLabel}>Signing in…</Text>
          </>
        ) : (
          <>
            <GoogleGIcon size={19} />
            <Text style={styles.googleLabel}>Continue with Google</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

function GoogleGIcon({ size = 20 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <Path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </Svg>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 320, // leave room for sheet
  },

  // Hero
  hero: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(20,40,100,0.55)',
  },
  heroLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 3,
    color: colors.accent,
    opacity: 0.75,
    marginBottom: 14,
  },
  heroAmountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  heroSign: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.5,
    color: colors.liabilityColor,
    lineHeight: 58,
  },
  heroCcy: {
    fontFamily: fonts.displayBold,
    fontSize: 30,
    letterSpacing: -0.5,
    color: colors.textMuted,
    lineHeight: 58,
  },
  heroAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 52,
    letterSpacing: -1.8,
    color: colors.textPrimary,
    lineHeight: 58,
  },
  heroEmpty: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: 6,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: 14,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 2,
    color: colors.textMuted,
  },
  assetAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    letterSpacing: -0.5,
    color: colors.assetColor,
  },
  liabilityAmount: {
    fontFamily: fonts.displayBold,
    fontSize: 17,
    letterSpacing: -0.5,
    color: colors.liabilityColor,
  },

  // Account list
  accountList: {
    marginHorizontal: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  sectionLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    gap: spacing.md,
  },
  accountRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  accountDot: {
    width: 8,
    height: 8,
    borderRadius: radii.full,
  },
  dotAsset: { backgroundColor: colors.assetColor },
  dotDebt:  { backgroundColor: colors.liabilityColor },
  accountInfo: { flex: 1 },
  accountName: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    letterSpacing: -0.1,
    color: colors.textPrimary,
  },
  accountType: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  accountBalance: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    letterSpacing: -0.2,
    color: colors.assetColor,
  },
  balanceDebt: { color: colors.liabilityColor },

  // ── Auth sheet ──────────────────────────────────────────────────────────────
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: colors.border,
    paddingHorizontal: spacing.xl,
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 20,
  },
  sheetAccentWrap: {
    paddingTop: 14,
    paddingBottom: 10,
    alignItems: 'center',
  },
  sheetAccent: {
    width: 60,
    height: 2,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
    opacity: 0.45,
  },
  handle: {
    width: 32,
    height: 3,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
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
  headlineRow: {
    marginBottom: spacing.lg,
  },
  headlineTextWrap: {
    flex: 1,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 32,
    letterSpacing: -1.2,
    lineHeight: 36,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  // Google button
  googleWrap: {
    marginBottom: spacing.md,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: radii.md,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  googleButtonDisabled: { opacity: 0.55 },
  googleLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 15,
    letterSpacing: -0.1,
    color: '#1A1A1A',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BDBDBD',
  },

  // Or divider
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  orLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  orText: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },

  // Skip
  skipButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  skipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
    textDecorationColor: colors.border,
  },
  finePrint: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
    opacity: 0.55,
    paddingBottom: spacing.sm,
  },
});
