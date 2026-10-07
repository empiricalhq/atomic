// @vitest-environment jsdom
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider } from '@/contexts/UserContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { useTransactions } from '@/hooks/useTransactions';

// The first read of the transactions key can be held back after it has read the
// stored value, so it resolves with data older than a write that lands meanwhile.
const hold = vi.hoisted(() => ({ release: null as Promise<void> | null }));

vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => {
        const value = store.get(key) ?? null;
        if (key === 'transactions' && hold.release) {
          const release = hold.release;
          hold.release = null;
          await release;
        }
        return value;
      }),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
    },
  };
});

vi.mock('expo-crypto', () => ({ randomUUID: () => `tx-${Math.random()}` }));

afterEach(cleanup);

const user = {
  id: 'shared-list-user',
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

function Adder() {
  const { addTransaction } = useTransactions();
  return (
    <button
      onClick={() =>
        addTransaction({
          amount: 12,
          description: 'lunch',
          category: 'food',
          date: new Date(),
          type: 'expense',
        })
      }>
      add
    </button>
  );
}

function Refresher() {
  const { refreshTransactions } = useTransactions();
  return <button onClick={() => refreshTransactions()}>refresh</button>;
}

function Home() {
  const { transactions, loading } = useTransactions();
  return (
    <span data-testid="home">
      {loading ? 'loading' : transactions.map((t) => t.description).join(',')}
    </span>
  );
}

describe('the shared transaction list', () => {
  it('shows a transaction added by one screen on another screen without a reload', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(user));

    render(
      <UserProvider>
        <TransactionsProvider>
          <Home />
          <Adder />
        </TransactionsProvider>
      </UserProvider>
    );
    await waitFor(() => expect(screen.getByTestId('home').textContent).toBe(''));

    fireEvent.click(screen.getByText('add'));

    await waitFor(() => expect(screen.getByTestId('home').textContent).toBe('lunch'));
  });

  it('keeps a transaction added while an older load is still in flight', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('transactions', '[]');
    let release!: () => void;
    hold.release = new Promise<void>((resolve) => {
      release = resolve;
    });

    render(
      <UserProvider>
        <TransactionsProvider>
          <Home />
          <Adder />
        </TransactionsProvider>
      </UserProvider>
    );
    await waitFor(() => expect(screen.getByText('add')).toBeTruthy());
    await waitFor(() => expect(hold.release).toBeNull());

    fireEvent.click(screen.getByText('add'));
    await waitFor(async () =>
      expect(await AsyncStorage.getItem('transactions')).toContain('lunch')
    );

    release();

    await waitFor(() => expect(screen.getByTestId('home').textContent).toBe('lunch'));
    // A stale list applied late would show the empty list until the next reload.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByTestId('home').textContent).toBe('lunch');
  });

  it('keeps the list on screen while a later reload runs', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(user));
    await AsyncStorage.setItem('transactions', '[]');

    render(
      <UserProvider>
        <TransactionsProvider>
          <Home />
          <Adder />
          <Refresher />
        </TransactionsProvider>
      </UserProvider>
    );
    await waitFor(() => expect(screen.getByTestId('home').textContent).toBe(''));
    fireEvent.click(screen.getByText('add'));
    await waitFor(() => expect(screen.getByTestId('home').textContent).toBe('lunch'));

    fireEvent.click(screen.getByText('refresh'));
    expect(screen.getByTestId('home').textContent).toBe('lunch');
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(screen.getByTestId('home').textContent).toBe('lunch');
  });

  it('rejects a use outside the provider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Home />)).toThrow('useTransactions must be used within');
    spy.mockRestore();
  });
});
