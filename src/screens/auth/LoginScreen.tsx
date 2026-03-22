import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { BoxInput, Button, ZenoCrystal } from '../../components/ui';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme';
import { fonts } from '../../theme/typography';
import type { LoginNavigationProp } from '../../types/navigation.types';

interface Props {
  navigation: LoginNavigationProp;
}

// ─── Staggered entrance ───────────────────────────────────────────────────────
function useEntrance(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1, duration: 620, delay,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(y, {
        toValue: 0, duration: 560, delay,
        easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true,
      }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY: y }] };
}

// ─── Google SVG logo ──────────────────────────────────────────────────────────
function GoogleG({ size = 16 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 18 18">
      <Path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <Path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
      <Path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
      <Path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
    </Svg>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export function LoginScreen({ navigation }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errors, setErrors]     = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setLoading] = useState(false);

  const headAnim   = useEntrance(120);
  const form1Anim  = useEntrance(240);
  const form2Anim  = useEntrance(300);
  const remAnim    = useEntrance(350);
  const ctaAnim    = useEntrance(410);
  const socialAnim = useEntrance(470);
  const footAnim   = useEntrance(530);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim())                     next.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email    = 'Enter a valid email';
    if (!password)                         next.password = 'Password is required';
    setErrors(next);
    return !Object.keys(next).length;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    setErrors({});
    try {
      const res = await authService.login({ email: email.trim(), password });
      if (!res.success) setErrors({ general: res.error ?? 'Something went wrong.' });
    } catch {
      setErrors({ general: 'An unexpected error occurred.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.root}>
      {/* ── Background gradient ───────────────────── */}
      <LinearGradient
        colors={['#0D1220', '#080D17', '#050810']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
        pointerEvents="none"
      />

      {/* ── Crystal decoration — top right ─────────── */}
      <View style={styles.crystalWrap} pointerEvents="none">
        <ZenoCrystal width={220} height={330} />
      </View>

      {/* ── Content ───────────────────────────────── */}
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >

            {/* ── Heading ────────────────────────── */}
            <Animated.View style={[styles.headBlock, headAnim]}>
              <Text style={styles.headLine1}>LOGIN TO</Text>
              <Text style={styles.headLine2}>YOUR ACCOUNT</Text>
              <Text style={styles.subheading}>Enter your login information</Text>
            </Animated.View>

            {/* ── General error ──────────────────── */}
            {errors.general ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            ) : null}

            {/* ── Form ───────────────────────────── */}
            <View style={styles.form}>
              <Animated.View style={form1Anim}>
                <BoxInput
                  icon="mail-outline"
                  placeholder="Email address"
                  value={email}
                  onChangeText={t => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: undefined })); }}
                  error={errors.email}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  autoComplete="email"
                  returnKeyType="next"
                />
              </Animated.View>

              <Animated.View style={form2Anim}>
                <BoxInput
                  icon="lock-closed-outline"
                  placeholder="Password"
                  value={password}
                  onChangeText={t => { setPassword(t); if (errors.password) setErrors(e => ({ ...e, password: undefined })); }}
                  error={errors.password}
                  isPassword
                  textContentType="password"
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </Animated.View>

              {/* Remember me + Forgot password */}
              <Animated.View style={[styles.rememberRow, remAnim]}>
                <Pressable
                  style={styles.rememberLeft}
                  onPress={() => setRemember(r => !r)}
                  hitSlop={8}
                >
                  <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                    {remember && (
                      <Ionicons name="checkmark" size={10} color={colors.white} />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={10}>
                  <Text style={styles.forgotText}>Forgot password</Text>
                </Pressable>
              </Animated.View>
            </View>

            {/* ── CTA ────────────────────────────── */}
            <Animated.View style={ctaAnim}>
              <Button
                label="LOGIN"
                onPress={handleLogin}
                isLoading={isLoading}
                disabled={isLoading}
              />
            </Animated.View>

            {/* ── Divider ────────────────────────── */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>Or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* ── Social row ─────────────────────── */}
            <Animated.View style={[styles.socialRow, socialAnim]}>
              {/* Google */}
              <Pressable style={styles.socialBtn} disabled>
                <GoogleG size={16} />
                <Text style={styles.socialLabel}>GOOGLE</Text>
              </Pressable>

              {/* Apple */}
              <Pressable style={styles.socialBtn} disabled>
                <Ionicons name="logo-apple" size={17} color={colors.textPrimary} />
                <Text style={styles.socialLabel}>APPLE</Text>
              </Pressable>
            </Animated.View>

            {/* ── Footer ─────────────────────────── */}
            <Animated.View style={[styles.footer, footAnim]}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Register')} hitSlop={10}>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050810',
  },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 44,
  },

  // Crystal
  crystalWrap: {
    position: 'absolute',
    top: -40,
    right: -36,
    transform: [{ rotate: '8deg' }],
    zIndex: 0,
  },

  // Heading
  headBlock: {
    paddingTop: 200,      // clears the crystal
    paddingBottom: 32,
    gap: 4,
  },
  headLine1: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: 1,
    color: colors.textPrimary,
  },
  headLine2: {
    fontFamily: fonts.displayBold,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: 1,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  subheading: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },

  // Error banner
  errorBanner: {
    backgroundColor: colors.errorSurface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: `${colors.error}50`,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  errorBannerText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
  },

  // Form
  form: {
    gap: 14,
    marginBottom: 24,
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  rememberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.textMuted,
  },
  forgotText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 22,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  dividerLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.textMuted,
    letterSpacing: 0.6,
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    paddingVertical: 14,
  },
  socialLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
    letterSpacing: 0.8,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 28,
  },
  footerText: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLink: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.accent,
  },
});
