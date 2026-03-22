export type AccountType = 'cash' | 'investment' | 'debt';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;        // ISO 4217 e.g. "PHP"
  balanceInBase: number;   // converted to base currency
}
