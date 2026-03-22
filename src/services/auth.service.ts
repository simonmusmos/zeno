import type { AuthResult, LoginCredentials, RegisterCredentials, User } from '../types/auth.types';

/**
 * Mock auth service — replace with Supabase / Firebase client later.
 *
 * To swap to a real backend:
 *   1. Replace the body of each function with the real SDK call.
 *   2. The return shape (AuthResult) stays the same — no screen changes needed.
 */

const MOCK_DELAY_MS = 1000;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockUser: User = {
  id: 'mock-user-001',
  email: 'demo@zeno.app',
  displayName: 'Demo User',
  createdAt: new Date().toISOString(),
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await delay(MOCK_DELAY_MS);

    // Simulate a successful login for the demo credentials
    if (credentials.email === 'demo@zeno.app' && credentials.password === 'password') {
      return { success: true, user: mockUser };
    }

    return {
      success: false,
      error: 'Invalid email or password.',
    };
  },

  async register(credentials: RegisterCredentials): Promise<AuthResult> {
    await delay(MOCK_DELAY_MS);

    if (!credentials.email || !credentials.password) {
      return { success: false, error: 'Email and password are required.' };
    }

    return {
      success: true,
      user: {
        ...mockUser,
        id: `user-${Date.now()}`,
        email: credentials.email,
        displayName: credentials.displayName,
      },
    };
  },

  async forgotPassword(email: string): Promise<AuthResult> {
    await delay(MOCK_DELAY_MS);

    if (!email) {
      return { success: false, error: 'Email is required.' };
    }

    // Always succeeds — we don't reveal whether the email exists
    return { success: true };
  },

  async logout(): Promise<void> {
    await delay(300);
    // Future: clear session tokens, revoke refresh token, etc.
  },
};
