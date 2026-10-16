// @vitest-environment jsdom
import { useEffect, useRef } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '@/hooks/useUser';
import { UserProvider, type UserContextValue } from './UserContext';

// Hoisted so one Map backs both the mock factory and the beforeEach that
// restores it. A queued mockImplementationOnce a test leaves unconsumed would
// otherwise hang the next getItem call in a later test.
const { store } = vi.hoisted(() => ({ store: new Map<string, string>() }));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => store.get(key) ?? null),
    setItem: vi.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
  },
}));

beforeEach(() => {
  store.clear();
  vi.mocked(AsyncStorage.getItem).mockReset();
  vi.mocked(AsyncStorage.getItem).mockImplementation(async (key: string) => store.get(key) ?? null);
  vi.mocked(AsyncStorage.setItem).mockReset();
  vi.mocked(AsyncStorage.setItem).mockImplementation(async (key: string, value: string) => {
    store.set(key, value);
  });
});

// A fresh id on every call exposes a createUser that is not single-flight
// (two calls, two ids).
let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `test-user-${++nextId}` }));

afterEach(cleanup);

function DoubleTapCreate({ onDone }: { onDone: (ids: [string, string]) => void }) {
  const { user, loading, createUser } = useUser();
  useEffect(() => {
    if (loading || user) return;
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

    await waitFor(() => expect(getItem.mock.calls.length).toBeGreaterThanOrEqual(2));

    if (getItem.mock.calls.length >= 3) {
      // Two independent reads: the newer one resolves with a valid user, then
      // the older one rejects.
      resolveSecondRefreshRead(JSON.stringify(storedUser));
      await Promise.resolve();
      rejectFirstRefreshRead(new Error('stale read failed'));
    } else {
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

function SettingsProbe({ onReady }: { onReady: (value: UserContextValue) => void }) {
  const context = useUser();
  useEffect(() => {
    if (context.loading) return;
    onReady(context);
  });
  return <span data-testid="dark-mode">{String(context.user?.settings.darkMode ?? false)}</span>;
}

describe('a settings change survives a reload', () => {
  it('is read back from storage by a fresh provider after the toggle resolves', async () => {
    let created: UserContextValue | null = null;
    render(
      <UserProvider>
        <SettingsProbe onReady={(context) => (created = context)} />
      </UserProvider>
    );
    await waitFor(() => expect(created).not.toBeNull());
    if (created!.user === null) {
      await created!.createUser();
    }
    await waitFor(() => expect(created!.user).not.toBeNull());

    await created!.updateUser({ settings: { ...created!.user!.settings, darkMode: true } });
    await waitFor(() => expect(screen.getByTestId('dark-mode').textContent).toBe('true'));

    cleanup();
    render(
      <UserProvider>
        <SettingsProbe onReady={() => {}} />
      </UserProvider>
    );
    await waitFor(() => expect(screen.getByTestId('dark-mode').textContent).toBe('true'));
  });
});

describe('a failed settings write leaves the value unchanged', () => {
  it('rejects, and keeps the provider user and stored user at the old value, when storage rejects the write', async () => {
    let created: UserContextValue | null = null;
    render(
      <UserProvider>
        <SettingsProbe onReady={(context) => (created = context)} />
      </UserProvider>
    );
    await waitFor(() => expect(created).not.toBeNull());
    if (created!.user === null) {
      await created!.createUser();
    }
    await waitFor(() => expect(created!.user).not.toBeNull());
    expect(created!.user!.settings.darkMode).toBe(false);

    const setItem = vi.mocked(AsyncStorage.setItem);
    setItem.mockRejectedValueOnce(new Error('storage write failed'));

    await expect(
      created!.updateUser({ settings: { ...created!.user!.settings, darkMode: true } })
    ).rejects.toThrow('storage write failed');

    expect(screen.getByTestId('dark-mode').textContent).toBe('false');

    cleanup();
    render(
      <UserProvider>
        <SettingsProbe onReady={() => {}} />
      </UserProvider>
    );
    await waitFor(() => expect(screen.getByTestId('dark-mode').textContent).toBe('false'));
  });
});

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
