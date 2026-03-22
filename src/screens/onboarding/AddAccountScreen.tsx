import { type NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Button, SegmentedControl } from '../../components/ui';
import { CURRENCIES } from '../../data/currencies';
import { useOnboarding } from '../../store/onboarding.store';
import { colors, spacing, radii } from '../../theme';
import { fonts } from '../../theme/typography';
import type { AccountType } from '../../types/account.types';
import type { OnboardingStackParamList } from '../../types/navigation.types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'AddAccount'>;

const ACCOUNT_TYPES: { label: string; value: AccountType }[] = [
  { label: 'Cash',       value: 'cash'       },
  { label: 'Investment', value: 'investment' },
  { label: 'Debt',       value: 'debt'       },
];

function sparklePath(cx: number, cy: number, s: number): string {
  const i = s * 0.2;
  return (
    `M ${cx} ${cy - s} L ${cx + i} ${cy - i} L ${cx + s} ${cy} ` +
    `L ${cx + i} ${cy + i} L ${cx} ${cy + s} L ${cx - i} ${cy + i} ` +
    `L ${cx - s} ${cy} L ${cx - i} ${cy - i} Z`
  );
}

const SPARKLES = [
  { x: 342, y: 68,  s: 5,   gold: true,  op: 0.75 },
  { x: 310, y: 140, s: 3,   gold: false, op: 0.40 },
  { x: 48,  y: 105, s: 3.5, gold: true,  op: 0.50 },
  { x: 360, y: 500, s: 4,   gold: true,  op: 0.55 },
  { x: 22,  y: 460, s: 2.5, gold: false, op: 0.32 },
];

export function AddAccountScreen({ navigation }: Props) {
  const { accounts, addAccount, baseCurrency } = useOnboarding();

  const [name,         setName]         = useState('');
  const [accountType,  setAccountType]  = useState<AccountType>('cash');
  const [balance,      setBalance]      = useState('');
  const [currency,     setCurrency]     = useState(baseCurrency.code);
  const [showPicker,   setShowPicker]   = useState(false);
  const [nameError,    setNameError]    = useState('');
  const [balError,     setBalError]     = useState('');
  const [focusedField, setFocusedField] = useState<'name' | 'balance' | null>(null);

  const headerOp = useRef(new Animated.Value(0)).current;
  const headerY  = useRef(new Animated.Value(20)).current;
  const formOp   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(headerOp, { toValue: 1, duration: 400, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(headerY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(formOp, { toValue: 1, duration: 320, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);

  const hasPartialInput = !!(name.trim() || balance.trim());

  function validateAndAdd(): boolean {
    let valid = true;
    if (!name.trim()) { setNameError('Account name is required.'); valid = false; }
    else setNameError('');
    const parsed = parseFloat(balance.replace(/,/g, ''));
    if (isNaN(parsed) || parsed < 0) { setBalError('Enter a valid balance.'); valid = false; }
    else setBalError('');
    if (!valid) return false;
    addAccount({ name: name.trim(), type: accountType, balance: parsed, currency });
    setName('');
    setBalance('');
    setAccountType('cash');
    setCurrency(baseCurrency.code);
    return true;
  }

  function handleAdd() {
    validateAndAdd();
  }

  function handleContinue() {
    // If user left fields partially/fully filled, add the account first
    if (hasPartialInput) {
      if (!validateAndAdd()) return; // validation failed — don't navigate
    }
    navigation.navigate('NetWorthResult');
  }

  const continueLabel = hasPartialInput
    ? `Add & Continue`
    : accounts.length === 0
      ? 'Skip for Now'
      : `Continue  ·  ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`;

  return (
    <View style={styles.root}>
      {/* Background — same theme as HookScreen */}
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

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.inner}>

            {/* ── Header ─────────────────────────────────── */}
            <Animated.View
              style={[styles.header, { opacity: headerOp, transform: [{ translateY: headerY }] }]}
              accessibilityLabel="Step 3 of 4 — Add Accounts"
            >
              <View style={styles.stepBadge} accessibilityElementsHidden>
                <View style={styles.stepDot} />
                <Text style={styles.stepText}>STEP 3 OF 4</Text>
              </View>
              <Text style={styles.title}>Add{'\n'}Accounts</Text>
              <Text style={styles.subtitle}>
                Add your assets and liabilities.{'\n'}You can add more later.
              </Text>
            </Animated.View>

            <ScrollView
              style={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Animated.View style={{ opacity: formOp }}>

                {/* ── Added accounts ─────────────────────── */}
                {accounts.length > 0 && (
                  <View
                    style={styles.existingList}
                    accessibilityLabel={`${accounts.length} account${accounts.length !== 1 ? 's' : ''} added`}
                  >
                    {accounts.map((acc, idx) => {
                      const isDebt = acc.type === 'debt';
                      return (
                        <View
                          key={acc.id}
                          style={[styles.existingRow, idx < accounts.length - 1 && styles.existingRowBorder]}
                          accessibilityLabel={`${acc.name}, ${acc.type}, ${acc.currency} ${acc.balance.toLocaleString()}`}
                        >
                          <View style={[styles.typeTag, isDebt ? styles.tagDebt : styles.tagAsset]}>
                            <Text style={[styles.tagText, isDebt ? styles.tagTextDebt : styles.tagTextAsset]}>
                              {acc.type.toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.existingName} numberOfLines={1}>{acc.name}</Text>
                          <Text style={[styles.existingBalance, isDebt && styles.balanceDebt]}>
                            {acc.currency} {acc.balance.toLocaleString()}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* ── Form ───────────────────────────────── */}
                <View style={styles.form}>

                  {/* Account name */}
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel} accessibilityElementsHidden>ACCOUNT NAME</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        focusedField === 'name' && styles.textInputFocused,
                        !!nameError && styles.textInputError,
                      ]}
                      value={name}
                      onChangeText={t => { setName(t); if (nameError) setNameError(''); }}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="e.g. BDO Savings, Robinhood"
                      placeholderTextColor={colors.textMuted}
                      selectionColor={colors.accent}
                      autoCorrect={false}
                      accessibilityLabel="Account name"
                      accessibilityHint="Enter a name to identify this account"
                      returnKeyType="next"
                    />
                    {nameError ? (
                      <Text
                        style={styles.errorText}
                        accessibilityLiveRegion="polite"
                        accessibilityRole="alert"
                      >
                        {nameError}
                      </Text>
                    ) : null}
                  </View>

                  {/* Account type */}
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel} accessibilityElementsHidden>TYPE</Text>
                    <SegmentedControl
                      options={ACCOUNT_TYPES}
                      value={accountType}
                      onChange={v => setAccountType(v as AccountType)}
                    />
                  </View>

                  {/* Balance */}
                  <View style={styles.field}>
                    <Text style={styles.fieldLabel} accessibilityElementsHidden>BALANCE</Text>
                    <View style={styles.balanceRow}>
                      <Pressable
                        style={styles.ccyButton}
                        onPress={() => setShowPicker(true)}
                        accessibilityLabel={`Currency: ${currency}. Tap to change`}
                        accessibilityRole="button"
                        accessibilityHint="Opens currency picker"
                      >
                        <Text style={styles.ccyCode}>{currency}</Text>
                        <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
                      </Pressable>

                      <TextInput
                        style={[
                          styles.balanceInput,
                          focusedField === 'balance' && styles.textInputFocused,
                          !!balError && styles.textInputError,
                        ]}
                        value={balance}
                        onChangeText={t => { setBalance(t); if (balError) setBalError(''); }}
                        onFocus={() => setFocusedField('balance')}
                        onBlur={() => setFocusedField(null)}
                        placeholder="0.00"
                        placeholderTextColor={colors.textMuted}
                        keyboardType="decimal-pad"
                        selectionColor={colors.accent}
                        accessibilityLabel="Balance amount"
                        accessibilityHint="Enter the current balance of this account"
                      />
                    </View>
                    {balError ? (
                      <Text
                        style={styles.errorText}
                        accessibilityLiveRegion="polite"
                        accessibilityRole="alert"
                      >
                        {balError}
                      </Text>
                    ) : null}
                  </View>

                  {/* Add button */}
                  <Button
                    label="+ Add Account"
                    variant="secondary"
                    onPress={handleAdd}
                    accessibilityLabel="Add this account to the list"
                    accessibilityHint="Saves the account and lets you add another"
                  />
                </View>
              </Animated.View>
            </ScrollView>

            {/* ── Bottom CTA ──────────────────────────────── */}
            <View style={styles.cta}>
              <Button
                label={continueLabel}
                variant={!hasPartialInput && accounts.length === 0 ? 'secondary' : 'primary'}
                onPress={handleContinue}
                accessibilityLabel={
                  hasPartialInput ? 'Add this account and continue' :
                  accounts.length === 0 ? 'Skip adding accounts for now' :
                  `Continue with ${accounts.length} account${accounts.length !== 1 ? 's' : ''}`
                }
                accessibilityHint="Proceed to see your net worth"
              />
              {!hasPartialInput && accounts.length === 0 && (
                <Text style={styles.skipHint}>You can always add accounts later from the dashboard.</Text>
              )}
            </View>

          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      {/* Currency Picker Modal */}
      <CurrencyPickerModal
        visible={showPicker}
        selected={currency}
        onSelect={code => { setCurrency(code); setShowPicker(false); }}
        onClose={() => setShowPicker(false)}
      />
    </View>
  );
}

// ─── Currency picker modal ───────────────────────────────────────────────────
function CurrencyPickerModal({
  visible, selected, onSelect, onClose,
}: {
  visible: boolean;
  selected: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = query.trim()
    ? CURRENCIES.filter(
        c =>
          c.code.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()),
      )
    : CURRENCIES;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
      accessibilityViewIsModal
    >
      <View style={styles.modalRoot}>
        <LinearGradient
          colors={['#0D1830', colors.background]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 0.4 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom']}>

          {/* Modal header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Currency</Text>
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityLabel="Close currency picker"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={15} color={colors.textSecondary} />
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
              accessibilityHint="Filter by name or code"
            />
            {query.length > 0 && (
              <Pressable
                onPress={() => setQuery('')}
                hitSlop={12}
                accessibilityLabel="Clear search"
                accessibilityRole="button"
              >
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>

          {/* List */}
          <FlatList
            data={filtered}
            keyExtractor={item => item.code}
            keyboardShouldPersistTaps="handled"
            accessibilityLabel="Currency list"
            renderItem={({ item }) => {
              const isActive = item.code === selected;
              return (
                <Pressable
                  style={[styles.ccyRow, isActive && styles.ccyRowActive]}
                  onPress={() => onSelect(item.code)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: isActive }}
                  accessibilityLabel={`${item.name}, ${item.code}, ${item.symbol}`}
                >
                  <View style={[styles.ccySymbolBox, isActive && styles.ccySymbolBoxActive]}>
                    <Text style={[styles.ccySymbol, isActive && styles.ccySymbolActive]}
                      accessibilityElementsHidden
                    >
                      {item.symbol}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.ccyRowCode, isActive && styles.ccyRowCodeActive]}>
                      {item.code}
                    </Text>
                    <Text style={styles.ccyRowName}>{item.name}</Text>
                  </View>
                  {isActive && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.accent} accessibilityElementsHidden />
                  )}
                </Pressable>
              );
            }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            contentContainerStyle={{ paddingBottom: 32 }}
          />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safe: {
    flex: 1,
  },
  inner: {
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

  scroll: { flex: 1 },

  // Existing accounts
  existingList: {
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  existingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    gap: spacing.sm,
  },
  existingRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  typeTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  tagAsset: { backgroundColor: 'rgba(52,211,153,0.14)' },
  tagDebt:  { backgroundColor: 'rgba(248,113,113,0.14)' },
  tagText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  tagTextAsset: { color: colors.assetColor },
  tagTextDebt:  { color: colors.liabilityColor },
  existingName: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: '#FFFFFF',
  },
  existingBalance: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.assetColor,
  },
  balanceDebt: { color: colors.liabilityColor },

  // Form
  form: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    gap: spacing.lg,
  },
  field: { gap: 8 },
  fieldLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    letterSpacing: 2,
    color: colors.textSecondary,
  },
  textInput: {
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  textInputFocused: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(212,165,32,0.06)',
  },
  textInputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorBg,
  },
  errorText: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.error,
    marginTop: 2,
  },
  balanceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  ccyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
  ccyCode: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  balanceInput: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    color: '#FFFFFF',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },

  // CTA
  cta: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  skipHint: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },

  // Modal
  modalRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalSafe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  modalTitle: {
    fontFamily: fonts.displayBold,
    fontSize: 24,
    letterSpacing: -0.8,
    color: '#FFFFFF',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    color: '#FFFFFF',
    padding: 0,
  },
  ccyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: 13,
    gap: spacing.md,
  },
  ccyRowActive: {
    backgroundColor: 'rgba(212,165,32,0.07)',
  },
  ccySymbolBox: {
    width: 40,
    height: 40,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ccySymbolBoxActive: {
    backgroundColor: 'rgba(212,165,32,0.12)',
    borderColor: 'rgba(212,165,32,0.30)',
  },
  ccySymbol: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
  ccySymbolActive: {
    color: colors.accent,
  },
  ccyRowCode: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    color: '#FFFFFF',
  },
  ccyRowCodeActive: { color: colors.accent },
  ccyRowName: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xl,
  },
});
