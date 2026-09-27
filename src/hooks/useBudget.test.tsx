// @vitest-environment jsdom
import { useEffect } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProvider } from '@/contexts/UserContext';
import { useBudget } from './useBudget';

// expo-router's useFocusEffect requires a real navigation container; this
// hook only needs it to run its effect, so it's replaced with a plain
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
  id: 'user-stale-load',
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
  const { categories, refreshCategories } = useBudget();
  return (
    <div>
      <span data-testid="category-ids">{categories.map((c) => c.categoryId).join(',')}</span>
      <button onClick={() => refreshCategories()}>refresh</button>
    </div>
  );
}

describe('useBudget drops a stale load', () => {
  beforeEach(() => {
    vi.mocked(userService.loadUser).mockReset();
    vi.mocked(transactionService.getUserTransactions).mockReset();
    vi.mocked(transactionService.getUserTransactions).mockResolvedValue([]);
    vi.mocked(budgetService.getBudgetCategories).mockReset();
    vi.mocked(userService.loadUser).mockResolvedValue(testUser);
  });

  it("keeps the newer load's categories when an older, overlapping load resolves after it", async () => {
    let resolveFirst!: (v: ReturnType<typeof categoriesFor>) => void;
    const firstLoad = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    let resolveSecond!: (v: ReturnType<typeof categoriesFor>) => void;
    const secondLoad = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    const getBudgetCategories = vi.mocked(budgetService.getBudgetCategories);
    getBudgetCategories.mockImplementationOnce(
      () => firstLoad as ReturnType<typeof budgetService.getBudgetCategories>
    );
    getBudgetCategories.mockImplementationOnce(
      () => secondLoad as ReturnType<typeof budgetService.getBudgetCategories>
    );

    render(
      <UserProvider>
        <Probe />
      </UserProvider>
    );

    // Let the mount-triggered focus load start (the first getBudgetCategories call).
    await waitFor(() => expect(getBudgetCategories.mock.calls.length).toBeGreaterThanOrEqual(1));

    // A second, overlapping load starts before the first has resolved.
    screen.getByText('refresh').click();
    await waitFor(() => expect(getBudgetCategories.mock.calls.length).toBe(2));

    // The newer (second) load resolves first; the older (first) resolves after it.
    resolveSecond(categoriesFor('transport'));
    await waitFor(() => expect(screen.getByTestId('category-ids').textContent).toBe('transport'));
    resolveFirst(categoriesFor('food'));

    // Give the stale, later-resolving first load a chance to (wrongly) apply.
    await new Promise((r) => setTimeout(r, 20));
    expect(screen.getByTestId('category-ids').textContent).toBe('transport');
  });
});

function categoriesFor(categoryId: string) {
  return [{ id: `budget_${categoryId}`, categoryId, budgeted: 100, userId: testUser.id }];
}
