import { describe, expect, it } from 'vitest';
import { Transaction } from '@/types';
import {
  calculateCategorySpent,
  calculateProgress,
  getCurrentMonthPeriod,
  isKnownExpenseCategory,
  isValidBudgetAmount,
} from './budget';

const period = { start: new Date(2026, 8, 1), end: new Date(2026, 9, 1) };

const expense = (overrides: Partial<Transaction>): Transaction => ({
  id: overrides.id ?? 'tx',
  amount: overrides.amount ?? 10,
  description: 'test',
  category: overrides.category ?? 'food',
  date: overrides.date ?? new Date(2026, 8, 15),
  type: overrides.type ?? 'expense',
  userId: '1',
});

describe('calculateCategorySpent', () => {
  it('sums this category expense transactions in the period, exactly', () => {
    const category = { categoryId: 'food' };
    const transactions = [
      expense({ id: '1', category: 'food', amount: 0.1 }),
      expense({ id: '2', category: 'food', amount: 0.2 }),
    ];
    expect(calculateCategorySpent(category, transactions, period)).toBe(0.3);
  });

  it('matches by categoryId, not by name', () => {
    const category = { categoryId: 'food' };
    const transactions = [expense({ category: 'food', amount: 25 })];
    expect(calculateCategorySpent(category, transactions, period)).toBe(25);
  });

  it('ignores income transactions', () => {
    const category = { categoryId: 'food' };
    const transactions = [expense({ category: 'food', type: 'income', amount: 100 })];
    expect(calculateCategorySpent(category, transactions, period)).toBe(0);
  });

  it('ignores transactions from other categories', () => {
    const category = { categoryId: 'food' };
    const transactions = [expense({ category: 'transport', amount: 100 })];
    expect(calculateCategorySpent(category, transactions, period)).toBe(0);
  });

  it('ignores transactions outside the period', () => {
    const category = { categoryId: 'food' };
    const transactions = [expense({ category: 'food', amount: 100, date: new Date(2026, 7, 15) })];
    expect(calculateCategorySpent(category, transactions, period)).toBe(0);
  });
});

describe('calculateProgress', () => {
  it('caps progress at 100', () => {
    expect(calculateProgress(150, 100)).toBe(100);
  });

  it('computes a normal ratio', () => {
    expect(calculateProgress(25, 100)).toBe(25);
  });

  it('is finite for a zero budget with spending', () => {
    const progress = calculateProgress(10, 0);
    expect(Number.isFinite(progress)).toBe(true);
    expect(progress).toBe(100);
  });

  it('is finite for a zero budget with no spending', () => {
    const progress = calculateProgress(0, 0);
    expect(Number.isFinite(progress)).toBe(true);
    expect(progress).toBe(0);
  });
});

describe('isValidBudgetAmount', () => {
  it('rejects zero and negative amounts', () => {
    expect(isValidBudgetAmount(0)).toBe(false);
    expect(isValidBudgetAmount(-5)).toBe(false);
  });

  it('accepts a positive amount', () => {
    expect(isValidBudgetAmount(500)).toBe(true);
  });

  it('rejects an amount that rounds to zero cents', () => {
    expect(isValidBudgetAmount(0.004)).toBe(false);
  });
});

describe('isKnownExpenseCategory', () => {
  it('accepts a category id from EXPENSE_CATEGORIES', () => {
    expect(isKnownExpenseCategory('food')).toBe(true);
  });

  it('rejects an id that is not an expense category', () => {
    expect(isKnownExpenseCategory('not-a-real-category')).toBe(false);
  });

  it('rejects an income category id', () => {
    expect(isKnownExpenseCategory('salary')).toBe(false);
  });
});

describe('getCurrentMonthPeriod', () => {
  it('spans from the first of the month to the first of the next month', () => {
    const { start, end } = getCurrentMonthPeriod(new Date(2026, 8, 15));
    expect(start).toEqual(new Date(2026, 8, 1));
    expect(end).toEqual(new Date(2026, 9, 1));
  });
});
