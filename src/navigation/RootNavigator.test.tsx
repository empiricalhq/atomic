// @vitest-environment jsdom
import { useEffect, type ReactNode } from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UserProvider } from '@/contexts/UserContext';
import { useUser } from '@/hooks/useUser';
import { RootNavigator } from './RootNavigator';

// react-native bridges to native code jsdom can't load (importing it
// directly hits the same Flow-syntax parse failure expo-crypto does through
// its own react-native import); only its rendering primitives are stood in
// with plain DOM elements so the real RootNavigator, Typography, Button, and
// LoadingSpinner code still runs.
vi.mock('react-native', () => ({
  View: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
  Text: ({ children, ...props }: { children?: ReactNode }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({ onPress, children }: { onPress?: () => void; children?: ReactNode }) => (
    <button onClick={onPress}>{children}</button>
  ),
  ActivityIndicator: () => <div data-testid="activity-indicator" />,
}));

// Stack.Screen only configures a route for expo-router's real native-stack
// navigator and renders nothing itself; mounting that navigator needs a
// native navigation container jsdom can't provide. Each Stack.Screen is
// stood in as a marker for which screens Stack.Protected's guard left
// reachable, which is the only thing this round's fix changes.
function MockStack({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
MockStack.Screen = ({ name }: { name: string }) => <div data-testid={`screen-${name}`} />;
MockStack.Protected = ({ guard, children }: { guard: boolean; children: ReactNode }) =>
  guard ? <>{children}</> : null;

vi.mock('expo-router', () => ({ Stack: MockStack }));

let rejectNextGetItem = false;
vi.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map<string, string>();
  return {
    default: {
      getItem: vi.fn(async (key: string) => {
        if (rejectNextGetItem) {
          rejectNextGetItem = false;
          throw new Error('storage read failed');
        }
        return store.get(key) ?? null;
      }),
      setItem: vi.fn(async (key: string, value: string) => {
        store.set(key, value);
      }),
    },
  };
});

let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `test-user-${++nextId}` }));

afterEach(cleanup);

function Onboard({ onDone }: { onDone: (userId: string) => void }) {
  const { user, loading, createUser } = useUser();
  useEffect(() => {
    if (loading || user) return;
    createUser().then((created) => onDone(created.id));
  }, [loading, user, createUser, onDone]);
  return null;
}

function UserIdProbe() {
  const { user } = useUser();
  return <span data-testid="probe-user-id">{user?.id ?? ''}</span>;
}

describe('a transient user-load failure never routes to onboarding', () => {
  it('shows the error with a retry instead of onboarding, and the retry loads the original user', async () => {
    // A real user already exists in storage, as if onboarding had completed
    // on an earlier launch.
    let onboardedId = '';
    render(
      <UserProvider>
        <Onboard onDone={(id) => (onboardedId = id)} />
      </UserProvider>
    );
    await waitFor(() => expect(onboardedId).not.toBe(''));
    cleanup();

    // Relaunch: the stored user's read rejects once, a transient failure.
    rejectNextGetItem = true;
    render(
      <UserProvider>
        <RootNavigator />
        <UserIdProbe />
      </UserProvider>
    );

    await waitFor(() => expect(screen.getByText('Error cargando el usuario')).toBeTruthy());
    expect(screen.queryByTestId('screen-onboarding')).toBeNull();
    expect(screen.queryByTestId('screen-(tabs)')).toBeNull();

    screen.getByText('Reintentar').click();

    await waitFor(() => expect(screen.getByTestId('screen-(tabs)')).toBeTruthy());
    expect(screen.queryByTestId('screen-onboarding')).toBeNull();
    expect(screen.getByTestId('probe-user-id').textContent).toBe(onboardedId);
  });
});
