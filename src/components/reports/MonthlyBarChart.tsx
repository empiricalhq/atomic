import { View } from 'react-native';
import Card from '@/components/common/Card';
import Typography from '@/components/common/Typography';
import { cn } from '@/utils/cn';

interface ChartData {
  month: string;
  income: number;
  expenses: number;
}

interface Props {
  data: ChartData[];
  className?: string;
}

export function MonthlyBarChart({ data, className }: Props) {
  const maxAmount = Math.max(...data.map((d) => Math.max(d.income, d.expenses)));

  return (
    <Card variant="bordered" padding="lg" className={cn(className)}>
      <Typography variant="h3" weight="bold" className="mb-5">
        Resumen Mensual
      </Typography>
      <View className="mb-5 flex-row items-end justify-around" style={{ height: 200 }}>
        {data.map((item, index) => {
          const incomeHeight = maxAmount > 0 ? (item.income / maxAmount) * 150 : 0;
          const expenseHeight = maxAmount > 0 ? (item.expenses / maxAmount) * 150 : 0;

          return (
            <View key={index} className="flex-1 items-center px-1">
              <View className="mb-2 h-[150px] flex-row items-end justify-center">
                <View
                  className="mx-0.5 w-4 rounded-t-md bg-gray-800"
                  style={{ height: incomeHeight }}
                />
                <View
                  className="mx-0.5 w-4 rounded-t-md bg-gray-400"
                  style={{ height: expenseHeight }}
                />
              </View>
              <Typography variant="caption" color="muted">
                {item.month}
              </Typography>
            </View>
          );
        })}
      </View>
      <View className="flex-row justify-center space-x-6">
        <View className="flex-row items-center">
          <View className="mr-2 h-3 w-3 rounded-full bg-gray-800" />
          <Typography variant="caption" color="secondary">
            Ingresos
          </Typography>
        </View>
        <View className="flex-row items-center">
          <View className="mr-2 h-3 w-3 rounded-full bg-gray-400" />
          <Typography variant="caption" color="secondary">
            Gastos
          </Typography>
        </View>
      </View>
    </Card>
  );
}
