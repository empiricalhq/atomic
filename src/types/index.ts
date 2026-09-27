import { Ionicons } from '@expo/vector-icons';

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
  category: string; // category id
  date: Date;
  type: 'expense' | 'income';
  userId: string;
  receiptImage?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export interface BudgetCategory {
  id: string;
  categoryId: string; // references Category.id in EXPENSE_CATEGORIES
  budgeted: number;
  userId: string;
}

// `name`, `icon`, `spent` and `progress` are derived at read time (see
// src/utils/budget.ts and src/hooks/useBudget.ts) from categoryId and the
// user's transactions, not stored, so they can never go stale.
export interface BudgetCategoryWithSpent extends BudgetCategory {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  spent: number;
  progress: number;
}
