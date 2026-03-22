import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useAuth } from '../../store/auth.store';
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
  { x: 330, y: 72,  s: 5.5, gold: true,  op: 0.80 },
  { x: 62,  y: 110, s: 3,   gold: false, op: 0.38 },
  { x: 298, y: 148, s: 3.5, gold: true,  op: 0.55 },
  { x: 358, y: 300, s: 4,   gold: false, op: 0.36 },
  { x: 30,  y: 260, s: 3,   gold: true,  op: 0.42 },
  { x: 48,  y: 390, s: 2.5, gold: false, op: 0.30 },
];

type Props = NativeStackScreenProps<OnboardingStackParamList, 'GoogleSignIn'>;

export function GoogleSignInScreen({ navigation }: Props) {
  const { loginWithGoogle, completeAsGuest, isLoading } = useAuth();

  const sheetY   = useRef(new Animated.Value(100)).current;
  const sheetOp  = useRef(new Animated.Value(0)).current;
  const bgOp     = useRef(new Animated.Value(0)).current;
  const heroOp   = useRef(new Animated.Value(0)).current;
  const heroScale = useRef(new Animated.Value(0.88)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(bgOp, {
        toValue: 1, duration: 350,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(heroOp, {
          toValue: 1, duration: 500,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.spring(heroScale, {
          toValue: 1, friction: 6, tension: 120, useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(sheetOp, {
          toValue: 1, duration: 420,
          easing: Easing.out(Easing.quad), useNativeDriver: true,
        }),
        Animated.timing(sheetY, {
          toValue: 0, duration: 420,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Background gradient */}
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOp }]}>
        <LinearGradient
          colors={['#0D1830', colors.background]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.75 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

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

        {/* ── Top identity ───────────────────────────────── */}
        <Animated.View style={[styles.topMark, { opacity: bgOp }]}>
          <View style={styles.logoDot} />
          <Text style={styles.wordmark}>ZENO</Text>
        </Animated.View>

        {/* ── Hero — Shield & glow ────────────────────────── */}
        <View style={styles.heroWrap}>
          <Animated.View style={[styles.heroInner, { opacity: heroOp, transform: [{ scale: heroScale }] }]}>
            {/* Glow rings */}
            <Svg width={280} height={280} viewBox="0 0 280 280" style={styles.glowSvg}>
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%"   stopColor={colors.accent} stopOpacity={0.18} />
                  <Stop offset="55%"  stopColor={colors.accent} stopOpacity={0.07} />
                  <Stop offset="100%" stopColor={colors.accent} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={140} cy={140} r={140} fill="url(#glow)" />
              {/* Outer ring */}
              <Circle cx={140} cy={140} r={108} fill="none" stroke={colors.accent} strokeWidth={0.6} opacity={0.20} />
              {/* Mid ring */}
              <Circle cx={140} cy={140} r={80} fill="none" stroke={colors.accent} strokeWidth={0.8} opacity={0.28} />
              {/* Inner ring */}
              <Circle cx={140} cy={140} r={56} fill="none" stroke={colors.accent} strokeWidth={1} opacity={0.35} />
            </Svg>

            {/* Shield + lock icon */}
            <View style={styles.shieldWrap}>
              <Svg width={90} height={104} viewBox="0 0 90 104">
                {/* Shield shape */}
                <Path
                  d="M45 2 L82 16 L82 52 C82 73 65 90 45 102 C25 90 8 73 8 52 L8 16 Z"
                  fill="rgba(212,165,32,0.10)"
                  stroke={colors.accent}
                  strokeWidth={1.8}
                  strokeLinejoin="round"
                />
                {/* Lock body */}
                <Path
                  d="M33 50 L33 62 Q33 68 39 68 L51 68 Q57 68 57 62 L57 50 Q57 44 51 44 L39 44 Q33 44 33 50 Z"
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={1.6}
                  strokeLinejoin="round"
                />
                {/* Lock shackle */}
                <Path
                  d="M37 44 L37 38 Q37 30 45 30 Q53 30 53 38 L53 44"
                  fill="none"
                  stroke={colors.accent}
                  strokeWidth={1.6}
                  strokeLinecap="round"
                />
                {/* Lock keyhole dot */}
                <Circle cx={45} cy={57} r={3} fill={colors.accent} opacity={0.85} />
              </Svg>
            </View>
          </Animated.View>
        </View>

        {/* ── Bottom sheet ────────────────────────────────── */}
        <Animated.View
          style={[styles.sheet, { opacity: sheetOp, transform: [{ translateY: sheetY }] }]}
        >
          {/* Gold top accent bar */}
          <View style={styles.sheetAccent} />

          <View style={styles.handle} />

          {/* Step badge */}
          <View style={styles.stepBadge}>
            <View style={styles.stepDot} />
            <Text style={styles.stepText}>FINAL STEP</Text>
          </View>

          {/* Heading */}
          <Text style={styles.title}>Protect{'\n'}your data.</Text>
          <Text style={styles.subtitle}>
            Sync across devices. Never lose your numbers.
          </Text>

          {/* Google button */}
          <GoogleButton onPress={loginWithGoogle} isLoading={isLoading} />

          {/* Divider */}
          <View style={styles.orRow}>
            <View style={styles.orLine} />
            <Text style={styles.orText}>or</Text>
            <View style={styles.orLine} />
          </View>

          {/* Skip */}
          <Pressable style={styles.skipButton} onPress={completeAsGuest} hitSlop={12}>
            <Text style={styles.skipText}>Continue without an account</Text>
          </Pressable>

          {/* Fine print */}
          <Text style={styles.finePrint}>
            By continuing you agree to our Terms & Privacy Policy.
          </Text>
        </Animated.View>

      </SafeAreaView>
    </View>
  );
}

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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // Top mark
  topMark: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoDot: {
    width: 6,
    height: 6,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
  wordmark: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    letterSpacing: 5,
    color: colors.accent,
  },

  // Hero
  heroWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 280, // shift up away from sheet
  },
  heroInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowSvg: {
    position: 'absolute',
  },
  shieldWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 280,
    height: 280,
  },

  // Sheet
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomWidth: 0,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    paddingTop: 0,
    overflow: 'hidden',
  },
  sheetAccent: {
    height: 2,
    marginHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    opacity: 0.35,
    borderRadius: radii.full,
    marginTop: 12,
    marginBottom: 10,
  },
  handle: {
    width: 32,
    height: 3,
    borderRadius: radii.full,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },

  // Step badge
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
    fontSize: 38,
    letterSpacing: -1.5,
    lineHeight: 42,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
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
    paddingVertical: 16,
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
    marginBottom: spacing.md,
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
    marginBottom: spacing.sm,
  },
  skipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 0.1,
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
    marginTop: spacing.xs,
  },
});
