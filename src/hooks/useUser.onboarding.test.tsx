// @vitest-environment jsdom
import { useEffect, useState } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserProvider } from '@/contexts/UserContext';
import { useUser } from './useUser';
import { budgetService } from '@/api/budgetService';

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

// expo-crypto bridges to a native module that jsdom can't load; only
// userService.createAnonymousUser's random id generation needs it here.
let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `test-user-${++nextId}` }));

afterEach(cleanup);

// Mirrors app/onboarding.tsx's handleGetStarted: create the user through
// the provider, then save a budget category for the id it returns, the same
// order onboarding uses.
function Onboard({ onDone }: { onDone: (userId: string) => void }) {
  const { user, loading, createUser } = useUser();
  useEffect(() => {
    if (loading || user) return;
    (async () => {
      const created = await createUser();
      await budgetService.addBudgetCategory({
        categoryId: 'food',
        budgeted: 200,
        userId: created.id,
      });
      onDone(created.id);
    })();
  }, [loading, user, createUser, onDone]);
  return null;
}

function ShowStoredCategories() {
  const { user, loading } = useUser();
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    if (loading || !user) return;
    budgetService.getBudgetCategories(user.id).then((categories) => setCount(categories.length));
  }, [loading, user]);
  return (
    <div>
      <span data-testid="user-id">{user?.id ?? ''}</span>
      <span data-testid="category-count">{count ?? ''}</span>
    </div>
  );
}

describe('the user created during onboarding survives a relaunch', () => {
  it('keeps a budget category saved right after onboarding once a fresh provider (a relaunch) reloads it', async () => {
    let onboardedUserId = '';
    render(
      <UserProvider>
        <Onboard onDone={(id) => (onboardedUserId = id)} />
      </UserProvider>
    );
    await waitFor(() => expect(onboardedUserId).not.toBe(''));
    cleanup();

    render(
      <UserProvider>
        <ShowStoredCategories />
      </UserProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user-id').textContent).toBe(onboardedUserId));
    await waitFor(() => expect(screen.getByTestId('category-count').textContent).toBe('1'));
  });
});
