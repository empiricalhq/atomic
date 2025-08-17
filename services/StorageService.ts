import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Transaction, BudgetCategory } from '@/types';

const KEYS = {
  USER: 'user',
  TRANSACTIONS: 'transactions',
  BUDGET_CATEGORIES: 'budgetCategories',
  ONBOARDING_COMPLETE: 'onboardingComplete',
};

class StorageService {
  async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(KEYS.USER);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async saveUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactions = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
      const allTransactions: Transaction[] = transactions ? JSON.parse(transactions) : [];
      return allTransactions.filter((t) => t.userId === userId);
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    try {
      const transactions = await this.getAllTransactions();
      const updatedTransactions = [...transactions, transaction];
      await AsyncStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(updatedTransactions));
    } catch (error) {
      console.error('Error saving transaction:', error);
    }
  }

  private async getAllTransactions(): Promise<Transaction[]> {
    const transactions = await AsyncStorage.getItem(KEYS.TRANSACTIONS);
    return transactions ? JSON.parse(transactions) : [];
  }

  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    try {
      const categories = await AsyncStorage.getItem(KEYS.BUDGET_CATEGORIES);
      const allCategories: BudgetCategory[] = categories ? JSON.parse(categories) : [];
      return allCategories.filter((c) => c.userId === userId);
    } catch (error) {
      console.error('Error getting budget categories:', error);
      return [];
    }
  }

  async saveBudgetCategory(category: BudgetCategory): Promise<void> {
    try {
      const categories = await this.getAllBudgetCategories();
      const updatedCategories = [...categories, category];
      await AsyncStorage.setItem(KEYS.BUDGET_CATEGORIES, JSON.stringify(updatedCategories));
    } catch (error) {
      console.error('Error saving budget category:', error);
    }
  }

  private async getAllBudgetCategories(): Promise<BudgetCategory[]> {
    const categories = await AsyncStorage.getItem(KEYS.BUDGET_CATEGORIES);
    return categories ? JSON.parse(categories) : [];
  }

  async getOnboardingComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
      return value === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  }

  async setOnboardingComplete(): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
    } catch (error) {
      console.error('Error setting onboarding complete:', error);
    }
  }

  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const storageService = new StorageService();
