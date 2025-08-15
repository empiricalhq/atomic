import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DESIGN } from '../../constants/design';

export default function ReportsScreen() {
  const monthlyData = [
    { month: 'Ene', income: 2400, expenses: 1800 },
    { month: 'Feb', income: 1398, expenses: 2100 },
    { month: 'Mar', income: 9800, expenses: 2900 },
    { month: 'Abr', income: 3908, expenses: 2780 },
    { month: 'May', income: 4800, expenses: 1890 },
    { month: 'Jun', income: 3800, expenses: 2390 },
  ];

  const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
  const netAmount = totalIncome - totalExpenses;

  const categories = [
    { name: 'Comida', amount: 1234, icon: 'restaurant' },
    { name: 'Transporte', amount: 856, icon: 'car' },
    { name: 'Casa', amount: 642, icon: 'home' },
    { name: 'Entretenimiento', amount: 420, icon: 'game-controller' },
    { name: 'Salud', amount: 380, icon: 'medical' },
  ];

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <Text className="text-2xl font-bold text-slate-900">Reportes</Text>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200">
          <Ionicons name="filter" size={22} color={DESIGN.colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-5">
          <View className="mb-5 flex-row justify-between">
            <View className="mr-2 flex-1 rounded-2xl border border-slate-200 bg-white p-5">
              <View className="flex-row items-center">
                <Ionicons
                  name="trending-up"
                  size={18}
                  color={DESIGN.colors.primary[600]}
                  className="mr-2"
                />
                <Text className="text-sm font-medium text-slate-600">Ingresos</Text>
              </View>
              <Text className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalIncome)}
              </Text>
            </View>
            <View className="ml-2 flex-1 rounded-2xl border border-slate-200 bg-white p-5">
              <View className="flex-row items-center">
                <Ionicons
                  name="trending-down"
                  size={18}
                  color={DESIGN.colors.primary[600]}
                  className="mr-2"
                />
                <Text className="text-sm font-medium text-slate-600">Gastos</Text>
              </View>
              <Text className="mt-2 text-2xl font-bold text-slate-900">
                {formatCurrency(totalExpenses)}
              </Text>
            </View>
          </View>

          <View className="mb-5 items-center rounded-2xl border border-slate-200 bg-white p-6">
            <Text className="mb-2 text-base font-medium text-slate-500">Balance Neto</Text>
            <Text
              className={`text-3xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(Math.abs(netAmount))}
            </Text>
          </View>

          <View className="mb-5 rounded-2xl border border-slate-200 bg-white p-5">
            <Text className="mb-5 text-lg font-semibold text-slate-900">Resumen Mensual</Text>

            <View className="mb-5 flex-row items-end justify-around" style={{ height: 200 }}>
              {monthlyData.map((item, index) => {
                const maxAmount = Math.max(
                  ...monthlyData.map((d) => Math.max(d.income, d.expenses))
                );
                const incomeHeight = (item.income / maxAmount) * 150;
                const expenseHeight = (item.expenses / maxAmount) * 150;

                return (
                  <View key={index} className="flex-1 items-center px-1">
                    <View className="mb-2 h-[150px] flex-row items-end justify-center">
                      <View
                        className="mx-0.5 w-4 rounded-t-md bg-slate-800"
                        style={{ height: incomeHeight }}
                      />
                      <View
                        className="mx-0.5 w-4 rounded-t-md bg-slate-400"
                        style={{ height: expenseHeight }}
                      />
                    </View>
                    <Text className="text-xs text-slate-500">{item.month}</Text>
                  </View>
                );
              })}
            </View>

            <View className="flex-row justify-center space-x-6">
              <View className="flex-row items-center">
                <View className="mr-2 h-3 w-3 rounded-full bg-slate-800" />
                <Text className="text-sm text-slate-600">Ingresos</Text>
              </View>
              <View className="flex-row items-center">
                <View className="mr-2 h-3 w-3 rounded-full bg-slate-400" />
                <Text className="text-sm text-slate-600">Gastos</Text>
              </View>
            </View>
          </View>

          <View className="rounded-2xl border border-slate-200 bg-white p-5">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Categorías Top</Text>
              <TouchableOpacity>
                <Text className="text-sm font-medium text-slate-600">Ver todas</Text>
              </TouchableOpacity>
            </View>

            {categories.map((category, index) => (
              <View
                key={index}
                className={`flex-row items-center justify-between py-4 ${
                  index !== categories.length - 1 ? 'border-b border-slate-100' : ''
                }`}>
                <View className="flex-row items-center">
                  <View className="mr-3 h-8 w-8 items-center justify-center rounded-lg bg-slate-100">
                    <Ionicons
                      name={category.icon as any}
                      size={16}
                      color={DESIGN.colors.primary[600]}
                    />
                  </View>
                  <View>
                    <Text className="text-base font-medium text-slate-900">{category.name}</Text>
                    <Text className="text-xs text-slate-500">
                      {((category.amount / totalExpenses) * 100).toFixed(0)}% del total
                    </Text>
                  </View>
                </View>
                <Text className="text-base font-semibold text-slate-600">
                  {formatCurrency(category.amount)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
