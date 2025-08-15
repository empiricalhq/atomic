export interface User {
  id: string;
  name: string;
  email?: string;
  isAnonymous: boolean;
  createdAt: Date;
  settings: UserSettings;
}

export interface UserSettings {
  notifications: boolean;
  biometric: boolean;
  darkMode: boolean;
  currency: string;
  language: string;
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  category: string;
  date: Date;
  type: 'expense' | 'income';
  userId: string;
  receiptImage?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  icon: string;
  color: string;
  userId: string;
}
