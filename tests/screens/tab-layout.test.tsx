// @vitest-environment jsdom
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// @expo/vector-icons re-exports every icon set from its index, and several
// of them fail to resolve their build output outside React Native's own
// bundler; TabBarIcon (rendered per Tabs.Screen's options) needs Ionicons
// stubbed even though this layout doesn't reference it directly.
vi.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

vi.mock('react-native', () => ({
  View: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  TouchableOpacity: ({
    onPress,
    children,
    ...props
  }: {
    onPress?: () => void;
    children?: React.ReactNode;
  }) => (
    <button onClick={onPress} {...props}>
      {children}
    </button>
  ),
}));

// The real TabBar (rendered here as `_layout`'s `tabBar` prop, unmocked
// itself since its own behavior is covered by TabBar.test.tsx) imports the
// real `expo-router`, which pulls in Flow-typed React Native internals
// jsdom/esbuild can't parse; only its `router` export is needed here.
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));

function MockTabs({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
MockTabs.Screen = ({ name }: { name: string }) => <div data-testid={`tab-${name}`} />;

vi.mock('expo-router/js-tabs', () => ({ Tabs: MockTabs }));

import TabLayout from '../../app/(tabs)/_layout';

afterEach(cleanup);

describe('the tab bar no longer includes settings', () => {
  it('renders a config tab screen nowhere in the tab layout', () => {
    render(<TabLayout />);
    expect(screen.queryByTestId('tab-config')).toBeNull();
  });
});

describe('the tab bar holds only the three real destinations', () => {
  it('declares exactly index, budget, and reports as tabs', () => {
    render(<TabLayout />);
    const tabs = screen.getAllByTestId(/^tab-/);
    expect(tabs.map((tab) => tab.getAttribute('data-testid'))).toEqual([
      'tab-index',
      'tab-budget',
      'tab-reports',
    ]);
  });
});

// The "+" button no longer lives in this layout: it is a slot inside the
// custom tabBar (src/components/navigation/TabBar.tsx, see TabBar.test.tsx),
// so pressing it is covered there instead of here.
