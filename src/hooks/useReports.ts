import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { transactionService } from '@/api/transactionService';
import { Category } from '@/types';
import { getCategoryById } from '@/utils/categories';
import { filterToPeriod, getMonthlyTotals, getReportPeriod } from '@/utils/reports';
import { useTransactions } from './useTransactions';

export interface TopCategory {
  name: string;
  amount: number;
  icon: Category['icon'];
}

export const useReports = () => {
  const { transactions, loading, error, refreshTransactions } = useTransactions();
  const [now, setNow] = useState(() => new Date());

  // Recompute the window on focus because the calendar month can change while
  // the app stays open.
  useFocusEffect(
    useCallback(() => {
      setNow(new Date());
    }, [])
  );

  const report = useMemo(() => {
    const inPeriod = filterToPeriod(transactions, getReportPeriod(now));
    const { totalIncome, totalExpenses, netAmount, topCategories } =
      transactionService.getTransactionSummary(inPeriod);
    return {
      totalIncome,
      totalExpenses,
      netAmount,
      monthly: getMonthlyTotals(inPeriod, now),
      topCategories: topCategories.map(({ category, total }): TopCategory => {
        const info = getCategoryById(category);
        return { name: info?.name ?? category, amount: total, icon: info?.icon ?? 'help-circle' };
      }),
    };
  }, [transactions, now]);

  return { ...report, loading, error, refresh: refreshTransactions };
};
