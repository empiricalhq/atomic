import { View } from 'react-native';
import Card from '@/components/common/Card';
import Typography from '@/components/common/Typography';
import { cn } from '@/utils/cn';

interface Props {
  budgeted: number;
  spent: number;
  remaining: number;
  className?: string;
}

export function BudgetSummaryCard({ budgeted, spent, remaining, className }: Props) {
  return (
    <Card variant="bordered" padding="lg" className={cn(className)}>
      <Typography variant="h3" weight="bold" className="mb-4">
        Resumen del Mes
      </Typography>
      <View className="flex-row justify-between">
        <View className="items-center">
          <Typography variant="caption" color="secondary" className="mb-1">
            Presupuestado
          </Typography>
          <Typography variant="h3" weight="bold">
            ${budgeted.toFixed(2)}
          </Typography>
        </View>
        <View className="items-center">
          <Typography variant="caption" color="secondary" className="mb-1">
            Gastado
          </Typography>
          <Typography variant="h3" weight="bold">
            ${spent.toFixed(2)}
          </Typography>
        </View>
        <View className="items-center">
          <Typography variant="caption" color="secondary" className="mb-1">
            Restante
          </Typography>
          <Typography
            variant="h3"
            weight="bold"
            className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
            ${Math.abs(remaining).toFixed(2)}
          </Typography>
        </View>
      </View>
    </Card>
  );
}
