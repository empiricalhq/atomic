import { useState } from 'react';
import { MOCK_BUDGET_CATEGORIES } from '@/data/mockData';
import { BudgetCategory } from '@/types';

export const useBudget = () => {
  const [categories, setCategories] = useState<BudgetCategory[]>(MOCK_BUDGET_CATEGORIES);

  const totalBudgeted = categories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = categories.reduce((sum, cat) => sum + cat.spent, 0);

  const addCategory = (name: string, budget: number) => {
    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name,
      budgeted: budget,
      spent: 0,
      icon: 'receipt',
      userId: '1', // Mock user ID
    };
    setCategories((prev) => [...prev, newCategory]);
  };

  return { categories, totalBudgeted, totalSpent, addCategory };
};
