import { describe, expect, it, vi } from 'vitest';

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => store.get(key) ?? null),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
    },
  };
});

// expo-crypto bridges to a native module that jsdom can't load; a fresh id
// on every call is enough for createTransaction here.
let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `test-tx-${++nextId}` }));

import { transactionService } from './transactionService';

describe('transactionService concurrent writes', () => {
  it('keeps both transactions from two concurrent createTransaction calls for the same user', async () => {
    const userId = 'user-concurrent-tx';
    await Promise.all([
      transactionService.createTransaction({
        amount: 10,
        description: 'coffee',
        category: 'food',
        date: new Date(),
        type: 'expense',
        userId,
      }),
      transactionService.createTransaction({
        amount: 20,
        description: 'lunch',
        category: 'food',
        date: new Date(),
        type: 'expense',
        userId,
      }),
    ]);

    const transactions = await transactionService.getUserTransactions(userId);
    expect(transactions.map((t) => t.description).toSorted()).toEqual(['coffee', 'lunch']);
  });
});

describe('getTransactionSummary money sums', () => {
  it('sums 0.1 and 0.2 exactly for income, expenses, and category totals', () => {
    const summary = transactionService.getTransactionSummary([
      {
        id: 'income-1',
        amount: 0.1,
        description: 'refund a',
        category: 'other',
        date: new Date(),
        type: 'income',
        userId: 'user-summary',
      },
      {
        id: 'income-2',
        amount: 0.2,
        description: 'refund b',
        category: 'other',
        date: new Date(),
        type: 'income',
        userId: 'user-summary',
      },
      {
        id: 'expense-1',
        amount: -0.1,
        description: 'coffee',
        category: 'food',
        date: new Date(),
        type: 'expense',
        userId: 'user-summary',
      },
      {
        id: 'expense-2',
        amount: -0.2,
        description: 'snack',
        category: 'food',
        date: new Date(),
        type: 'expense',
        userId: 'user-summary',
      },
    ]);

    expect(summary.totalIncome).toBe(0.3);
    expect(summary.totalExpenses).toBe(0.3);
    expect(summary.netAmount).toBe(0);
    expect(summary.topCategories).toEqual([{ category: 'food', total: 0.3 }]);
  });
});
