import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReportsScreen() {
  const monthlyData = [
    { month: 'Jan', income: 2400, expenses: 1800 },
    { month: 'Feb', income: 1398, expenses: 2100 },
    { month: 'Mar', income: 9800, expenses: 2900 },
    { month: 'Apr', income: 3908, expenses: 2780 },
    { month: 'May', income: 4800, expenses: 1890 },
    { month: 'Jun', income: 3800, expenses: 2390 },
  ];

  const totalIncome = monthlyData.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = monthlyData.reduce((sum, item) => sum + item.expenses, 0);
  const netAmount = totalIncome - totalExpenses;

  const categories = [
    { name: 'Comida', amount: 1234, icon: 'restaurant', color: '#f97316' },
    { name: 'Transporte', amount: 856, icon: 'car', color: '#3b82f6' },
    { name: 'Casa', amount: 642, icon: 'home', color: '#8b5cf6' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-5 py-4">
        <Text className="text-2xl font-bold text-slate-900">Reportes</Text>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200">
          <Ionicons name="filter" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View className="mb-5 flex-row space-x-3">
          <View className="flex-1 rounded-2xl bg-green-500 p-5">
            <Text className="mb-2 text-sm font-medium text-white opacity-90">Ingresos</Text>
            <Text className="text-2xl font-bold text-white">${totalIncome.toLocaleString()}</Text>
          </View>
          <View className="flex-1 rounded-2xl bg-red-500 p-5">
            <Text className="mb-2 text-sm font-medium text-white opacity-90">Gastos</Text>
            <Text className="text-2xl font-bold text-white">${totalExpenses.toLocaleString()}</Text>
          </View>
        </View>

        {/* Net Amount Card */}
        <View className="mb-5 items-center rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-2 text-base font-medium text-slate-500">Balance Neto</Text>
          <Text
            className={`text-3xl font-bold ${netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${Math.abs(netAmount).toLocaleString()}
          </Text>
        </View>

        {/* Chart Container */}
        <View className="mb-5 rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-5 text-lg font-semibold text-slate-900">Resumen Mensual</Text>

          {/* Chart */}
          <View className="mb-5 flex-row items-end justify-around" style={{ height: 200 }}>
            {monthlyData.map((item, index) => {
              const maxAmount = Math.max(...monthlyData.map((d) => Math.max(d.income, d.expenses)));
              const incomeHeight = (item.income / maxAmount) * 150;
              const expenseHeight = (item.expenses / maxAmount) * 150;

              return (
                <View key={index} className="items-center">
                  <View className="mb-2 flex-row items-end">
                    <View
                      className="mr-1 w-3 rounded-t-md bg-green-500"
                      style={{ height: incomeHeight }}
                    />
                    <View
                      className="w-3 rounded-t-md bg-red-500"
                      style={{ height: expenseHeight }}
                    />
                  </View>
                  <Text className="text-xs text-slate-500">{item.month}</Text>
                </View>
              );
            })}
          </View>

          {/* Legend */}
          <View className="flex-row justify-center space-x-6">
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 rounded-full bg-green-500" />
              <Text className="text-sm text-slate-600">Ingresos</Text>
            </View>
            <View className="flex-row items-center">
              <View className="mr-2 h-3 w-3 rounded-full bg-red-500" />
              <Text className="text-sm text-slate-600">Gastos</Text>
            </View>
          </View>
        </View>

        {/* Top Categories */}
        <View className="rounded-2xl bg-white p-5 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-slate-900">Categorías Top</Text>
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center justify-between py-3 active:bg-slate-50 ${
                index !== categories.length - 1 ? 'border-b border-slate-100' : ''
              }`}>
              <View className="flex-row items-center">
                <View
                  className="mr-3 h-8 w-8 items-center justify-center rounded-lg"
                  style={{ backgroundColor: category.color }}>
                  <Ionicons name={category.icon as any} size={16} color="white" />
                </View>
                <Text className="text-base font-medium text-slate-900">{category.name}</Text>
              </View>
              <Text className="text-base font-semibold text-slate-600">${category.amount}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom padding for tab bar */}
        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
}
