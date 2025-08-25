import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/constants/categories';

const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function getCategoryById(id: string) {
  return allCategories.find((cat) => cat.id === id);
}

export function getCategoryByName(name: string) {
  return allCategories.find((cat) => cat.name === name);
}
