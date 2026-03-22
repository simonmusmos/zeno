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
import type { ForgotPasswordNavigationProp } from '../../types/navigation.types';

interface Props { navigation: ForgotPasswordNavigationProp }

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

type State = 'idle' | 'sent';

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState<string>();
  const [loading, setLoad]  = useState(false);
  const [state, setState]   = useState<State>('idle');

  const headAnim  = useEntrance(80);
  const inpAnim   = useEntrance(180);
  const ctaAnim   = useEntrance(260);

  async function handleSubmit() {
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Enter a valid email'); return; }
    setLoad(true); setError(undefined);
    try {
      await authService.forgotPassword(email.trim());
      setState('sent');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoad(false);
    }
  }

  if (state === 'sent') {
    return (
      <View style={styles.root}>
        <LinearGradient colors={['#0D1220', '#080D17', '#050810']} locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill} start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }} pointerEvents="none" />
        <SafeAreaView style={styles.safe}>
          <View style={styles.sentWrap}>
            <View style={styles.sentOrb} />
            <Text style={styles.headLine1}>CHECK YOUR</Text>
            <Text style={[styles.headLine2, { marginBottom: 16 }]}>INBOX</Text>
            <Text style={styles.sentBody}>
              Reset link sent to{'\n'}
              <Text style={{ color: colors.textSecondary }}>{email}</Text>
            </Text>
            <View style={{ width: '100%', marginTop: 40 }}>
              <Button label="BACK TO SIGN IN" variant="secondary" onPress={() => navigation.navigate('Login')} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
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
              <Text style={styles.headLine1}>RESET YOUR</Text>
              <Text style={styles.headLine2}>PASSWORD</Text>
              <Text style={styles.subheading}>We'll send a reset link to your email</Text>
            </Animated.View>

            <Animated.View style={[{ marginBottom: 24 }, inpAnim]}>
              <BoxInput
                icon="mail-outline"
                placeholder="Email address"
                value={email}
                onChangeText={t => { setEmail(t); if (error) setError(undefined); }}
                error={error}
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </Animated.View>

            <Animated.View style={ctaAnim}>
              <Button label="SEND RESET LINK" onPress={handleSubmit} isLoading={loading} disabled={loading} />
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
  sentWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28, gap: 6 },
  sentOrb: { width: 60, height: 60, borderRadius: 30, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.accentDim, marginBottom: 20 },
  sentBody: { fontFamily: fonts.sansRegular, fontSize: 14, lineHeight: 22, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});
