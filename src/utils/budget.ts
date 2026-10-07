import { BudgetCategory, Transaction } from '@/types';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { sumMoney, toCents } from './money';

export interface BudgetPeriod {
  start: Date;
  end: Date;
}

// Spent tracks the current calendar month, since that is the period a
// monthly budget is meant to measure progress against.
export const getCurrentMonthPeriod = (now: Date = new Date()): BudgetPeriod => {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { start, end };
};

const isWithinPeriod = (date: Date, period: BudgetPeriod): boolean =>
  date >= period.start && date < period.end;

export const calculateCategorySpent = (
  category: Pick<BudgetCategory, 'categoryId'>,
  transactions: Transaction[],
  period: BudgetPeriod
): number => {
  const matching = transactions.filter(
    (transaction) =>
      transaction.type === 'expense' &&
      transaction.category === category.categoryId &&
      isWithinPeriod(transaction.date, period)
  );
  return sumMoney(matching.map((transaction) => Math.abs(transaction.amount)));
};

// A zero or negative budget has no meaningful ratio, so progress is reported
// as fully spent (100) once there is any spending, and 0 otherwise, rather
// than NaN or Infinity from dividing by zero.
export const calculateProgress = (spent: number, budgeted: number): number => {
  if (budgeted <= 0) return spent > 0 ? 100 : 0;
  return Math.min((spent / budgeted) * 100, 100);
};

// Checked in cents, not the raw float: 0.004 is > 0 but rounds to $0.00,
// which would store and display a budget that looks like zero.
export const isValidBudgetAmount = (amount: number): boolean =>
  Number.isFinite(amount) && toCents(amount) > 0;

export const isKnownExpenseCategory = (categoryId: string): boolean =>
  EXPENSE_CATEGORIES.some((category) => category.id === categoryId);
