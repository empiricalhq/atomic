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

// expo-crypto bridges to a native module that jsdom can't load; budgetService
// only needs its id generation.
let nextId = 0;
vi.mock('expo-crypto', () => ({ randomUUID: () => `test-budget-id-${++nextId}` }));

import { budgetService } from './budgetService';

describe('budgetService storage round trip', () => {
  it('returns a category added through addBudgetCategory on a fresh load', async () => {
    const userId = 'user-round-trip';
    await budgetService.addBudgetCategory({
      categoryId: 'health',
      budgeted: 150,
      userId,
    });

    const categories = await budgetService.getBudgetCategories(userId);
    expect(categories).toHaveLength(1);
    expect(categories[0]).toMatchObject({ categoryId: 'health', budgeted: 150, userId });
  });

  it('only returns categories for the requesting user', async () => {
    const userId = 'user-a';
    const otherUserId = 'user-b';
    await budgetService.addBudgetCategory({ categoryId: 'food', budgeted: 100, userId });
    await budgetService.addBudgetCategory({
      categoryId: 'transport',
      budgeted: 200,
      userId: otherUserId,
    });

    const categories = await budgetService.getBudgetCategories(userId);
    expect(categories.map((category) => category.categoryId)).toEqual(['food']);
  });
});

describe('budgetService storage failures', () => {
  it("rejects addBudgetCategory when a storage read fails, and leaves other users' data intact", async () => {
    const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
    const otherUserId = 'user-read-failure-other';
    await budgetService.addBudgetCategory({
      categoryId: 'transport',
      budgeted: 50,
      userId: otherUserId,
    });

    const workingGetItem = vi.mocked(AsyncStorage.getItem).getMockImplementation()!;
    vi.mocked(AsyncStorage.getItem).mockImplementation(async () => {
      throw new Error('AsyncStorage read failed');
    });

    let addError: unknown;
    try {
      await budgetService.addBudgetCategory({
        categoryId: 'food',
        budgeted: 100,
        userId: 'user-read-failure',
      });
    } catch (err) {
      addError = err;
    } finally {
      vi.mocked(AsyncStorage.getItem).mockImplementation(workingGetItem);
    }

    expect(addError).toBeInstanceOf(Error);

    const otherUserCategories = await budgetService.getBudgetCategories(otherUserId);
    expect(otherUserCategories).toHaveLength(1);
    expect(otherUserCategories[0]).toMatchObject({ categoryId: 'transport', budgeted: 50 });
  });
});

describe('budgetService duplicate rejection', () => {
  it('rejects addBudgetCategory when the category is already stored', async () => {
    const userId = 'user-existing-budget';
    await budgetService.addBudgetCategory({ categoryId: 'food', budgeted: 100, userId });

    await expect(
      budgetService.addBudgetCategory({ categoryId: 'food', budgeted: 200, userId })
    ).rejects.toThrow('Ya existe un presupuesto para esta categoría');

    const categories = await budgetService.getBudgetCategories(userId);
    expect(categories).toHaveLength(1);
  });
});

describe('budgetService concurrent writes', () => {
  it('keeps both categories from two concurrent addBudgetCategory calls for different categories', async () => {
    const userId = 'user-concurrent-different';
    const [food, transport] = await Promise.all([
      budgetService.addBudgetCategory({ categoryId: 'food', budgeted: 100, userId }),
      budgetService.addBudgetCategory({ categoryId: 'transport', budgeted: 50, userId }),
    ]);

    expect(food.id).not.toBe(transport.id);
    const categories = await budgetService.getBudgetCategories(userId);
    expect(categories.map((category) => category.categoryId).toSorted()).toEqual([
      'food',
      'transport',
    ]);
  });

  it('lets exactly one of two concurrent addBudgetCategory calls for the same category succeed', async () => {
    const userId = 'user-concurrent-same';
    const results = await Promise.allSettled([
      budgetService.addBudgetCategory({ categoryId: 'food', budgeted: 100, userId }),
      budgetService.addBudgetCategory({ categoryId: 'food', budgeted: 200, userId }),
    ]);

    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter((result) => result.status === 'rejected');
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect((rejected[0] as PromiseRejectedResult).reason.message).toBe(
      'Ya existe un presupuesto para esta categoría'
    );

    const categories = await budgetService.getBudgetCategories(userId);
    expect(categories).toHaveLength(1);
  });
});
