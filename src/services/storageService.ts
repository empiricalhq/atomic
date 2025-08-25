import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Transaction, BudgetCategory } from '@/types';

const KEYS = {
  USER: 'user',
  TRANSACTIONS: 'transactions',
  BUDGET_CATEGORIES: 'budgetCategories',
  ONBOARDING_COMPLETE: 'onboardingComplete',
};

class StorageService {
  private async get<T>(key: string): Promise<T | null> {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error(`Error getting item with key ${key}:`, error);
      return null;
    }
  }

  private async set<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item with key ${key}:`, error);
    }
  }

  async getUser(): Promise<User | null> {
    return this.get<User>(KEYS.USER);
  }

  async saveUser(user: User): Promise<void> {
    return this.set(KEYS.USER, user);
  }

  private async getAllTransactions(): Promise<Transaction[]> {
    return (await this.get<Transaction[]>(KEYS.TRANSACTIONS)) || [];
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const allTransactions = await this.getAllTransactions();
    return allTransactions.filter((t) => t.userId === userId);
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    const transactions = await this.getAllTransactions();
    const updatedTransactions = [...transactions, transaction];
    return this.set(KEYS.TRANSACTIONS, updatedTransactions);
  }

  private async getAllBudgetCategories(): Promise<BudgetCategory[]> {
    return (await this.get<BudgetCategory[]>(KEYS.BUDGET_CATEGORIES)) || [];
  }

  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    const allCategories = await this.getAllBudgetCategories();
    return allCategories.filter((c) => c.userId === userId);
  }

  async saveBudgetCategory(category: BudgetCategory): Promise<void> {
    const categories = await this.getAllBudgetCategories();
    const updatedCategories = [...categories, category];
    return this.set(KEYS.BUDGET_CATEGORIES, updatedCategories);
  }

  async getOnboardingComplete(): Promise<boolean> {
    const value = await AsyncStorage.getItem(KEYS.ONBOARDING_COMPLETE);
    return value === 'true';
  }

  async setOnboardingComplete(): Promise<void> {
    return AsyncStorage.setItem(KEYS.ONBOARDING_COMPLETE, 'true');
  }
}

export const storageService = new StorageService();
