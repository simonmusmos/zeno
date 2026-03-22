import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BoxInput, Button, ZenoCrystal } from '../../components/ui';
import { authService } from '../../services/auth.service';
import { colors } from '../../theme';
import { fonts } from '../../theme/typography';
import type { RegisterNavigationProp } from '../../types/navigation.types';

interface Props { navigation: RegisterNavigationProp }

function useEntrance(delay: number) {
  const opacity = useRef(new Animated.Value(0)).current;
  const y = useRef(new Animated.Value(16)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 580, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(y, { toValue: 0, duration: 520, delay, easing: Easing.bezier(0.16, 1, 0.3, 1), useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY: y }] };
}

export function RegisterScreen({ navigation }: Props) {
  const [email, setEmail]     = useState('');
  const [password, setPw]     = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors]   = useState<{ email?: string; password?: string; confirm?: string; general?: string }>({});
  const [isLoading, setLoad]  = useState(false);

  const headAnim = useEntrance(80);
  const f1Anim   = useEntrance(180);
  const f2Anim   = useEntrance(240);
  const f3Anim   = useEntrance(300);
  const ctaAnim  = useEntrance(360);
  const footAnim = useEntrance(420);

  function validate() {
    const next: typeof errors = {};
    if (!email.trim())                     next.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) next.email    = 'Enter a valid email';
    if (!password)                         next.password = 'Password is required';
    else if (password.length < 8)         next.password = 'At least 8 characters';
    if (!confirm)                          next.confirm  = 'Please confirm';
    else if (password !== confirm)         next.confirm  = 'Passwords don\'t match';
    setErrors(next);
    return !Object.keys(next).length;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoad(true); setErrors({});
    try {
      const res = await authService.register({ email: email.trim(), password });
      if (!res.success) setErrors({ general: res.error ?? 'Something went wrong.' });
    } catch {
      setErrors({ general: 'An unexpected error occurred.' });
    } finally {
      setLoad(false);
    }
  }

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#0D1220', '#080D17', '#050810']} locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} pointerEvents="none" />

      <View style={styles.crystalWrap} pointerEvents="none">
        <ZenoCrystal width={180} height={270} />
      </View>

      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            <Pressable onPress={() => navigation.goBack()} style={styles.back} hitSlop={12}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <Animated.View style={[styles.headBlock, headAnim]}>
              <Text style={styles.headLine1}>CREATE YOUR</Text>
              <Text style={styles.headLine2}>ACCOUNT</Text>
              <Text style={styles.subheading}>Start tracking your real net worth</Text>
            </Animated.View>

            {errors.general ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{errors.general}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <Animated.View style={f1Anim}>
                <BoxInput icon="mail-outline" placeholder="Email address" value={email}
                  onChangeText={t => { setEmail(t); if (errors.email) setErrors(e => ({ ...e, email: undefined })); }}
                  error={errors.email} keyboardType="email-address" textContentType="emailAddress"
                  autoComplete="email" returnKeyType="next" />
              </Animated.View>
              <Animated.View style={f2Anim}>
                <BoxInput icon="lock-closed-outline" placeholder="Password" value={password}
                  onChangeText={t => { setPw(t); if (errors.password) setErrors(e => ({ ...e, password: undefined })); }}
                  error={errors.password} isPassword textContentType="newPassword"
                  autoComplete="new-password" returnKeyType="next" />
              </Animated.View>
              <Animated.View style={f3Anim}>
                <BoxInput icon="lock-closed-outline" placeholder="Confirm password" value={confirm}
                  onChangeText={t => { setConfirm(t); if (errors.confirm) setErrors(e => ({ ...e, confirm: undefined })); }}
                  error={errors.confirm} isPassword textContentType="newPassword"
                  autoComplete="new-password" returnKeyType="done" onSubmitEditing={handleRegister} />
              </Animated.View>
            </View>

            <Animated.View style={ctaAnim}>
              <Button label="CREATE ACCOUNT" onPress={handleRegister} isLoading={isLoading} disabled={isLoading} />
            </Animated.View>

            <Animated.View style={[styles.footer, footAnim]}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Pressable onPress={() => navigation.navigate('Login')} hitSlop={10}>
                <Text style={styles.footerLink}>Sign In</Text>
              </Pressable>
            </Animated.View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#050810' },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingBottom: 44 },
  crystalWrap: { position: 'absolute', top: -30, right: -30, transform: [{ rotate: '8deg' }] },
  back: { paddingTop: 12, paddingBottom: 4 },
  backText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.textMuted },
  headBlock: { paddingTop: 160, paddingBottom: 28, gap: 4 },
  headLine1: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: 1, color: colors.textPrimary },
  headLine2: { fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 40, letterSpacing: 1, color: colors.textPrimary, marginBottom: 10 },
  subheading: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.textMuted, letterSpacing: 0.3 },
  errorBanner: { backgroundColor: colors.errorSurface, borderWidth: StyleSheet.hairlineWidth, borderColor: `${colors.error}50`, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 16 },
  errorBannerText: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.error, textAlign: 'center' },
  form: { gap: 14, marginBottom: 24 },
  footer: { flexDirection: 'row', justifyContent: 'center', paddingTop: 28 },
  footerText: { fontFamily: fonts.sansRegular, fontSize: 13, color: colors.textMuted },
  footerLink: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.accent },
});
