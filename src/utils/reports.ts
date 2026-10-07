import { Transaction } from '@/types';
import { BudgetPeriod } from './budget';
import { sumMoney } from './money';

export const REPORT_MONTHS = 6;

const MONTH_LABELS = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export interface MonthlyTotals {
  month: string;
  income: number;
  expenses: number;
}

export const getReportPeriod = (now: Date = new Date()): BudgetPeriod => ({
  start: new Date(now.getFullYear(), now.getMonth() - (REPORT_MONTHS - 1), 1),
  end: new Date(now.getFullYear(), now.getMonth() + 1, 1),
});

export const filterToPeriod = (transactions: Transaction[], period: BudgetPeriod): Transaction[] =>
  transactions.filter(({ date }) => date >= period.start && date < period.end);

// Include empty months so the chart always has six columns, oldest first.
export const getMonthlyTotals = (
  transactions: Transaction[],
  now: Date = new Date()
): MonthlyTotals[] =>
  Array.from({ length: REPORT_MONTHS }, (_, index) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (REPORT_MONTHS - 1) + index, 1);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
    const inMonth = filterToPeriod(transactions, { start, end });
    const amountsOf = (type: Transaction['type']) =>
      inMonth.filter((t) => t.type === type).map((t) => Math.abs(t.amount));
    return {
      month: MONTH_LABELS[start.getMonth()],
      income: sumMoney(amountsOf('income')),
      expenses: sumMoney(amountsOf('expense')),
    };
  });
