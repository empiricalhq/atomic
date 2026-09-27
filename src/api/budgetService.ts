import * as Crypto from 'expo-crypto';
import { storageService } from '@/services/storageService';
import { BudgetCategory } from '@/types';

class BudgetService {
  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    return await storageService.getBudgetCategories(userId);
  }

  // The duplicate check runs inside storageService's per-key queue, on the
  // list it reads there, not a snapshot this method captured earlier: two
  // concurrent calls for the same category would otherwise both read the
  // same starting list, both pass the check, and one add would overwrite
  // the other on write.
  async addBudgetCategory(categoryData: Omit<BudgetCategory, 'id'>): Promise<BudgetCategory> {
    return storageService.addBudgetCategory((categories) => {
      const existing = categories.filter((category) => category.userId === categoryData.userId);
      if (existing.some((category) => category.categoryId === categoryData.categoryId)) {
        throw new Error('Ya existe un presupuesto para esta categoría');
      }
      // Crypto.randomUUID(), not Date.now(): avoids two categories added
      // within the same millisecond colliding on id.
      return { ...categoryData, id: `budget_${Crypto.randomUUID()}` };
    });
  }
}

export const budgetService = new BudgetService();
