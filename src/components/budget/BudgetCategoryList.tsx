import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BudgetCategory } from '@/types';
import { COLORS } from '@/constants/theme';
import Typography from '@/components/common/Typography';

interface Props {
  categories: BudgetCategory[];
}

export function BudgetCategoryList({ categories }: Props) {
  return (
    <View>
      {categories.map((category) => {
        const progress = Math.min((category.spent / category.budgeted) * 100, 100);
        const isOverBudget = category.spent > category.budgeted;
        const remaining = category.budgeted - category.spent;

        return (
          <View key={category.id} className="mb-4 rounded-2xl border border-gray-200 bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
                  <Ionicons name={category.icon as any} size={20} color={COLORS.primary.DEFAULT} />
                </View>
                <Typography variant="body" weight="semibold">
                  {category.name}
                </Typography>
              </View>
              <Typography
                variant="body"
                weight="semibold"
                color={isOverBudget ? 'error' : 'secondary'}>
                ${category.spent.toFixed(2)}
              </Typography>
            </View>
            <View className="mb-3">
              <View className="mb-1 flex-row justify-between">
                <Typography variant="caption" color="secondary">
                  {isOverBudget ? 'Excedido: ' : 'Disponible: '}
                  <Typography weight="semibold" color={isOverBudget ? 'error' : 'primary'}>
                    ${Math.abs(remaining).toFixed(2)}
                  </Typography>
                </Typography>
                <Typography variant="caption" weight="semibold" color="secondary">
                  {progress.toFixed(0)}%
                </Typography>
              </View>
              <View className="h-2 w-full rounded-full bg-gray-100">
                <View
                  className="h-2 rounded-full"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: isOverBudget ? COLORS.error.DEFAULT : COLORS.primary.DEFAULT,
                  }}
                />
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}
