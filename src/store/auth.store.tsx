import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '../types/user.types';

const STORAGE_KEY = '@zeno/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
  loginWithGoogle: () => Promise<void>;
  completeAsGuest: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>(null!);

const MOCK_USER: User = {
  id: 'google-mock-001',
  displayName: 'Alex Rivera',
  email: 'alex@example.com',
  photoUrl: undefined,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [isAuthenticated, setAuthed]  = useState(false);
  const [isLoading, setLoading]       = useState(false);
  const [isHydrated, setHydrated]     = useState(false);

  // Hydrate on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        const { isAuthenticated: authed, user: savedUser } = JSON.parse(raw);
        if (authed) {
          setAuthed(true);
          if (savedUser) setUser(savedUser);
        }
      }
    }).finally(() => setHydrated(true));
  }, []);

  async function persist(authed: boolean, u: User | null) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ isAuthenticated: authed, user: u }));
  }

  async function loginWithGoogle() {
    setLoading(true);
    await new Promise(res => setTimeout(res, 1600));
    setUser(MOCK_USER);
    setAuthed(true);
    await persist(true, MOCK_USER);
    setLoading(false);
  }

  function completeAsGuest() {
    setAuthed(true);
    persist(true, null);
  }

  function logout() {
    setUser(null);
    setAuthed(false);
    AsyncStorage.removeItem(STORAGE_KEY);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isHydrated, loginWithGoogle, completeAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
