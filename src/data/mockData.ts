import { BudgetCategory } from '@/types';

export const MOCK_BUDGET_CATEGORIES: BudgetCategory[] = [
  { id: '1', name: 'Comida', budgeted: 500, spent: 340, icon: 'restaurant', userId: '1' },
  { id: '2', name: 'Transporte', budgeted: 200, spent: 150, icon: 'car', userId: '1' },
  {
    id: '3',
    name: 'Entretenimiento',
    budgeted: 300,
    spent: 280,
    icon: 'game-controller',
    userId: '1',
  },
  { id: '4', name: 'Compras', budgeted: 400, spent: 420, icon: 'bag', userId: '1' },
];

export const MOCK_MONTHLY_DATA = [
  { month: 'Ene', income: 2400, expenses: 1800 },
  { month: 'Feb', income: 1398, expenses: 2100 },
  { month: 'Mar', income: 9800, expenses: 2900 },
  { month: 'Abr', income: 3908, expenses: 2780 },
  { month: 'May', income: 4800, expenses: 1890 },
  { month: 'Jun', income: 3800, expenses: 2390 },
];

export const MOCK_TOP_CATEGORIES = [
  { name: 'Comida', amount: 1234, icon: 'restaurant' as const },
  { name: 'Transporte', amount: 856, icon: 'car' as const },
  { name: 'Casa', amount: 642, icon: 'home' as const },
  { name: 'Entretenimiento', amount: 420, icon: 'game-controller' as const },
  { name: 'Salud', amount: 380, icon: 'medical' as const },
];
