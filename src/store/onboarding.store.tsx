import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { USD_RATES, DEFAULT_CURRENCY, convertWithRates } from '../data/currencies';
import { connectTiingo, tickersForCurrencies, parseTopResponse } from '../services/tiingo';
import { TIINGO_TOKEN } from '../config';
import type { Account, AccountType } from '../types/account.types';
import type { Currency } from '../types/currency.types';

const STORAGE_KEY = '@zeno/onboarding';
const RATES_KEY   = '@zeno/rates';
const RATES_TTL   = 6 * 60 * 60 * 1000; // 6 hours for Frankfurter (ECB updates daily)

export type RatesStatus = 'loading' | 'live' | 'fresh' | 'cached' | 'error';

interface OnboardingContextValue {
  baseCurrency: Currency;
  setBaseCurrency: (c: Currency) => void;

  accounts: Account[];
  addAccount: (input: {
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
  }) => void;

  netWorth:    number;
  assets:      number;
  liabilities: number;

  ratesStatus:    RatesStatus;
  ratesUpdatedAt: number | null;
  refreshRates:   () => Promise<void>;

  isHydrated: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue>(null!);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [baseCurrency, _setBaseCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [rawAccounts, setRawAccounts]    = useState<Account[]>([]);
  const [isHydrated, setHydrated]        = useState(false);

  const [liveRates, setLiveRates]           = useState<Record<string, number>>(USD_RATES);
  const [ratesStatus, setRatesStatus]       = useState<RatesStatus>('loading');
  const [ratesUpdatedAt, setRatesUpdatedAt] = useState<number | null>(null);

  const fetchingRef   = useRef(false);
  const tiingoRef     = useRef<{ disconnect: () => void } | null>(null);
  const pollRef       = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Hydrate ────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [onboardingRaw, ratesRaw] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(RATES_KEY),
        ]);
        if (onboardingRaw) {
          const { baseCurrency: savedCcy, accounts: savedAccounts } = JSON.parse(onboardingRaw);
          if (savedCcy)      _setBaseCurrency(savedCcy);
          if (savedAccounts) setRawAccounts(savedAccounts);
        }
        if (ratesRaw) {
          const { rates, updatedAt } = JSON.parse(ratesRaw);
          setLiveRates(rates);
          setRatesUpdatedAt(updatedAt);
          setRatesStatus(Date.now() - updatedAt < RATES_TTL ? 'fresh' : 'cached');
        } else {
          setRatesStatus('cached');
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // ── Auto-refresh Frankfurter if stale ─────────────────────────────────────
  useEffect(() => {
    if (!isHydrated) return;
    const age = ratesUpdatedAt ? Date.now() - ratesUpdatedAt : Infinity;
    if (age >= RATES_TTL) refreshRates();
  }, [isHydrated]);

  // ── Frankfurter baseline fetch ─────────────────────────────────────────────
  async function refreshRates() {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    if (ratesStatus !== 'live') setRatesStatus('loading');
    try {
      const res  = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      const rates: Record<string, number> = { USD: 1, ...data.rates };
      const now = Date.now();
      // Merge: keep any live Tiingo rates that are more up-to-date
      setLiveRates(prev => ({ ...rates, ...extractLiveOverrides(prev, rates) }));
      setRatesUpdatedAt(now);
      if (ratesStatus !== 'live') setRatesStatus('fresh');
      await AsyncStorage.setItem(RATES_KEY, JSON.stringify({ rates, updatedAt: now }));
    } catch {
      if (ratesStatus !== 'live') setRatesStatus('error');
    } finally {
      fetchingRef.current = false;
    }
  }

  // ── Tiingo WebSocket — connect/reconnect when currencies change ────────────
  const currencySet = useMemo(() => {
    const codes = new Set([baseCurrency.code, ...rawAccounts.map(a => a.currency)]);
    codes.delete('USD');
    return Array.from(codes);
  }, [rawAccounts, baseCurrency.code]);

  useEffect(() => {
    if (!isHydrated) return;

    tiingoRef.current?.disconnect();
    tiingoRef.current = null;

    console.log('[Store] currencySet:', currencySet);
    if (currencySet.length === 0) {
      console.log('[Store] No currencies to track — skipping WebSocket.');
      return;
    }

    tiingoRef.current = connectTiingo(
      currencySet,
      (updates) => {
        // Merge streaming updates into liveRates
        setLiveRates(prev => ({ ...prev, ...updates }));
        setRatesStatus('live');
        setRatesUpdatedAt(Date.now());
      },
      (status) => {
        if (status === 'connected') {
          // keep current ratesStatus — will flip to 'live' on first data
        } else if (status === 'error') {
          setRatesStatus(prev => prev === 'live' ? 'fresh' : prev);
        }
      },
    );

    return () => {
      tiingoRef.current?.disconnect();
      tiingoRef.current = null;
    };
  }, [isHydrated, currencySet.join(',')]);

  // ── 5-second REST poll (backup / supplement to WebSocket) ─────────────────
  useEffect(() => {
    if (!isHydrated || currencySet.length === 0) return;
    if (!TIINGO_TOKEN || TIINGO_TOKEN === 'YOUR_TIINGO_TOKEN_HERE') return;

    const tickers = tickersForCurrencies(currencySet).join(',');
    if (!tickers) return;

    async function poll() {
      try {
        const res  = await fetch(
          `https://api.tiingo.com/tiingo/fx/top?tickers=${tickers}&token=${TIINGO_TOKEN}`,
        );
        if (!res.ok) return;
        const data = await res.json();
        const updates = parseTopResponse(data);
        if (Object.keys(updates).length > 0) {
          setLiveRates(prev => ({ ...prev, ...updates }));
          setRatesStatus('live');
          setRatesUpdatedAt(Date.now());
        }
      } catch { /* silent */ }
    }

    poll(); // immediate first fetch
    pollRef.current = setInterval(poll, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isHydrated, currencySet.join(',')]);

  // ── Pause WebSocket when app goes to background ────────────────────────────
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'background' || state === 'inactive') {
        tiingoRef.current?.disconnect();
        tiingoRef.current = null;
      } else if (state === 'active' && isHydrated && currencySet.length > 0) {
        tiingoRef.current = connectTiingo(
          currencySet,
          (updates) => {
            setLiveRates(prev => ({ ...prev, ...updates }));
            setRatesStatus('live');
            setRatesUpdatedAt(Date.now());
          },
          () => {},
        );
      }
    });
    return () => sub.remove();
  }, [isHydrated, currencySet.join(',')]);

  // ── Persist ────────────────────────────────────────────────────────────────
  async function persist(ccy: Currency, accs: Account[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ baseCurrency: ccy, accounts: accs }));
  }

  function setBaseCurrency(c: Currency) {
    _setBaseCurrency(c);
    persist(c, rawAccounts);
  }

  function addAccount(input: { name: string; type: AccountType; balance: number; currency: string }) {
    const account: Account = {
      id: `acct_${Date.now()}`,
      ...input,
      balanceInBase: convertWithRates(input.balance, input.currency, baseCurrency.code, liveRates),
    };
    const updated = [...rawAccounts, account];
    setRawAccounts(updated);
    persist(baseCurrency, updated);
  }

  // ── Live-converted accounts ────────────────────────────────────────────────
  const accounts = useMemo(
    () => rawAccounts.map(acc => ({
      ...acc,
      balanceInBase: convertWithRates(acc.balance, acc.currency, baseCurrency.code, liveRates),
    })),
    [rawAccounts, baseCurrency.code, liveRates],
  );

  const { netWorth, assets, liabilities } = useMemo(() => {
    const a = accounts.filter(a => a.type !== 'debt').reduce((s, a) => s + a.balanceInBase, 0);
    const l = accounts.filter(a => a.type === 'debt').reduce((s, a) => s + a.balanceInBase, 0);
    return { assets: a, liabilities: l, netWorth: a - l };
  }, [accounts]);

  return (
    <OnboardingContext.Provider value={{
      baseCurrency, setBaseCurrency,
      accounts, addAccount,
      netWorth, assets, liabilities,
      ratesStatus, ratesUpdatedAt, refreshRates,
      isHydrated,
    }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Extract any rates that Tiingo has updated beyond the Frankfurter baseline */
function extractLiveOverrides(
  current: Record<string, number>,
  baseline: Record<string, number>,
): Record<string, number> {
  const overrides: Record<string, number> = {};
  for (const [k, v] of Object.entries(current)) {
    if (baseline[k] !== v) overrides[k] = v; // keep live value
  }
  return overrides;
}
