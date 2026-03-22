// ─── Onboarding stack ────────────────────────────────────────────────────────
export type OnboardingStackParamList = {
  Hook: undefined;
  BaseCurrency: undefined;
  AddAccount: undefined;
  NetWorthResult: undefined;
  GoogleSignIn: undefined;
};

// ─── App (authenticated) stack ───────────────────────────────────────────────
export type AppStackParamList = {
  Dashboard: undefined;
};

// ─── Root ────────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Onboarding: undefined;
  App: undefined;
};
