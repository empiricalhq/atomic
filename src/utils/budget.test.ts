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
  const category = { categoryId: 'food' };

  it('sums this category expense transactions in the period, exactly', () => {
    const transactions = [
      expense({ id: '1', amount: 0.1 }),
      expense({ id: '2', amount: 0.2 }),
      expense({ id: '3', amount: 25, category: 'transport' }),
    ];
    expect(calculateCategorySpent(category, transactions, period)).toBe(0.3);
  });

  it.each([
    ['income transactions', { type: 'income' as const }],
    ['other categories', { category: 'transport' }],
    ['transactions outside the period', { date: new Date(2026, 7, 15) }],
  ])('ignores %s', (_label, overrides) => {
    const transactions = [expense({ amount: 100, ...overrides })];
    expect(calculateCategorySpent(category, transactions, period)).toBe(0);
  });
});

describe('calculateProgress', () => {
  it.each([
    [150, 100, 100],
    [25, 100, 25],
    [10, 0, 100],
    [0, 0, 0],
  ])('spent %d of budget %d is %d%%', (spent, budgeted, progress) => {
    expect(calculateProgress(spent, budgeted)).toBe(progress);
  });
});

describe('isValidBudgetAmount', () => {
  it.each([
    [500, true],
    [0, false],
    [-5, false],
    [0.004, false],
  ])('%d is %s', (amount, valid) => {
    expect(isValidBudgetAmount(amount)).toBe(valid);
  });
});

describe('isKnownExpenseCategory', () => {
  it.each([
    ['food', true],
    ['not-a-real-category', false],
    ['salary', false],
  ])('%s is %s', (id, known) => {
    expect(isKnownExpenseCategory(id)).toBe(known);
  });
});

describe('getCurrentMonthPeriod', () => {
  it('spans from the first of the month to the first of the next month', () => {
    const { start, end } = getCurrentMonthPeriod(new Date(2026, 8, 15));
    expect(start).toEqual(new Date(2026, 8, 1));
    expect(end).toEqual(new Date(2026, 9, 1));
  });
});
