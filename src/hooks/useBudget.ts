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

  // Overlapping loads can resolve out of order. Each gets a sequence number
  // and only the latest result is applied.
  const loadSeqRef = useRef(0);

  // Fetched together under one loading flag, so spent never renders as $0.00
  // while transactions are still on the way.
  const loadDataForUser = useCallback(async (userId: string) => {
    const seq = ++loadSeqRef.current;
    try {
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

  useFocusEffect(
    useCallback(() => {
      setPeriod(getCurrentMonthPeriod());
      loadData();
    }, [loadData])
  );

  // useFocusEffect does not re-run when `user` changes while the screen stays
  // focused, so a retry after a failed user load reloads the data itself.
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
