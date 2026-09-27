// @vitest-environment jsdom
import { useEffect, useRef } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/hooks/useUser';
import { UserProvider } from './UserContext';

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
// on every call is what would expose the bug (two calls, two ids) if
// createUser weren't single-flight.
let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `test-user-${++nextId}` }));

afterEach(cleanup);

function DoubleTapCreate({ onDone }: { onDone: (ids: [string, string]) => void }) {
  const { user, loading, createUser } = useUser();
  useEffect(() => {
    if (loading || user) return;
    // Both calls fire in the same tick, before either has awaited anything,
    // mirroring two rapid taps that both land before React re-renders with
    // a disabled button.
    Promise.all([createUser(), createUser()]).then(([a, b]) => onDone([a.id, b.id]));
  }, [loading, user, createUser, onDone]);
  return null;
}

function ShowStoredUserId() {
  const { user } = useUser();
  return <span data-testid="stored-user-id">{user?.id ?? ''}</span>;
}

describe('createUser is single-flight', () => {
  it('resolves two concurrent calls to the same user, and storage holds only that one', async () => {
    let ids: [string, string] | null = null;
    render(
      <UserProvider>
        <DoubleTapCreate onDone={(result) => (ids = result)} />
      </UserProvider>
    );

    await waitFor(() => expect(ids).not.toBeNull());
    const [first, second] = ids!;
    expect(first).toBe(second);
    expect(nextId).toBe(1); // createAnonymousUser's id generator ran exactly once

    cleanup();
    render(
      <UserProvider>
        <ShowStoredUserId />
      </UserProvider>
    );
    await waitFor(() => expect(screen.getByTestId('stored-user-id').textContent).toBe(first));
  });
});

const storedUser = {
  id: 'refresh-user-1',
  name: 'Usuario',
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

function DoubleRefresh({ onDone }: { onDone: () => void }) {
  const { loading, refreshUser } = useUser();
  const firedRef = useRef(false);
  useEffect(() => {
    if (loading || firedRef.current) return;
    firedRef.current = true;
    // Both calls fire in the same tick, before either has awaited anything,
    // mirroring two rapid retries.
    Promise.all([refreshUser(), refreshUser()]).then(onDone);
  }, [loading, refreshUser, onDone]);
  return null;
}

function ShowUserAndError() {
  const { user, error } = useUser();
  return <span data-testid="state">{JSON.stringify({ userId: user?.id ?? null, error })}</span>;
}

describe('refreshUser is single-flight', () => {
  it('joins a second concurrent call to the first read, so an older read that later fails cannot hide a valid user behind an error', async () => {
    const getItem = vi.mocked(AsyncStorage.getItem);
    getItem.mockReset();
    // The provider's mount effect issues the first read: no stored user yet.
    getItem.mockImplementationOnce(() => Promise.resolve(null));

    let resolveFirstRefreshRead!: (value: string | null) => void;
    let rejectFirstRefreshRead!: (err: Error) => void;
    const firstRefreshRead = new Promise<string | null>((resolve, reject) => {
      resolveFirstRefreshRead = resolve;
      rejectFirstRefreshRead = reject;
    });
    getItem.mockImplementationOnce(() => firstRefreshRead);

    let resolveSecondRefreshRead!: (value: string | null) => void;
    const secondRefreshRead = new Promise<string | null>((resolve) => {
      resolveSecondRefreshRead = resolve;
    });
    getItem.mockImplementationOnce(() => secondRefreshRead);

    let done = false;
    render(
      <UserProvider>
        <DoubleRefresh onDone={() => (done = true)} />
        <ShowUserAndError />
      </UserProvider>
    );

    // Give both refreshUser() calls a chance to each start a read if the
    // provider isn't single-flight.
    await waitFor(() => expect(getItem.mock.calls.length).toBeGreaterThanOrEqual(2));

    if (getItem.mock.calls.length >= 3) {
      // Not single-flight: two independent reads happened. The newer call's
      // read resolves first with a valid user, and the older call's read
      // rejects afterwards - reproducing the race the gate found.
      resolveSecondRefreshRead(JSON.stringify(storedUser));
      await Promise.resolve();
      rejectFirstRefreshRead(new Error('stale read failed'));
    } else {
      // Single-flight: only one read was issued for both calls.
      resolveFirstRefreshRead(JSON.stringify(storedUser));
    }

    await waitFor(() => expect(done).toBe(true));
    expect(getItem.mock.calls.length).toBe(2);
    expect(screen.getByTestId('state').textContent).toBe(
      JSON.stringify({ userId: storedUser.id, error: null })
    );
  });
});

function ShowLoadingUserAndError() {
  const { user, loading, error } = useUser();
  return (
    <span data-testid="load-state">
      {JSON.stringify({ loading, userId: user?.id ?? null, error })}
    </span>
  );
}

describe('an empty stored value is not treated as a missing user', () => {
  it('ends in the error state, not the missing-user state, when the user key reads back as ""', async () => {
    const getItem = vi.mocked(AsyncStorage.getItem);
    getItem.mockReset();
    getItem.mockImplementation(async (key: string) => (key === 'user' ? '' : null));

    render(
      <UserProvider>
        <ShowLoadingUserAndError />
      </UserProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId('load-state').textContent).not.toContain('"loading":true')
    );
    expect(screen.getByTestId('load-state').textContent).toBe(
      JSON.stringify({ loading: false, userId: null, error: 'Error cargando el usuario' })
    );
  });
});
