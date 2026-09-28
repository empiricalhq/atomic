// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider } from '@/contexts/UserContext';
import { useUser } from '@/hooks/useUser';
import ConfigScreen from '../../app/config';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
  ScrollView: ({ children, ...props }: { children?: ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  Text: ({ children, ...props }: { children?: ReactNode }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({
    onPress,
    children,
    ...props
  }: {
    onPress?: () => void;
    children?: ReactNode;
  }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Switch: ({
    value,
    onValueChange,
  }: {
    value: boolean;
    onValueChange: (value: boolean) => void;
  }) => <input type="checkbox" checked={value} onChange={() => onValueChange(!value)} />,
}));

vi.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

const backMock = vi.fn();
vi.mock('expo-router', () => ({ router: { back: () => backMock() } }));

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

vi.mock('expo-crypto', () => ({ randomUUID: () => 'config-test-user' }));

afterEach(cleanup);

function DarkModeProbe() {
  const { user } = useUser();
  return <span data-testid="dark-mode">{String(user?.settings.darkMode ?? false)}</span>;
}

function SettingsProbe() {
  const { user } = useUser();
  return (
    <span data-testid="settings-state">
      {JSON.stringify({
        notifications: user?.settings.notifications ?? null,
        darkMode: user?.settings.darkMode ?? null,
      })}
    </span>
  );
}

const seededUser = {
  id: 'config-test-user',
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

describe('the settings screen', () => {
  it('writes a flipped toggle through updateUser, so it survives a reload of the provider', async () => {
    // A ready user, as if reached from Home's person icon rather than
    // during onboarding, so the toggle has a real user to write through.
    await AsyncStorage.setItem('user', JSON.stringify(seededUser));

    render(
      <UserProvider>
        <ConfigScreen />
      </UserProvider>
    );

    // Notificaciones, Autenticación Biométrica, Modo Oscuro, in that order.
    const darkModeSwitch = (await waitFor(
      () => screen.getAllByRole('checkbox')[2]
    )) as HTMLInputElement;
    expect(darkModeSwitch.checked).toBe(false);

    fireEvent.click(darkModeSwitch);
    await waitFor(() => expect(darkModeSwitch.checked).toBe(true));

    cleanup();
    render(
      <UserProvider>
        <DarkModeProbe />
      </UserProvider>
    );
    await waitFor(() => expect(screen.getByTestId('dark-mode').textContent).toBe('true'));
  });

  it('keeps both changes when two different toggles are flipped before either write resolves', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(seededUser));

    render(
      <UserProvider>
        <ConfigScreen />
      </UserProvider>
    );

    // Notificaciones, Autenticación Biométrica, Modo Oscuro, in that order.
    const [notificationsSwitch, , darkModeSwitch] = (await waitFor(() =>
      screen.getAllByRole('checkbox')
    )) as HTMLInputElement[];
    expect(notificationsSwitch.checked).toBe(true);
    expect(darkModeSwitch.checked).toBe(false);

    // Two taps landing before either updateUser call's write has resolved,
    // each starting from the same render-time settings.
    fireEvent.click(notificationsSwitch);
    fireEvent.click(darkModeSwitch);

    await waitFor(() => expect(notificationsSwitch.checked).toBe(false));
    await waitFor(() => expect(darkModeSwitch.checked).toBe(true));

    cleanup();
    render(
      <UserProvider>
        <SettingsProbe />
      </UserProvider>
    );
    await waitFor(() =>
      expect(screen.getByTestId('settings-state').textContent).toBe(
        JSON.stringify({ notifications: false, darkMode: true })
      )
    );
  });

  it('closes back to the screen that opened it', async () => {
    render(
      <UserProvider>
        <ConfigScreen />
      </UserProvider>
    );

    const closeIcon = await waitFor(() => screen.getByTestId('icon-close'));
    fireEvent.click(closeIcon.closest('button')!);

    expect(backMock).toHaveBeenCalledOnce();
  });
});
