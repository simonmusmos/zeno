import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { PixelOwl } from '../../components/ui';
import { formatCurrency } from '../../data/currencies';
import { useAuth } from '../../store/auth.store';
import { useOnboarding } from '../../store/onboarding.store';
import { colors, spacing, radii } from '../../theme';
import { fonts } from '../../theme/typography';
import type { Account } from '../../types/account.types';

// ── Constants & helpers ───────────────────────────────────────────────────────

const MONTH_NAMES   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const GROWTH_CURVE  = [0.44, 0.57, 0.68, 0.78, 0.90, 1.0];
const CHART_H       = 192;
const ACTIVE_W      = 50;
const BAR_W         = 36;
const MIN_BAR_H     = 10;

const CCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', PHP: '₱',
  AUD: 'A$', CAD: 'C$', CHF: 'Fr', HKD: 'HK$', SGD: 'S$',
  MYR: 'RM', INR: '₹', CNY: '¥', KRW: '₩', THB: '฿',
};

interface ChartBar { month: string; value: number; isActive: boolean; }

function buildChartData(nw: number): ChartBar[] {
  const now = new Date();
  const abs = Math.abs(nw);
  return GROWTH_CURVE.map((f, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { month: MONTH_NAMES[d.getMonth()], value: abs * f, isActive: i === 5 };
  });
}

function getGreeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
}

function formatShort(val: number, sym: string) {
  const a = Math.abs(val);
  if (a >= 1_000_000) return `${sym}${(a / 1_000_000).toFixed(1)}M`;
  if (a >= 1_000)     return `${sym}${(a / 1_000).toFixed(1)}K`;
  return `${sym}${a.toFixed(0)}`;
}

function sparklePath(cx: number, cy: number, s: number) {
  const i = s * 0.2;
  return `M${cx} ${cy-s} L${cx+i} ${cy-i} L${cx+s} ${cy} L${cx+i} ${cy+i} L${cx} ${cy+s} L${cx-i} ${cy+i} L${cx-s} ${cy} L${cx-i} ${cy-i} Z`;
}

const EASE = Easing.bezier(0.16, 1, 0.3, 1);

const BG_SPARKLES = [
  { x: 358, y: 108, s: 5,   gold: true,  op: 0.60 },
  { x: 28,  y: 200, s: 3,   gold: false, op: 0.28 },
  { x: 350, y: 340, s: 3.5, gold: true,  op: 0.35 },
  { x: 18,  y: 480, s: 2.5, gold: false, op: 0.22 },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export function DashboardScreen() {
  const { user } = useAuth();
  const { netWorth, assets, liabilities, accounts, baseCurrency, ratesStatus, ratesUpdatedAt, refreshRates } = useOnboarding();

  const cardOp  = useRef(new Animated.Value(0)).current;
  const cardY   = useRef(new Animated.Value(24)).current;
  const listOp  = useRef(new Animated.Value(0)).current;
  const listY   = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardOp, { toValue: 1, duration: 520, easing: EASE, useNativeDriver: true }),
        Animated.timing(cardY,  { toValue: 0, duration: 520, easing: EASE, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(listOp, { toValue: 1, duration: 400, easing: EASE, useNativeDriver: true }),
        Animated.timing(listY,  { toValue: 0, duration: 400, easing: EASE, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  // ── Auto-refresh 5 s after each animation settles ─────────────────────────
  // Max animation duration = 9 steps × 80 ms = 720 ms → refresh at ~5.8 s after change.
  useEffect(() => {
    const id = setTimeout(refreshRates, 5_720);
    return () => clearTimeout(id);
  }, [netWorth]);

  const chartData  = useMemo(() => buildChartData(netWorth), [netWorth]);
  const symbol     = CCY_SYMBOLS[baseCurrency.code] ?? baseCurrency.symbol;
  const firstName  = user?.displayName.split(' ')[0] ?? null;
  const isPositive = netWorth >= 0;

  const mChange = useMemo(() => {
    if (chartData.length < 2) return null;
    const prev = chartData[4].value;
    if (prev === 0) return null;
    const pct = ((chartData[5].value - prev) / prev) * 100;
    return { pct, up: pct >= 0 };
  }, [chartData]);

  return (
    <View style={s.root}>
      {/* Screen background gradient */}
      <LinearGradient
        colors={['#0D1830', colors.background]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.55 }}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      {/* Background sparkles */}
      <Svg width="390" height="844" style={StyleSheet.absoluteFill} pointerEvents="none">
        {BG_SPARKLES.map((sp, i) => (
          <Path
            key={i}
            d={sparklePath(sp.x, sp.y, sp.s)}
            fill={sp.gold ? colors.accent : '#FFFFFF'}
            opacity={sp.op}
          />
        ))}
      </Svg>

      <SafeAreaView style={s.safe} edges={['top']}>

      {/* ── Header ───────────────────────────────────────────── */}
      <View style={s.header}>
        <View>
          <Text style={s.greeting}>{getGreeting()}</Text>
          <Text style={s.greetingName} numberOfLines={1}>
            {firstName ?? 'Welcome back'}
          </Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn} hitSlop={10} accessibilityLabel="Notifications" accessibilityRole="button">
            <Ionicons name="notifications-outline" size={19} color={colors.textSecondary} />
          </Pressable>
          <Pressable hitSlop={10} accessibilityLabel="Profile" accessibilityRole="button">
            <View style={s.avatarRing}>
              <View style={s.avatarCore}>
                <Text style={s.avatarLetter}>{firstName ? firstName[0].toUpperCase() : '?'}</Text>
              </View>
            </View>
          </Pressable>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >

        {/* ── Hero card ────────────────────────────────────────── */}
        <Animated.View style={[s.heroCard, { opacity: cardOp, transform: [{ translateY: cardY }] }]}>
          {/* Card inner gradient */}
          <LinearGradient
            colors={['#132044', colors.surface]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.7 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          {/* Gold accent top line */}
          <LinearGradient
            colors={['rgba(212,165,32,0)', 'rgba(212,165,32,0.55)', 'rgba(212,165,32,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.heroAccentBar}
            pointerEvents="none"
          />
          {/* Glow orb */}
          <View style={s.cardOrb} pointerEvents="none" />
          {/* Sparkles */}
          <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
            <Path d={sparklePath(318, 28, 5)}   fill={colors.accent} opacity={0.80} />
            <Path d={sparklePath(344, 68, 3.5)} fill={colors.accent} opacity={0.50} />
            <Path d={sparklePath(18,  44, 2.5)} fill="#FFFFFF"       opacity={0.35} />
          </Svg>

          {/* ─ Net worth block ─ */}
          <View style={s.nwBlock}>
            <View style={s.nwTopRow}>
              <View style={s.nwLabelRow}>
                <View style={s.nwAccentDot} />
                <Text style={s.nwLabel}>NET WORTH</Text>
              </View>
              <RatesPill status={ratesStatus} updatedAt={ratesUpdatedAt} onRefresh={refreshRates} />
            </View>

            <RollingNumber
              formatted={formatCurrency(netWorth, baseCurrency.code)}
              isPositive={isPositive}
            />

            <View style={s.nwSubRow}>
              <Text style={s.nwCcy}>{baseCurrency.name}</Text>
              {mChange && (
                <View style={[s.changePill, mChange.up ? s.changePillUp : s.changePillDn]}>
                  <Ionicons
                    name={mChange.up ? 'trending-up' : 'trending-down'}
                    size={10}
                    color={mChange.up ? colors.assetColor : colors.liabilityColor}
                  />
                  <Text style={[s.changeText, mChange.up ? s.changeUp : s.changeDn]}>
                    {mChange.up ? '+' : ''}{mChange.pct.toFixed(1)}% this month
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* ─ Chart ─ */}
          <View style={s.chartShell}>
            <ChartBars data={chartData} symbol={symbol} />
          </View>

          {/* ─ Divider ─ */}
          <View style={s.cardDivider} />

          {/* ─ Assets / Liabilities inline ─ */}
          <View style={s.statsInline}>
            <View style={s.statInlineItem}>
              <View style={[s.statInlineIconBox, { backgroundColor: 'rgba(52,211,153,0.10)' }]}>
                <Ionicons name="trending-up" size={14} color={colors.assetColor} />
              </View>
              <View>
                <Text style={s.statInlineLabel}>ASSETS</Text>
                <Text style={[s.statInlineAmt, { color: colors.assetColor }]}>
                  {formatCurrency(assets, baseCurrency.code)}
                </Text>
              </View>
            </View>
            <View style={s.statInlineSep} />
            <View style={s.statInlineItem}>
              <View style={[s.statInlineIconBox, { backgroundColor: 'rgba(248,113,113,0.10)' }]}>
                <Ionicons name="trending-down" size={14} color={colors.liabilityColor} />
              </View>
              <View>
                <Text style={s.statInlineLabel}>LIABILITIES</Text>
                <Text style={[s.statInlineAmt, { color: colors.liabilityColor }]}>
                  {formatCurrency(liabilities, baseCurrency.code)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* ── Accounts ─────────────────────────────────────────── */}
        <Animated.View style={[s.section, { opacity: listOp, transform: [{ translateY: listY }] }]}>
          <View style={s.sectionHeader}>
            <View style={s.sectionLeft}>
              <View style={s.sectionAccent} />
              <Text style={s.sectionTitle}>ACCOUNTS</Text>
              {accounts.length > 0 && (
                <View style={s.countChip}>
                  <Text style={s.countChipText}>{accounts.length}</Text>
                </View>
              )}
            </View>
            {accounts.length > 0 && (
              <Pressable hitSlop={12}>
                <Text style={s.seeAll}>Manage</Text>
              </Pressable>
            )}
          </View>

          {accounts.length === 0 ? (
            <EmptyState />
          ) : (
            <View style={s.accountCard}>
              {accounts.map((acc, idx) => (
                <AccountRow
                  key={acc.id}
                  account={acc}
                  baseCurrency={baseCurrency.code}
                  isLast={idx === accounts.length - 1}
                />
              ))}
            </View>
          )}
        </Animated.View>

        <View style={{ height: 88 }} />
      </ScrollView>

      <FAB />
    </SafeAreaView>
    </View>
  );
}

// ── Slot-machine number display ───────────────────────────────────────────────

const SLOT_H     = 64;  // matches lineHeight of nwAmount
const DIGIT_W    = 38;  // fixed width for digit slots — prevents layout shift when
                        // narrow chars (1) swap with wide chars (0, 8, 9) in Manrope ExtraBold

function RollingChar({ char, color }: { char: string; color: string }) {
  const prevRef = useRef(char);
  const anim    = useRef(new Animated.Value(0)).current;
  const [strip, setStrip] = useState<{ digits: string[]; goUp: boolean }>({ digits: [char], goUp: true });

  useEffect(() => {
    const from = prevRef.current;
    const to   = char;
    if (from === to) return;
    prevRef.current = to;

    // Non-digit chars swap instantly
    if (!/\d/.test(from) || !/\d/.test(to)) {
      setStrip({ digits: [to], goUp: true });
      return;
    }

    const fromN  = parseInt(from);
    const toN    = parseInt(to);
    const goUp   = toN > fromN;
    const steps  = Math.abs(toN - fromN);
    const minN   = Math.min(fromN, toN);
    const maxN   = Math.max(fromN, toN);

    // Tape always in ascending order [min…max].
    // Roll UP  (goUp): start at top (from), scroll upward   → translateY: 0 → -totalScroll
    // Roll DOWN (!goUp): start at bottom (from), scroll downward → translateY: -totalScroll → 0
    const tape: string[] = [];
    for (let i = minN; i <= maxN; i++) tape.push(String(i));

    setStrip({ digits: tape, goUp });
    anim.setValue(0);

    Animated.timing(anim, {
      toValue:  1,
      duration: Math.max(150, steps * 40),
      easing:   Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) { setStrip({ digits: [to], goUp: true }); anim.setValue(0); }
    });
  }, [char]);

  const isDigit   = /\d/.test(char);
  const cellStyle = isDigit ? slot.digitCell : slot.cell;
  const charStyle = [slot.char, isDigit && slot.charCentered, { color }];

  if (strip.digits.length === 1) {
    return (
      <View style={cellStyle}>
        <Text style={charStyle}>{strip.digits[0]}</Text>
      </View>
    );
  }

  const totalScroll = (strip.digits.length - 1) * SLOT_H;
  // goUp:  tape top = from, animate 0 → -totalScroll  (tape moves up, higher digit revealed)
  // goDown: tape bottom = from, animate -totalScroll → 0 (tape moves down, lower digit revealed)
  const translateY = anim.interpolate({
    inputRange:  [0, 1],
    outputRange: strip.goUp ? [0, -totalScroll] : [-totalScroll, 0],
  });

  return (
    <View style={cellStyle}>
      <Animated.View style={{ transform: [{ translateY }] }}>
        {strip.digits.map((d, i) => (
          <Text key={i} style={[slot.char, slot.charCentered, { color, height: SLOT_H, lineHeight: SLOT_H }]}>
            {d}
          </Text>
        ))}
      </Animated.View>
    </View>
  );
}

function RollingNumber({ formatted, isPositive }: { formatted: string; isPositive: boolean }) {
  const color = isPositive ? '#FFFFFF' : colors.liabilityColor;
  const chars = formatted.split('');
  const len   = chars.length;
  return (
    <View style={slot.row}>
      {chars.map((char, i) => (
        <RollingChar key={len - i} char={char} color={color} />
      ))}
    </View>
  );
}

const slot = StyleSheet.create({
  row:         { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cell:        { height: SLOT_H, overflow: 'hidden' },
  digitCell:   { height: SLOT_H, overflow: 'hidden', width: DIGIT_W },
  char:        { fontFamily: fonts.displayNumber, fontSize: 58, lineHeight: SLOT_H, letterSpacing: -2 },
  charCentered:{ textAlign: 'center' },
});

// ── ChartBars ─────────────────────────────────────────────────────────────────

function ChartBars({ data, symbol }: { data: ChartBar[]; symbol: string }) {
  const anims = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.stagger(55,
      anims.map(a => Animated.spring(a, { toValue: 1, friction: 7, tension: 75, useNativeDriver: false })),
    ).start();
  }, []);

  const maxVal = Math.max(...data.map(d => d.value), 1);

  return (
    <View style={cs.bars}>
      {/* Subtle grid lines */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {[0.33, 0.66].map(f => (
          <View
            key={f}
            style={[cs.gridLine, { position: 'absolute', left: 0, right: 0, bottom: 34 + f * CHART_H }]}
          />
        ))}
      </View>

      {data.map((bar, i) => {
        const targetH = Math.max((bar.value / maxVal) * CHART_H, MIN_BAR_H);
        const animH   = anims[i].interpolate({ inputRange: [0, 1], outputRange: [MIN_BAR_H, targetH] });
        const bw      = bar.isActive ? ACTIVE_W : BAR_W;

        return (
          <View key={bar.month} style={cs.barCol}>
            {/* Bubble slot — always reserves space */}
            <View style={cs.bubbleSlot}>
              {bar.isActive && (
                <View style={cs.bubble}>
                  <View style={cs.bubbleInner}>
                    <Text style={cs.bubbleText}>{formatShort(bar.value, symbol)}</Text>
                  </View>
                  <View style={cs.bubbleArrow} />
                </View>
              )}
            </View>

            {/* Bar — outer for shadow, inner for clip */}
            <Animated.View style={[
              { width: bw, height: animH },
              bar.isActive && {
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.55,
                shadowRadius: 10,
              },
            ]}>
              <View style={{ flex: 1, borderRadius: bw, overflow: 'hidden' }}>
                {bar.isActive ? (
                  <LinearGradient
                    colors={['#FFD055', '#A06800']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ flex: 1 }}
                  />
                ) : (
                  <LinearGradient
                    colors={['#253662', '#0F1A32']}
                    start={{ x: 0.5, y: 0 }}
                    end={{ x: 0.5, y: 1 }}
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </Animated.View>

            {/* Month */}
            <Text style={[cs.month, bar.isActive && cs.monthActive]}>{bar.month}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ── AccountRow ────────────────────────────────────────────────────────────────

function AccountRow({ account, baseCurrency, isLast }: {
  account: Account; baseCurrency: string; isLast: boolean;
}) {
  const scale     = useRef(new Animated.Value(1)).current;
  const isDebt    = account.type === 'debt';
  const typeColor = isDebt ? colors.liabilityColor : colors.assetColor;
  const iconName  =
    account.type === 'cash'       ? 'wallet-outline' :
    account.type === 'investment' ? 'bar-chart-outline' : 'card-outline';

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        style={[s.row, !isLast && s.rowBorder]}
        onPressIn={() =>
          Animated.timing(scale, { toValue: 0.97, duration: 70, useNativeDriver: true }).start()
        }
        onPressOut={() =>
          Animated.spring(scale, { toValue: 1, friction: 5, tension: 220, useNativeDriver: true }).start()
        }
        onPress={() => {}}
        accessibilityRole="button"
        accessibilityLabel={`${account.name}`}
      >
        {/* Color pill */}
        <View style={[s.rowPill, { backgroundColor: typeColor }]} />

        {/* Icon */}
        <View style={[s.rowIcon, { backgroundColor: `${typeColor}14` }]}>
          <Ionicons name={iconName as any} size={16} color={typeColor} />
        </View>

        {/* Text */}
        <View style={s.rowInfo}>
          <Text style={s.rowName} numberOfLines={1}>{account.name}</Text>
          <Text style={s.rowMeta}>
            {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
            {account.currency !== baseCurrency ? `  ·  ${account.currency}` : ''}
          </Text>
        </View>

        {/* Balance */}
        <View style={s.rowRight}>
          <Text style={[s.rowBalance, isDebt && { color: colors.liabilityColor }]}>
            {formatCurrency(account.balanceInBase, baseCurrency)}
          </Text>
          {account.currency !== baseCurrency && (
            <Text style={s.rowOrig}>
              {account.currency} {account.balance.toLocaleString()}
            </Text>
          )}
        </View>

        <Ionicons name="chevron-forward" size={13} color={colors.textMuted} style={s.rowChevron} />
      </Pressable>
    </Animated.View>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={s.empty}>
      <PixelOwl pixelSize={7} />
      <Text style={s.emptyTitle}>No accounts yet</Text>
      <Text style={s.emptyBody}>Tap + to add your first account.</Text>
    </View>
  );
}

// ── FAB ───────────────────────────────────────────────────────────────────────

function FAB() {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <Animated.View style={[s.fab, { transform: [{ scale }] }]}>
      <Pressable
        onPressIn={() => Animated.timing(scale, { toValue: 0.88, duration: 70, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, friction: 4, tension: 200, useNativeDriver: true }).start()}
        onPress={() => {}}
        accessibilityRole="button"
        accessibilityLabel="Add account"
        style={s.fabPressable}
      >
        <LinearGradient colors={['#FFD055', '#A06800']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fabGrad}>
          <Ionicons name="add" size={26} color="#1A1000" />
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

// ── RatesPill ─────────────────────────────────────────────────────────────────

import type { RatesStatus } from '../../store/onboarding.store';

function RatesPill({ status, updatedAt, onRefresh }: {
  status: RatesStatus;
  updatedAt: number | null;
  onRefresh: () => Promise<void>;
}) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'loading') {
      Animated.loop(
        Animated.timing(spin, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true }),
      ).start();
    } else {
      spin.stopAnimation();
      spin.setValue(0);
    }
  }, [status]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const label = status === 'loading' ? 'Updating…'
    : status === 'live'    ? 'Live'
    : status === 'fresh'   ? (() => {
        if (!updatedAt) return 'Rates updated';
        const mins = Math.floor((Date.now() - updatedAt) / 60000);
        return mins < 1 ? 'Just updated' : `${mins}m ago`;
      })()
    : status === 'error'   ? 'Rates offline'
    : 'Cached rates';

  const dotColor = status === 'live'  ? colors.assetColor
    : status === 'fresh'  ? colors.assetColor
    : status === 'error'  ? colors.liabilityColor
    : colors.textMuted;

  return (
    <Pressable
      style={rs.pill}
      onPress={status !== 'loading' ? onRefresh : undefined}
      hitSlop={10}
      accessibilityLabel={`Exchange rates: ${label}. Tap to refresh.`}
      accessibilityRole="button"
    >
      {status === 'loading' ? (
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="refresh" size={9} color={colors.textMuted} />
        </Animated.View>
      ) : (
        <View style={[rs.dot, { backgroundColor: dotColor }]} />
      )}
      <Text style={rs.label}>{label}</Text>
    </Pressable>
  );
}

const rs = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 9,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  label: { fontFamily: fonts.sansRegular, fontSize: 10, color: colors.textMuted, letterSpacing: 0.2 },
});

// ── Main styles ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  safe: { flex: 1 },
  scroll: { paddingTop: 0 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  greeting: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: colors.textMuted,
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  greetingName: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    letterSpacing: -1.2,
    color: colors.textPrimary,
    lineHeight: 30,
  },
  greetingMeta: {
    fontFamily: fonts.sansRegular,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
    letterSpacing: 0.1,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRing: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCore: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,165,32,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.accent },

  // Hero card
  heroCard: {
    marginHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.45,
    shadowRadius: 32,
    elevation: 14,
    marginBottom: spacing.lg,
  },
  cardOrb: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(16,32,80,0.70)',
  },

  heroAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
  },

  // Net worth block
  nwBlock: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
  },
  nwTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nwLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 9 },
  nwAccentDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, opacity: 0.85 },
  nwLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 2.5,
    color: 'rgba(212,165,32,0.72)',
  },
  dateBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dateBadgeText: {
    fontFamily: fonts.sansRegular,
    fontSize: 10,
    letterSpacing: 0.3,
    color: colors.textMuted,
  },
  nwAmount: {
    fontFamily: fonts.displayNumber,
    fontSize: 58,
    letterSpacing: -2,
    color: '#FFFFFF',
    lineHeight: 64,
    marginBottom: 8,
  },
  nwAmountNeg: { color: colors.liabilityColor },
  nwSubRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nwCcy: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.textMuted, letterSpacing: 0.3 },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  changePillUp: { backgroundColor: 'rgba(52,211,153,0.08)',  borderColor: 'rgba(52,211,153,0.20)' },
  changePillDn: { backgroundColor: 'rgba(248,113,113,0.08)', borderColor: 'rgba(248,113,113,0.20)' },
  changeText: { fontFamily: fonts.sansSemiBold, fontSize: 11, letterSpacing: -0.1 },
  changeUp:   { color: colors.assetColor },
  changeDn:   { color: colors.liabilityColor },

  // Chart shell
  chartShell: {
    marginHorizontal: 0,
    backgroundColor: 'rgba(0,0,0,0.22)',
    paddingTop: 16,
    paddingBottom: 6,
    paddingHorizontal: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartLabel: { fontFamily: fonts.sansMedium, fontSize: 9, letterSpacing: 2, color: colors.textMuted },
  chartGrowth: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.accent, opacity: 0.85 },

  // Stats inline
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  statsInline: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  statInlineItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  statInlineIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInlineLabel: { fontFamily: fonts.sansMedium, fontSize: 9, letterSpacing: 2, color: colors.textMuted, marginBottom: 3 },
  statInlineAmt: { fontFamily: fonts.displayBold, fontSize: 17, letterSpacing: -0.6 },
  statInlineSep: { width: StyleSheet.hairlineWidth, height: 32, backgroundColor: colors.border, marginHorizontal: 8 },

  // Accounts
  section: { paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 16, borderRadius: 2, backgroundColor: colors.accent, opacity: 0.9 },
  sectionTitle: { fontFamily: fonts.sansSemiBold, fontSize: 13, letterSpacing: 0.2, color: colors.textPrimary },
  countChip: {
    backgroundColor: 'rgba(212,165,32,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(212,165,32,0.22)',
    borderRadius: radii.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countChipText: { fontFamily: fonts.sansSemiBold, fontSize: 9, letterSpacing: 0.5, color: colors.accent },
  seeAll: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.accent, opacity: 0.65 },
  accountCard: {
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingRight: 12, gap: 12 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowPill: { width: 3, height: 36, borderRadius: 2, marginLeft: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1, minWidth: 0 },
  rowName: { fontFamily: fonts.sansSemiBold, fontSize: 14, letterSpacing: -0.2, color: colors.textPrimary },
  rowMeta: { fontFamily: fonts.sansRegular, fontSize: 11, color: colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowBalance: { fontFamily: fonts.sansSemiBold, fontSize: 14, letterSpacing: -0.3, color: colors.assetColor },
  rowOrig: { fontFamily: fonts.sansRegular, fontSize: 10, color: colors.textMuted, marginTop: 2 },
  rowChevron: { marginLeft: 2 },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 52, gap: 10 },
  emptyTitle: { fontFamily: fonts.sansSemiBold, fontSize: 14, color: colors.textSecondary, letterSpacing: -0.1 },
  emptyBody: { fontFamily: fonts.sansRegular, fontSize: 12, color: colors.textMuted },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 40,
    right: spacing.xl,
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  fabPressable: { width: 58, height: 58, borderRadius: 29, overflow: 'hidden' },
  fabGrad: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

// ── Chart styles ──────────────────────────────────────────────────────────────

const cs = StyleSheet.create({
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_H + 52,
    paddingHorizontal: 4,
  },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 7 },
  bubbleSlot: { height: 34, alignItems: 'center', justifyContent: 'flex-end' },
  bubble: { alignItems: 'center' },
  bubbleText: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: '#1A1000', letterSpacing: -0.3 },
  bubbleInner: {
    backgroundColor: colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bubbleArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.accent,
    marginTop: -1,
  },
  gridLine: { height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(255,255,255,0.055)' },
  barInactive: { flex: 1, backgroundColor: '#1A2948', borderRadius: 99 },
  month: { fontFamily: fonts.sansRegular, fontSize: 10, color: colors.textMuted, letterSpacing: 0.2, marginBottom: 6 },
  monthActive: { fontFamily: fonts.sansSemiBold, color: colors.accent },
});
