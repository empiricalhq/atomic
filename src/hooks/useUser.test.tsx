// @vitest-environment jsdom
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProvider } from '@/contexts/UserContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { useUser } from './useUser';
import { useTransactions } from './useTransactions';
import { useBudget } from './useBudget';

// expo-router's useFocusEffect requires a real navigation container; these
// hooks only need it to run their effect, so it's replaced with a plain
// mount effect rather than pulling in react-navigation for this test.
vi.mock('expo-router', () => ({
  useFocusEffect: (callback: () => void | (() => void)) => {
    useEffect(() => callback(), [callback]);
  },
}));

vi.mock('@/api/userService', () => ({
  userService: { loadUser: vi.fn(), createAnonymousUser: vi.fn() },
}));
vi.mock('@/api/transactionService', () => ({
  transactionService: { getUserTransactions: vi.fn() },
}));
vi.mock('@/api/budgetService', () => ({ budgetService: { getBudgetCategories: vi.fn() } }));

import { userService } from '@/api/userService';
import { transactionService } from '@/api/transactionService';
import { budgetService } from '@/api/budgetService';

const testUser = {
  id: 'user-1',
  name: 'Ana',
  isAnonymous: true,
  createdAt: new Date(),
  settings: {
    notifications: true,
    biometric: false,
    darkMode: false,
    currency: 'USD',
    language: 'es',
  },
};

function Probe() {
  const { error: userError, refreshUser } = useUser();
  const { transactions } = useTransactions();
  const { categories } = useBudget();

  return (
    <div>
      <span data-testid="user-error">{userError ?? ''}</span>
      <span data-testid="tx-count">{transactions.length}</span>
      <span data-testid="budget-count">{categories.length}</span>
      <button onClick={() => refreshUser()}>retry</button>
    </div>
  );
}

describe('shared user state', () => {
  beforeEach(() => {
    vi.mocked(userService.loadUser).mockReset();
    vi.mocked(transactionService.getUserTransactions).mockReset();
    vi.mocked(budgetService.getBudgetCategories).mockReset();
  });

  it('reloads both transactions and budgets, in every screen, from a single retry after a failed user load', async () => {
    // A flag, not mockRejectedValueOnce/mockResolvedValueOnce: a shared
    // provider makes one loadUser() call per load, but the bug this
    // guards against made every screen call it independently, so the
    // fix must hold regardless of how many calls a mount makes.
    let shouldFail = true;
    vi.mocked(userService.loadUser).mockImplementation(async () => {
      if (shouldFail) throw new Error('storage read failed');
      return testUser;
    });
    vi.mocked(transactionService.getUserTransactions).mockResolvedValue([
      {
        id: 't1',
        amount: 10,
        description: 'lunch',
        category: 'food',
        date: new Date(),
        type: 'expense',
        userId: testUser.id,
      },
    ]);
    vi.mocked(budgetService.getBudgetCategories).mockResolvedValue([
      { id: 'c1', categoryId: 'food', budgeted: 100, userId: testUser.id },
    ]);

    render(
      <UserProvider>
        <TransactionsProvider>
          <Probe />
        </TransactionsProvider>
      </UserProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user-error').textContent).not.toBe(''));
    expect(screen.getByTestId('tx-count').textContent).toBe('0');
    expect(screen.getByTestId('budget-count').textContent).toBe('0');

    shouldFail = false;
    screen.getByText('retry').click();

    await waitFor(() => expect(screen.getByTestId('user-error').textContent).toBe(''));
    await waitFor(() => expect(screen.getByTestId('tx-count').textContent).toBe('1'));
    await waitFor(() => expect(screen.getByTestId('budget-count').textContent).toBe('1'));
  });
});
