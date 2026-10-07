import { useState, useCallback, useMemo, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { budgetService } from '@/api/budgetService';
import { transactionService } from '@/api/transactionService';
import { BudgetCategory, BudgetCategoryWithSpent, Transaction } from '@/types';
import {
  BudgetPeriod,
  calculateCategorySpent,
  calculateProgress,
  getCurrentMonthPeriod,
  isKnownExpenseCategory,
  isValidBudgetAmount,
} from '@/utils/budget';
import { getCategoryById } from '@/utils/categories';
import { sumMoney } from '@/utils/money';
import { useUser } from './useUser';

export const useBudget = () => {
  const { user, loading: userLoading, error: userError, refreshUser } = useUser();
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [period, setPeriod] = useState<BudgetPeriod>(() => getCurrentMonthPeriod());
  const hasLoadedOnce = useRef(false);

  // A focus-triggered load can overlap a previous one still in flight (a
  // quick blur/refocus, or refreshCategories firing while the focus load
  // hasn't resolved), and the two can resolve out of order. Unlike
  // refreshUser's single shared target, each of these loads may already be
  // stale by the time it resolves and should be discarded rather than
  // joined, so every load gets its own sequence number and only the result
  // matching the latest one is applied.
  const loadSeqRef = useRef(0);

  // Categories and the transactions their spent is derived from are fetched
  // together, under one loading flag, so spent can't render as $0.00 for a
  // moment while transactions are still on the way in behind it.
  const loadDataForUser = useCallback(async (userId: string) => {
    const seq = ++loadSeqRef.current;
    try {
      // Only the first load shows the full-screen spinner; a focus-triggered
      // refresh after that updates the list in place.
      if (!hasLoadedOnce.current) setLoading(true);
      setDataError(null);
      const [userCategories, userTransactions] = await Promise.all([
        budgetService.getBudgetCategories(userId),
        transactionService.getUserTransactions(userId),
      ]);
      if (seq !== loadSeqRef.current) return;
      setCategories(userCategories);
      setTransactions(userTransactions);
    } catch (err) {
      if (seq !== loadSeqRef.current) return;
      console.error('Error loading budget data:', err);
      setDataError('Error cargando presupuesto');
    } finally {
      if (seq === loadSeqRef.current) {
        hasLoadedOnce.current = true;
        setLoading(false);
      }
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!user) {
      // Invalidates any load still in flight for a previous user, so its
      // result can't land after this clears the screen.
      loadSeqRef.current++;
      setCategories([]);
      setTransactions([]);
      return;
    }
    await loadDataForUser(user.id);
  }, [user, loadDataForUser]);

  // A category or transaction added on another tab is invisible here until
  // this screen refetches, and the month can change while the app stays
  // open, so this is the one place both are (re)loaded: on every focus,
  // including the first, rather than a separate mount effect plus this one.
  useFocusEffect(
    useCallback(() => {
      setPeriod(getCurrentMonthPeriod());
      loadData();
    }, [loadData])
  );

  // useFocusEffect only re-runs on a focus/blur transition, not merely
  // because `user` changed while this screen stayed focused, so a failed
  // user load left this screen showing an empty budget forever: retrying
  // it here re-fetches the user and, once it resolves, this screen's own
  // data in the same action, rather than waiting for a focus change that a
  // screen already open may never get.
  const retry = useCallback(async () => {
    if (userError) {
      const refreshedUser = await refreshUser();
      if (refreshedUser) await loadDataForUser(refreshedUser.id);
    } else {
      await loadData();
    }
  }, [userError, refreshUser, loadDataForUser, loadData]);

  const categoriesWithSpent: BudgetCategoryWithSpent[] = useMemo(
    () =>
      categories.map((category) => {
        const spent = calculateCategorySpent(category, transactions, period);
        const categoryInfo = getCategoryById(category.categoryId);
        return {
          ...category,
          name: categoryInfo?.name ?? category.categoryId,
          icon: categoryInfo?.icon ?? 'help-circle',
          spent,
          progress: calculateProgress(spent, category.budgeted),
        };
      }),
    [categories, transactions, period]
  );

  const totalBudgeted = sumMoney(categories.map((category) => category.budgeted));
  const totalSpent = sumMoney(categoriesWithSpent.map((category) => category.spent));

  const addCategory = async (categoryId: string, budget: number) => {
    if (!user) throw new Error(userError ?? 'User not found');
    if (!isValidBudgetAmount(budget)) {
      throw new Error('El presupuesto debe ser mayor a cero');
    }
    if (!isKnownExpenseCategory(categoryId)) {
      throw new Error('Selecciona una categoría válida');
    }
    // budgetService.addBudgetCategory is the sole duplicate check: it reads
    // storage, not this hook's possibly-stale categories state.
    const newCategory = await budgetService.addBudgetCategory({
      categoryId,
      budgeted: budget,
      userId: user.id,
    });
    setCategories((prev) => [...prev, newCategory]);
    return newCategory;
  };

  return {
    categories: categoriesWithSpent,
    totalBudgeted,
    totalSpent,
    // Still counted as loading while useUser resolves the current user, so
    // the empty state can't flash before that first real load starts.
    loading: userLoading || (user !== null && loading),
    error: userError ?? dataError,
    addCategory,
    refreshCategories: retry,
  };
};
