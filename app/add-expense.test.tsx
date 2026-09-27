// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProvider } from '@/contexts/UserContext';
import AddExpenseScreen from './add-expense';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
  ScrollView: ({ children, ...props }: { children?: ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  Text: ({ children, ...props }: { children?: ReactNode }) => <span {...props}>{children}</span>,
  TouchableOpacity: ({
    onPress,
    disabled,
    children,
    ...props
  }: {
    onPress?: () => void;
    disabled?: boolean;
    children?: ReactNode;
  }) => (
    <button onClick={onPress} disabled={disabled} {...props}>
      {children}
    </button>
  ),
  TextInput: ({
    value,
    onChangeText,
    placeholder,
  }: {
    value?: string;
    onChangeText?: (text: string) => void;
    placeholder?: string;
  }) => (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChangeText?.(event.target.value)}
    />
  ),
  ActivityIndicator: () => <div data-testid="activity-indicator" />,
  Modal: ({ visible, children }: { visible?: boolean; children?: ReactNode }) =>
    visible ? <div>{children}</div> : null,
}));

vi.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaView: ({ children, ...props }: { children?: ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

const backMock = vi.fn();
const pushMock = vi.fn();
let currentParams: Record<string, string> = {};
vi.mock('expo-router', () => ({
  router: { back: () => backMock(), push: (...args: unknown[]) => pushMock(...args) },
  useLocalSearchParams: () => currentParams,
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

vi.mock('expo-crypto', () => ({ randomUUID: () => `transaction-${Math.random()}` }));

afterEach(() => {
  cleanup();
  currentParams = {};
  backMock.mockClear();
  pushMock.mockClear();
});

const seededUser = {
  id: 'add-expense-test-user',
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

describe('a second visit to the form', () => {
  it('starts empty even after a successful save on the first visit', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(seededUser));

    const { unmount } = render(
      <UserProvider>
        <AddExpenseScreen />
      </UserProvider>
    );

    const amountInput = await waitFor(() => screen.getByPlaceholderText('0') as HTMLInputElement);
    fireEvent.change(amountInput, { target: { value: '25' } });

    const saveButton = await waitFor(() => screen.getByText('Guardar').closest('button')!);
    fireEvent.click(saveButton);

    await waitFor(() => expect(backMock).toHaveBeenCalledOnce());

    // The screen is a root-level modal that mounts fresh every visit, not a
    // tab that stays mounted: nothing about the saved form carries over.
    unmount();
    render(
      <UserProvider>
        <AddExpenseScreen />
      </UserProvider>
    );

    const secondVisitAmount = await waitFor(
      () => screen.getByPlaceholderText('0') as HTMLInputElement
    );
    expect(secondVisitAmount.value).toBe('');
    expect(screen.queryByPlaceholderText('Agregar descripción...')).toBeNull();
  });
});

describe("an add-income entry's params", () => {
  it('opens the form as income, with an income category, instead of the expense default', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(seededUser));
    currentParams = { type: 'income', amount: '10' };

    render(
      <UserProvider>
        <AddExpenseScreen />
      </UserProvider>
    );

    const incomeToggle = (await waitFor(() =>
      screen.getByText('Ingreso').closest('button')
    )) as HTMLButtonElement;
    expect(incomeToggle.className).toContain('bg-white');

    const expenseToggle = screen.getByText('Gasto').closest('button') as HTMLButtonElement;
    expect(expenseToggle.className).not.toContain('bg-white');

    expect(screen.getByText('Salario')).toBeTruthy();
  });
});

describe("the scanner's prefilled params", () => {
  it('populate the form on the first render', async () => {
    await AsyncStorage.setItem('user', JSON.stringify(seededUser));
    currentParams = {
      amount: '45.67',
      description: 'Starbucks',
      category: 'food',
    };

    render(
      <UserProvider>
        <AddExpenseScreen />
      </UserProvider>
    );

    const amountInput = await waitFor(() => screen.getByPlaceholderText('0') as HTMLInputElement);
    expect(amountInput.value).toBe('45.67');

    const descriptionInput = (await waitFor(() =>
      screen.getByPlaceholderText('Agregar descripción...')
    )) as HTMLInputElement;
    expect(descriptionInput.value).toBe('Starbucks');

    expect(screen.getByText('Comida')).toBeTruthy();
  });
});
