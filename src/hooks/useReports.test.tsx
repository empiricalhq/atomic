// @vitest-environment jsdom
import { useEffect } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider } from '@/contexts/UserContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { useReports } from './useReports';

vi.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    useEffect(() => callback(), [callback]);
  },
}));

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

// expo-crypto bridges to a native module jsdom can't load; this test only reads.
vi.mock('expo-crypto', () => ({ randomUUID: () => 'unused' }));

afterEach(cleanup);

const user = {
  id: 'reports-user',
  name: 'Ana',
  isAnonymous: true,
  createdAt: new Date().toISOString(),
  settings: {
    notifications: true,
    biometric: false,
    darkMode: false,
    currency: 'USD',
    language: 'es',
  },
};

const stored = (overrides: Record<string, unknown>) => ({
  id: String(Math.random()),
  description: 'x',
  userId: user.id,
  ...overrides,
});

function Probe() {
  const report = useReports();
  return (
    <span data-testid="report">
      {JSON.stringify({
        loading: report.loading,
        totalIncome: report.totalIncome,
        totalExpenses: report.totalExpenses,
        netAmount: report.netAmount,
        top: report.topCategories.map((c) => [c.name, c.amount]),
        months: report.monthly.length,
      })}
    </span>
  );
}

describe('useReports', () => {
  it("derives totals and top categories from the user's own transactions in the last six months", async () => {
    const thisMonth = new Date();
    const longAgo = new Date(thisMonth.getFullYear() - 2, 0, 15);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem(
      'transactions',
      JSON.stringify([
        stored({ amount: 1000, type: 'income', category: 'salary', date: thisMonth }),
        stored({ amount: 40, type: 'expense', category: 'food', date: thisMonth }),
        stored({ amount: 10, type: 'expense', category: 'transport', date: thisMonth }),
        stored({ amount: 500, type: 'expense', category: 'food', date: longAgo }),
        stored({
          amount: 900,
          type: 'expense',
          category: 'food',
          date: thisMonth,
          userId: 'other',
        }),
      ])
    );

    render(
      <UserProvider>
        <TransactionsProvider>
          <Probe />
        </TransactionsProvider>
      </UserProvider>
    );

    await waitFor(() => {
      const report = JSON.parse(screen.getByTestId('report').textContent!);
      expect(report.loading).toBe(false);
      expect(report).toMatchObject({
        totalIncome: 1000,
        totalExpenses: 50,
        netAmount: 950,
        top: [
          ['Comida', 40],
          ['Transporte', 10],
        ],
        months: 6,
      });
    });
  });
});
