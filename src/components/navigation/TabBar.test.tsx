// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { TabBar } from './TabBar';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
  TouchableOpacity: ({
    onPress,
    onLongPress,
    testID,
    children,
    ...props
  }: {
    onPress?: () => void;
    onLongPress?: () => void;
    testID?: string;
    children?: ReactNode;
  }) => (
    <button onClick={onPress} onContextMenu={onLongPress} data-testid={testID} {...props}>
      {children}
    </button>
  ),
}));

vi.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

const pushMock = vi.fn();
vi.mock('expo-router', () => ({ router: { push: (...args: unknown[]) => pushMock(...args) } }));

afterEach(() => {
  cleanup();
  pushMock.mockClear();
});

function makeProps(focusedIndex: number) {
  const navigateMock = vi.fn();
  const emitMock = vi.fn(() => ({ defaultPrevented: false }));
  const routes = [
    { key: 'index-key', name: 'index', params: undefined },
    { key: 'budget-key', name: 'budget', params: undefined },
    { key: 'reports-key', name: 'reports', params: undefined },
  ];
  const descriptors = Object.fromEntries(
    routes.map((route) => [
      route.key,
      {
        options: {
          tabBarAccessibilityLabel: route.name,
          tabBarIcon: () => null,
        },
      },
    ])
  );
  const props = {
    state: { index: focusedIndex, routes },
    descriptors,
    navigation: { navigate: navigateMock, emit: emitMock },
    insets: { top: 0, bottom: 0, left: 0, right: 0 },
  } as unknown as BottomTabBarProps;
  return { props, navigateMock, emitMock };
}

describe('the tab bar renders the three route buttons with a "+" slot between budget and reports', () => {
  it('keeps every button in its own slot, in the original left-to-right order', () => {
    const { props } = makeProps(0);
    render(<TabBar {...props} />);

    const buttons = screen.getAllByTestId(/^tab-button-/);
    expect(buttons.map((button) => button.getAttribute('data-testid'))).toEqual([
      'tab-button-index',
      'tab-button-budget',
      'tab-button-add-expense',
      'tab-button-reports',
    ]);
  });

  it('leaves Presupuesto pressable: tapping it emits tabPress and navigates to budget', () => {
    const { props, navigateMock, emitMock } = makeProps(0);
    render(<TabBar {...props} />);

    fireEvent.click(screen.getByTestId('tab-button-budget'));

    expect(emitMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ type: 'tabPress', target: 'budget-key' })
    );
    expect(navigateMock).toHaveBeenCalledExactlyOnceWith('budget', undefined);
  });

  it('pushes /add-expense from the "+" slot without touching the tab navigation state', () => {
    const { props, navigateMock, emitMock } = makeProps(0);
    render(<TabBar {...props} />);

    fireEvent.click(screen.getByTestId('tab-button-add-expense'));

    expect(pushMock).toHaveBeenCalledExactlyOnceWith('/add-expense');
    expect(navigateMock).not.toHaveBeenCalled();
    expect(emitMock).not.toHaveBeenCalled();
  });

  it('emits tabLongPress, like the default bar, when a route button is long-pressed', () => {
    const { props, emitMock } = makeProps(0);
    render(<TabBar {...props} />);

    fireEvent.contextMenu(screen.getByTestId('tab-button-budget'));

    expect(emitMock).toHaveBeenCalledExactlyOnceWith({
      type: 'tabLongPress',
      target: 'budget-key',
    });
  });
});
