import { storageService } from '@/services/storageService';
import { BudgetCategory } from '@/types';

class BudgetService {
  async getBudgetCategories(userId: string): Promise<BudgetCategory[]> {
    return await storageService.getBudgetCategories(userId);
  }

  async addBudgetCategory(categoryData: Omit<BudgetCategory, 'id'>): Promise<BudgetCategory> {
    const newCategory: BudgetCategory = {
      ...categoryData,
      id: `budget_${Date.now()}`,
    };
    await storageService.saveBudgetCategory(newCategory);
    return newCategory;
  }
}

export const budgetService = new BudgetService();
