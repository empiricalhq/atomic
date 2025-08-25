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
  name: string;
  budgeted: number;
  spent: number;
  icon: keyof typeof Ionicons.glyphMap;
  userId: string;
}
