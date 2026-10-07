// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProvider } from '@/contexts/UserContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { useTransactions } from './useTransactions';

vi.mock('@/api/userService', () => ({
  userService: { loadUser: vi.fn(), createAnonymousUser: vi.fn() },
}));
vi.mock('@/api/transactionService', () => ({
  transactionService: { getUserTransactions: vi.fn() },
}));

import { userService } from '@/api/userService';
import { transactionService } from '@/api/transactionService';

const testUser = {
  id: 'user-stale-tx-load',
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
  const { transactions, refreshTransactions } = useTransactions();
  return (
    <div>
      <span data-testid="tx-descriptions">{transactions.map((t) => t.description).join(',')}</span>
      <button onClick={() => refreshTransactions()}>refresh</button>
    </div>
  );
}

const transactionsFor = (description: string) => [
  {
    id: `tx-${description}`,
    amount: 10,
    description,
    category: 'food',
    date: new Date(),
    type: 'expense' as const,
    userId: testUser.id,
  },
];

describe('useTransactions drops a stale load', () => {
  beforeEach(() => {
    vi.mocked(userService.loadUser).mockReset();
    vi.mocked(userService.loadUser).mockResolvedValue(testUser);
    vi.mocked(transactionService.getUserTransactions).mockReset();
  });

  it("keeps the newer load's transactions when an older, overlapping load resolves after it", async () => {
    let resolveFirst!: (v: ReturnType<typeof transactionsFor>) => void;
    const firstLoad = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    let resolveSecond!: (v: ReturnType<typeof transactionsFor>) => void;
    const secondLoad = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    const getUserTransactions = vi.mocked(transactionService.getUserTransactions);
    getUserTransactions.mockImplementationOnce(
      () => firstLoad as ReturnType<typeof transactionService.getUserTransactions>
    );
    getUserTransactions.mockImplementationOnce(
      () => secondLoad as ReturnType<typeof transactionService.getUserTransactions>
    );

    render(
      <UserProvider>
        <TransactionsProvider>
          <Probe />
        </TransactionsProvider>
      </UserProvider>
    );

    await waitFor(() => expect(getUserTransactions.mock.calls.length).toBeGreaterThanOrEqual(1));

    screen.getByText('refresh').click();
    await waitFor(() => expect(getUserTransactions.mock.calls.length).toBe(2));

    resolveSecond(transactionsFor('lunch'));
    await waitFor(() => expect(screen.getByTestId('tx-descriptions').textContent).toBe('lunch'));
    resolveFirst(transactionsFor('coffee'));

    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByTestId('tx-descriptions').textContent).toBe('lunch');
  });
});
