import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient as TextScrim } from 'expo-linear-gradient';
import { Button } from '../../components/ui';
import { colors, spacing, radii } from '../../theme';
import { fonts } from '../../theme/typography';
import type { OnboardingStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Hook'>;

// ── 4-pointed sparkle helper ────────────────────────────────────────────────
function sparklePath(cx: number, cy: number, s: number): string {
  const i = s * 0.2;
  return (
    `M ${cx} ${cy - s} L ${cx + i} ${cy - i} L ${cx + s} ${cy} ` +
    `L ${cx + i} ${cy + i} L ${cx} ${cy + s} L ${cx - i} ${cy + i} ` +
    `L ${cx - s} ${cy} L ${cx - i} ${cy - i} Z`
  );
}

// Clustered around the owl's position (upper-center of screen)
const SPARKLES = [
  { x: 292, y: 118, s: 7,   gold: true,  op: 0.90 },
  { x: 325, y: 192, s: 4.5, gold: true,  op: 0.70 },
  { x: 228, y: 86,  s: 3.5, gold: false, op: 0.50 },
  { x: 58,  y: 148, s: 3,   gold: false, op: 0.38 },
  { x: 352, y: 360, s: 5.5, gold: true,  op: 0.68 },
  { x: 30,  y: 370, s: 3,   gold: true,  op: 0.45 },
  { x: 358, y: 570, s: 4.5, gold: false, op: 0.40 },
  { x: 65,  y: 610, s: 4,   gold: true,  op: 0.50 },
  { x: 272, y: 705, s: 3,   gold: false, op: 0.32 },
  { x: 148, y: 95,  s: 2.5, gold: false, op: 0.30 },
];

export function HookScreen({ navigation }: Props) {
  const topOp   = useRef(new Animated.Value(0)).current;
  const owlOp   = useRef(new Animated.Value(0)).current;
  const owlY    = useRef(new Animated.Value(24)).current;
  const textOp  = useRef(new Animated.Value(0)).current;
  const textY   = useRef(new Animated.Value(20)).current;
  const ctaOp   = useRef(new Animated.Value(0)).current;
  const ctaY    = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. wordmark
      Animated.timing(topOp, { toValue: 1, duration: 280, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      // 2. owl slides up
      Animated.parallel([
        Animated.timing(owlOp, { toValue: 1, duration: 520, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(owlY,  { toValue: 0, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 3. tagline
      Animated.parallel([
        Animated.timing(textOp, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(textY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      // 4. CTA
      Animated.parallel([
        Animated.timing(ctaOp, { toValue: 1, duration: 350, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(ctaY,  { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      {/* Deep navy sky gradient */}
      <LinearGradient
        colors={['#0D1830', colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      {/* Sparkle stars — logo aesthetic */}
      <Svg
        width="390"
        height="844"
        viewBox="0 0 390 844"
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

        {/* ── Owl hero ──────────────────────────────────── */}
        <View style={styles.owlWrap}>
          <Animated.Image
            source={require('../../../assets/mascot/owl-hero.png')}
            style={[styles.owlImage, { opacity: owlOp, transform: [{ translateY: owlY }] }]}
            resizeMode="contain"
          />
        </View>

        {/* ── Text + CTA with gradient scrim for readability ── */}
        <TextScrim
          colors={['transparent', colors.background, colors.background]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.scrim}
          pointerEvents="none"
        />

        <Animated.View
          style={[styles.hero, { opacity: textOp, transform: [{ translateY: textY }] }]}
        >
          <Text style={styles.tagline}>
            {'See your\n'}
            <Text style={styles.taglineGold}>real</Text>
            {' net\n'}
            <Text style={styles.taglineGold}>worth.</Text>
          </Text>

          <Text style={styles.sub}>
            Every account. Every currency.{'\n'}One clear number.
          </Text>
        </Animated.View>

        {/* ── CTA ───────────────────────────────────────── */}
        <Animated.View
          style={[styles.cta, { opacity: ctaOp, transform: [{ translateY: ctaY }] }]}
        >
          <Button
            label="Get Started"
            onPress={() => navigation.navigate('BaseCurrency')}
          />
          <View style={styles.dotRow}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </Animated.View>
      </SafeAreaView>
    </View>
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

  // Wordmark
  nav: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 11,
    letterSpacing: 5.5,
    color: colors.accent,
  },

  // Owl
  owlWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  owlImage: {
    width: 340,
    height: 510,  // 2:3 aspect ratio (1024×1536)
  },

  // Gradient scrim — fades background in behind the text block
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 380,
    zIndex: 0,
  },

  // Hero text
  hero: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    zIndex: 1,
  },
  annotationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.sm,
  },
  annotationDash: {
    width: 20,
    height: 1,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  annotationText: {
    fontFamily: fonts.sansMedium,
    fontSize: 9,
    letterSpacing: 2.5,
    color: colors.textMuted,
    opacity: 0.7,
  },
  tagline: {
    fontFamily: fonts.displayBold,
    fontSize: 52,
    lineHeight: 58,
    letterSpacing: -2,
    color: '#FFFFFF',
    marginBottom: spacing.sm,
  },
  taglineGold: {
    color: colors.accent,
  },
  sub: {
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },

  // CTA
  cta: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.md,
    zIndex: 1,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 20,
    height: 5,
    borderRadius: radii.full,
    backgroundColor: colors.accent,
  },
});
