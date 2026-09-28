// @vitest-environment jsdom
import { type ReactNode } from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ScannerScreen from '../../app/scanner';

vi.mock('react-native', () => {
  class FakeAnimatedValue {
    interpolate() {
      return 0;
    }
  }
  return {
    View: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
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
    ActivityIndicator: () => <div data-testid="activity-indicator" />,
    Dimensions: { get: () => ({ width: 400, height: 800 }) },
    Animated: {
      Value: FakeAnimatedValue,
      loop: () => ({ start: () => {} }),
      sequence: () => ({}),
      timing: () => ({}),
      View: ({ children, ...props }: { children?: ReactNode }) => <div {...props}>{children}</div>,
    },
  };
});

vi.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children, ...props }: { children?: ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}));

vi.mock('expo-camera', () => ({
  Camera: { requestCameraPermissionsAsync: vi.fn(async () => ({ status: 'granted' })) },
  CameraView: () => <div data-testid="camera-view" />,
}));

vi.mock('expo-image-picker', () => ({ launchImageLibraryAsync: vi.fn() }));

vi.mock('@expo/vector-icons', () => ({
  Ionicons: ({ name }: { name: string }) => <div data-testid={`icon-${name}`} />,
}));

const backMock = vi.fn();
const pushMock = vi.fn();
const replaceMock = vi.fn();
const dismissToMock = vi.fn();
vi.mock('expo-router', () => ({
  router: {
    back: () => backMock(),
    push: (...args: unknown[]) => pushMock(...args),
    replace: (...args: unknown[]) => replaceMock(...args),
    dismissTo: (...args: unknown[]) => dismissToMock(...args),
  },
}));

afterEach(() => {
  cleanup();
  backMock.mockClear();
  pushMock.mockClear();
  replaceMock.mockClear();
  dismissToMock.mockClear();
});

describe('finishing a scan', () => {
  it('dismisses to the existing add-expense screen with the scanned params, instead of pushing or replacing to a new one', async () => {
    render(<ScannerScreen />);

    const captureButton = (await waitFor(() =>
      screen.getByTestId('icon-camera').closest('button')
    )) as HTMLButtonElement;
    fireEvent.click(captureButton);

    await waitFor(() => expect(dismissToMock).toHaveBeenCalledOnce(), { timeout: 5000 });

    expect(dismissToMock).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({
        pathname: '/add-expense',
        params: expect.objectContaining({ description: 'Starbucks' }),
      })
    );
    expect(pushMock).not.toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/add-expense' })
    );
    expect(replaceMock).not.toHaveBeenCalled();
  }, 8000);
});

describe('creating a transaction manually from the scanner', () => {
  it('dismisses to the existing add-expense screen instead of pushing a second one', async () => {
    render(<ScannerScreen />);

    const createButton = (await waitFor(() =>
      screen.getByTestId('icon-create').closest('button')
    )) as HTMLButtonElement;
    fireEvent.click(createButton);

    expect(dismissToMock).toHaveBeenCalledExactlyOnceWith('/add-expense');
    expect(pushMock).not.toHaveBeenCalledWith('/add-expense');
  });
});
