import * as Crypto from 'expo-crypto';
import { storageService } from '@/services/storageService';
import { BudgetCategory } from '@/types';

class BudgetService {
  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    return await storageService.getBudgetCategories(userId);
  }

  async addBudgetCategory(categoryData: Omit<BudgetCategory, 'id'>): Promise<BudgetCategory> {
    return storageService.addBudgetCategory((categories) => {
      const existing = categories.filter((category) => category.userId === categoryData.userId);
      if (existing.some((category) => category.categoryId === categoryData.categoryId)) {
        throw new Error('Ya existe un presupuesto para esta categoría');
      }
      return { ...categoryData, id: `budget_${Crypto.randomUUID()}` };
    });
  }
}

export const budgetService = new BudgetService();
