import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Transaction, BudgetCategory } from '@/types';

const KEYS = {
  USER: 'user',
  TRANSACTIONS: 'transactions',
  BUDGET_CATEGORIES: 'budgetCategories',
};

class StorageService {
  // One promise chain per key: a write, or a read-check-write a caller runs
  // through runExclusive, starts only once every earlier operation on that
  // key has settled, so two concurrent writes to the same key can't each
  // read the same starting data and overwrite the other's addition.
  private queues = new Map<string, Promise<unknown>>();

  private runExclusive<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.queues.get(key) ?? Promise.resolve();
    const next = previous.then(operation, operation);
    this.queues.set(
      key,
      next.then(
        () => undefined,
        () => undefined
      )
    );
    return next;
  }

  // Returns null only for a missing key (AsyncStorage.getItem's own null),
  // not an empty string: "" is a stored value, so it's parsed like any
  // other, and a parse failure rejects rather than reading as missing.
  private async get<T>(key: string): Promise<T | null> {
    const data = await AsyncStorage.getItem(key);
    return data === null ? null : JSON.parse(data);
  }

  private async set<T>(key: string, value: T): Promise<void> {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  }

  async getUser(): Promise<User | null> {
    return this.get<User>(KEYS.USER);
  }

  async saveUser(user: User): Promise<void> {
    return this.runExclusive(KEYS.USER, () => this.set(KEYS.USER, user));
  }

  // update runs inside the user key's queue, on the record it reads there,
  // not a snapshot the caller read earlier: two concurrent updates (say a
  // settings change and a profile edit) would otherwise both read the same
  // starting user and the later write would overwrite the earlier one.
  async updateUser(
    update: (user: User | null) => User | null | Promise<User | null>
  ): Promise<User | null> {
    return this.runExclusive(KEYS.USER, async () => {
      const user = await this.get<User>(KEYS.USER);
      const updated = await update(user);
      if (updated) await this.set(KEYS.USER, updated);
      return updated;
    });
  }

  private async getAllTransactions(): Promise<Transaction[]> {
    return (await this.get<Transaction[]>(KEYS.TRANSACTIONS)) || [];
  }

  async getTransactions(userId: string): Promise<Transaction[]> {
    const allTransactions = await this.getAllTransactions();
    return allTransactions.filter((t) => t.userId === userId);
  }

  async saveTransaction(transaction: Transaction): Promise<void> {
    return this.runExclusive(KEYS.TRANSACTIONS, async () => {
      const transactions = await this.getAllTransactions();
      await this.set(KEYS.TRANSACTIONS, [...transactions, transaction]);
    });
  }

  private async getAllBudgetCategories(): Promise<BudgetCategory[]> {
    return (await this.get<BudgetCategory[]>(KEYS.BUDGET_CATEGORIES)) || [];
  }

  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    const allCategories = await this.getAllBudgetCategories();
    return allCategories.filter((c) => c.userId === userId);
  }

  // update runs inside this key's queue: the caller's duplicate check and
  // the write it guards happen as one step, so two concurrent adds can't
  // both pass the check before either write lands.
  async addBudgetCategory(
    update: (categories: BudgetCategory[]) => BudgetCategory | Promise<BudgetCategory>
  ): Promise<BudgetCategory> {
    return this.runExclusive(KEYS.BUDGET_CATEGORIES, async () => {
      const categories = await this.getAllBudgetCategories();
      const newCategory = await update(categories);
      await this.set(KEYS.BUDGET_CATEGORIES, [...categories, newCategory]);
      return newCategory;
    });
  }
}

export const storageService = new StorageService();
