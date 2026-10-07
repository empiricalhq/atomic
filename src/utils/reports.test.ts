import { describe, expect, it } from 'vitest';
import { Transaction } from '@/types';
import { filterToPeriod, getMonthlyTotals, getReportPeriod } from './reports';

const now = new Date(2026, 9, 15);

const tx = (overrides: Partial<Transaction>): Transaction => ({
  id: 'tx',
  amount: 10,
  description: 'test',
  category: 'food',
  date: new Date(2026, 9, 1),
  type: 'expense',
  userId: '1',
  ...overrides,
});

describe('getReportPeriod', () => {
  it('spans the current month and the five before it', () => {
    const { start, end } = getReportPeriod(now);
    expect(start).toEqual(new Date(2026, 4, 1));
    expect(end).toEqual(new Date(2026, 10, 1));
  });

  it('crosses a year boundary', () => {
    const { start } = getReportPeriod(new Date(2026, 1, 10));
    expect(start).toEqual(new Date(2025, 8, 1));
  });
});

describe('filterToPeriod', () => {
  it('keeps the first instant of the period and drops its end', () => {
    const period = getReportPeriod(now);
    const kept = tx({ id: 'kept', date: period.start });
    const dropped = tx({ id: 'dropped', date: period.end });
    const older = tx({ id: 'older', date: new Date(2026, 3, 30) });
    expect(filterToPeriod([kept, dropped, older], period)).toEqual([kept]);
  });
});

describe('getMonthlyTotals', () => {
  it('returns six months oldest first with Spanish labels, empty months included', () => {
    const totals = getMonthlyTotals([], now);
    expect(totals.map((t) => t.month)).toEqual(['May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct']);
    expect(totals.every((t) => t.income === 0 && t.expenses === 0)).toBe(true);
  });

  it('sums income and expenses per month, exactly', () => {
    const totals = getMonthlyTotals(
      [
        tx({ amount: 0.1, date: new Date(2026, 9, 2) }),
        tx({ amount: 0.2, date: new Date(2026, 9, 20) }),
        tx({ amount: 100, type: 'income', date: new Date(2026, 9, 3) }),
        tx({ amount: 7, date: new Date(2026, 7, 9) }),
      ],
      now
    );
    expect(totals[5]).toEqual({ month: 'Oct', income: 100, expenses: 0.3 });
    expect(totals[3]).toEqual({ month: 'Ago', income: 0, expenses: 7 });
  });
});
