import { describe, expect, it, vi } from 'vitest';

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

let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `test-user-id-${++nextId}` }));

import { userService } from './userService';
import { storageService } from '@/services/storageService';

describe('userService concurrent writes', () => {
  it('keeps both a settings change and a profile change from two concurrent updates', async () => {
    const user = await userService.createAnonymousUser();

    await Promise.all([
      userService.updateUserSettings(user.id, { darkMode: true }),
      userService.updateUserProfile(user.id, { name: 'Ana' }),
    ]);

    const stored = await storageService.getUser();
    expect(stored?.name).toBe('Ana');
    expect(stored?.settings.darkMode).toBe(true);
  });
});
