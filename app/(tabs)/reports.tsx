import { View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_MONTHLY_DATA, MOCK_TOP_CATEGORIES } from '@/data/mockData';
import { formatCurrency } from '@/utils/formatters';
import Screen from '@/components/layout/Screen';
import Header from '@/components/layout/Header';
import Typography from '@/components/common/Typography';
import { MonthlyBarChart } from '@/components/reports/MonthlyBarChart';
import { TopCategoriesList } from '@/components/reports/TopCategoriesList';
import Card from '@/components/common/Card';

export default function ReportsScreen() {
  const totalIncome = MOCK_MONTHLY_DATA.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = MOCK_MONTHLY_DATA.reduce((sum, item) => sum + item.expenses, 0);
  const netAmount = totalIncome - totalExpenses;

  return (
    <Screen background="gray" padding="none">
      <Header
        title="Reportes"
        rightAction={{ icon: 'filter', onPress: () => {} }}
        variant="elevated"
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <View className="mb-5 flex-row justify-between">
          <Card variant="bordered" padding="lg" className="mr-2 flex-1">
            <View className="flex-row items-center">
              <Ionicons name="trending-up" size={18} color="#16a34a" className="mr-2" />
              <Typography variant="caption" color="secondary">
                Ingresos
              </Typography>
            </View>
            <Typography variant="h3" weight="bold" className="mt-2">
              {formatCurrency(totalIncome)}
            </Typography>
          </Card>
          <Card variant="bordered" padding="lg" className="ml-2 flex-1">
            <View className="flex-row items-center">
              <Ionicons name="trending-down" size={18} color="#dc2626" className="mr-2" />
              <Typography variant="caption" color="secondary">
                Gastos
              </Typography>
            </View>
            <Typography variant="h3" weight="bold" className="mt-2">
              {formatCurrency(totalExpenses)}
            </Typography>
          </Card>
        </View>

        <Card variant="bordered" padding="lg" className="mb-5 items-center">
          <Typography variant="body" color="secondary" className="mb-2">
            Balance Neto
          </Typography>
          <Typography
            variant="h2"
            weight="bold"
            className={netAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
            {formatCurrency(Math.abs(netAmount))}
          </Typography>
        </Card>

        <MonthlyBarChart data={MOCK_MONTHLY_DATA} className="mb-5" />

        <TopCategoriesList categories={MOCK_TOP_CATEGORIES} totalExpenses={totalExpenses} />
        <View className="h-24" />
      </ScrollView>
    </Screen>
  );
}
