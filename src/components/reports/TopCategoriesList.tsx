import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/components/common/Card';
import Typography from '@/components/common/Typography';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatters';
import { COLORS } from '@/constants/theme';

interface CategoryData {
  name: string;
  amount: number;
  icon: keyof typeof Ionicons.glyphMap;
}

interface Props {
  categories: CategoryData[];
  totalExpenses: number;
  className?: string;
}

export function TopCategoriesList({ categories, totalExpenses, className }: Props) {
  return (
    <Card variant="bordered" padding="lg" className={cn(className)}>
      <View className="mb-4 flex-row items-center justify-between">
        <Typography variant="h3" weight="bold">
          Categorías Top
        </Typography>
        <TouchableOpacity>
          <Typography variant="caption" weight="medium" color="secondary">
            Ver todas
          </Typography>
        </TouchableOpacity>
      </View>
      {categories.map((category, index) => (
        <View
          key={index}
          className={`flex-row items-center justify-between py-4 ${
            index !== categories.length - 1 ? 'border-b border-gray-100' : ''
          }`}>
          <View className="flex-row items-center">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
              <Ionicons name={category.icon} size={16} color={COLORS.primary.DEFAULT} />
            </View>
            <View>
              <Typography variant="body" weight="medium">
                {category.name}
              </Typography>
              <Typography variant="caption" color="muted">
                {totalExpenses > 0 ? ((category.amount / totalExpenses) * 100).toFixed(0) : 0}% del
                total
              </Typography>
            </View>
          </View>
          <Typography variant="body" weight="semibold" color="secondary">
            {formatCurrency(category.amount)}
          </Typography>
        </View>
      ))}
    </Card>
  );
}
