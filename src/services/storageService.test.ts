import { describe, expect, it, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

import { storageService } from './storageService';

describe('stored dates', () => {
  it('read back as Date objects for the user and for transactions', async () => {
    const createdAt = new Date('2026-03-04T10:00:00.000Z');
    const date = new Date('2026-05-06T12:30:00.000Z');
    await storageService.saveUser({
      id: 'u1',
      name: 'Ana',
      isAnonymous: true,
      createdAt,
      settings: {
        notifications: true,
        biometric: false,
        darkMode: false,
        currency: 'USD',
        language: 'es',
      },
    });
    await storageService.saveTransaction({
      id: 't1',
      amount: 5,
      description: 'coffee',
      category: 'food',
      date,
      type: 'expense',
      userId: 'u1',
    });

    const user = await storageService.getUser();
    const [transaction] = await storageService.getTransactions('u1');

    expect(user?.createdAt).toEqual(createdAt);
    expect(user?.createdAt).toBeInstanceOf(Date);
    expect(transaction.date).toEqual(date);
    expect(transaction.date).toBeInstanceOf(Date);
  });

  it('hands updateUser the revived user and keeps text that looks like a date a string', async () => {
    await AsyncStorage.setItem(
      'user',
      JSON.stringify({
        id: 'u2',
        name: '2026-01-01T00:00:00.000Z',
        isAnonymous: true,
        createdAt: '2026-01-02T00:00:00.000Z',
        settings: {},
      })
    );

    let seen: unknown;
    await storageService.updateUser((user) => {
      seen = user?.createdAt;
      return user;
    });
    const user = await storageService.getUser();

    expect(seen).toBeInstanceOf(Date);
    expect(user?.name).toBe('2026-01-01T00:00:00.000Z');
  });
});
