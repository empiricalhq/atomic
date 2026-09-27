// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({
  View: ({ children, ...props }: { children?: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  TouchableOpacity: ({ children, ...props }: { children?: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// @expo/vector-icons re-exports every icon set from its index, and several
// of them fail to resolve their build output outside React Native's own
// bundler; only the Ionicons name this layout actually uses is needed here.
vi.mock('@expo/vector-icons', () => ({
  Ionicons: (props: Record<string, unknown>) => <div data-testid="icon" {...props} />,
}));

function MockTabs({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
MockTabs.Screen = ({ name }: { name: string }) => <div data-testid={`tab-${name}`} />;

vi.mock('expo-router/js-tabs', () => ({ Tabs: MockTabs }));

import TabLayout from './_layout';

describe('the tab bar no longer includes settings', () => {
  it('renders a config tab screen nowhere in the tab layout', () => {
    render(<TabLayout />);
    expect(screen.queryByTestId('tab-config')).toBeNull();
  });
});
