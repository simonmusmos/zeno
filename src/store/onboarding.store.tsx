import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_CURRENCY, convertCurrency } from '../data/currencies';
import type { Account, AccountType } from '../types/account.types';
import type { Currency } from '../types/currency.types';

const STORAGE_KEY = '@zeno/onboarding';

interface OnboardingContextValue {
  // Base currency
  baseCurrency: Currency;
  setBaseCurrency: (c: Currency) => void;

  // Accounts
  accounts: Account[];
  addAccount: (input: {
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
  }) => void;

  // Computed
  netWorth:    number;
  assets:      number;
  liabilities: number;

  isHydrated: boolean;
}

const OnboardingContext = createContext<OnboardingContextValue>(null!);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [baseCurrency, _setBaseCurrency] = useState<Currency>(DEFAULT_CURRENCY);
  const [accounts, setAccounts]          = useState<Account[]>([]);
  const [isHydrated, setHydrated]        = useState(false);

  // Hydrate on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        const { baseCurrency: savedCcy, accounts: savedAccounts } = JSON.parse(raw);
        if (savedCcy)      _setBaseCurrency(savedCcy);
        if (savedAccounts) setAccounts(savedAccounts);
      }
    }).finally(() => setHydrated(true));
  }, []);

  async function persistState(ccy: Currency, accs: Account[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ baseCurrency: ccy, accounts: accs }));
  }

  function setBaseCurrency(c: Currency) {
    _setBaseCurrency(c);
    persistState(c, accounts);
  }

  function addAccount(input: {
    name: string;
    type: AccountType;
    balance: number;
    currency: string;
  }) {
    const balanceInBase = convertCurrency(input.balance, input.currency, baseCurrency.code);
    const account: Account = {
      id: `acct_${Date.now()}`,
      ...input,
      balanceInBase,
    };
    const updated = [...accounts, account];
    setAccounts(updated);
    persistState(baseCurrency, updated);
  }

  const { netWorth, assets, liabilities } = useMemo(() => {
    const a = accounts
      .filter(acc => acc.type !== 'debt')
      .reduce((s, acc) => s + acc.balanceInBase, 0);
    const l = accounts
      .filter(acc => acc.type === 'debt')
      .reduce((s, acc) => s + acc.balanceInBase, 0);
    return { assets: a, liabilities: l, netWorth: a - l };
  }, [accounts]);

  return (
    <OnboardingContext.Provider
      value={{ baseCurrency, setBaseCurrency, accounts, addAccount, netWorth, assets, liabilities, isHydrated }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  return useContext(OnboardingContext);
}
