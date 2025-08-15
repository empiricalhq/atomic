export const EXPENSE_CATEGORIES = [
  { id: 'food', name: 'Comida', icon: 'restaurant', color: '#FF9500' },
  { id: 'transport', name: 'Transporte', icon: 'car', color: '#007AFF' },
  { id: 'entertainment', name: 'Entretenimiento', icon: 'game-controller', color: '#5856D6' },
  { id: 'shopping', name: 'Compras', icon: 'bag', color: '#AF52DE' },
  { id: 'health', name: 'Salud', icon: 'medical', color: '#FF3B30' },
  { id: 'home', name: 'Casa', icon: 'home', color: '#34C759' },
  { id: 'education', name: 'Educación', icon: 'library', color: '#FF2D92' },
  { id: 'travel', name: 'Viajes', icon: 'airplane', color: '#00C7BE' },
  { id: 'utilities', name: 'Servicios', icon: 'flash', color: '#FFCC02' },
  { id: 'other', name: 'Otros', icon: 'ellipsis-horizontal', color: '#8E8E93' },
];

export const INCOME_CATEGORIES = [
  { id: 'salary', name: 'Salario', icon: 'card', color: '#34C759' },
  { id: 'freelance', name: 'Freelance', icon: 'briefcase', color: '#007AFF' },
  { id: 'investment', name: 'Inversiones', icon: 'trending-up', color: '#5856D6' },
  { id: 'gift', name: 'Regalos', icon: 'gift', color: '#FF9500' },
  { id: 'other-income', name: 'Otros', icon: 'add-circle', color: '#8E8E93' },
];

class CategoryService {
  getExpenseCategories() {
    return EXPENSE_CATEGORIES;
  }

  getIncomeCategories() {
    return INCOME_CATEGORIES;
  }

  getCategoryById(id: string) {
    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    return allCategories.find((cat) => cat.id === id);
  }

  getCategoryByName(name: string) {
    const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
    return allCategories.find((cat) => cat.name === name);
  }
}

export const categoryService = new CategoryService();
