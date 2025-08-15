import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';
import { useUser } from '../../hooks/useUser';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getCurrentMonth } from '../../utils/dateHelpers';
import { categoryService } from '../../services/CategoryService';
import { Transaction } from '../../types';

export default function HomeScreen() {
  const { user } = useUser();
  const { transactions, loading, refreshTransactions, getSummary, getTransactionsByMonth } =
    useTransactions();

  const [refreshing, setRefreshing] = useState(false);
  const currentMonth = getCurrentMonth();

  const monthTransactions = getTransactionsByMonth(currentMonth.year, currentMonth.month);
  const summary = getSummary();
  const recentTransactions = transactions.slice(0, 4); // Reduced to 4 for cleaner look

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshTransactions();
    setRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getTransactionIcon = (transaction: Transaction) => {
    const category = categoryService.getCategoryById(transaction.category);
    return category?.icon || 'card';
  };

  const getTransactionColor = (transaction: Transaction) => {
    const category = categoryService.getCategoryById(transaction.category);
    return category?.color || '#64748b';
  };

  if (loading) {
    return <LoadingSpinner message="Cargando..." />;
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header */}
        <View className="bg-white px-6 py-8">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-sm font-medium text-slate-500">{getGreeting()}</Text>
              <Text className="text-2xl font-bold text-slate-900">{user?.name || 'Usuario'}</Text>
            </View>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
              onPress={() => router.push('/(tabs)/settings')}>
              <Ionicons name="person-outline" size={18} color="#475569" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <View className="px-6 pb-6">
          <View className="rounded-3xl bg-slate-900 p-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="font-medium text-slate-400">Balance actual</Text>
              <TouchableOpacity className="h-8 w-8 items-center justify-center">
                <Ionicons name="eye-outline" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text className="mb-8 text-4xl font-light tracking-tight text-white">
              {formatCurrency(summary.netAmount)}
            </Text>

            <View className="flex-row">
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-slate-500">Ingresos</Text>
                <Text className="text-lg font-semibold text-slate-200">
                  {formatCurrency(summary.totalIncome)}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-sm font-medium text-slate-500">Gastos</Text>
                <Text className="text-lg font-semibold text-slate-200">
                  {formatCurrency(summary.totalExpenses)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="mb-6 px-6">
          <View className="rounded-2xl bg-white p-6">
            <Text className="mb-4 text-lg font-semibold text-slate-900">Acciones rápidas</Text>
            <View className="flex-row justify-between">
              <TouchableOpacity
                className="flex-1 items-center active:opacity-70"
                onPress={() => router.push('/(tabs)/add-expense')}>
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-red-50">
                  <Ionicons name="remove" size={18} color="#dc2626" />
                </View>
                <Text className="text-sm font-semibold text-slate-700">Gasto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center active:opacity-70"
                onPress={() => router.push('/(tabs)/add-expense')}>
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                  <Ionicons name="add" size={18} color="#16a34a" />
                </View>
                <Text className="text-sm font-semibold text-slate-700">Ingreso</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center active:opacity-70"
                onPress={() => router.push('/scanner')}>
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                  <Ionicons name="camera" size={18} color="#2563eb" />
                </View>
                <Text className="text-sm font-semibold text-slate-700">Escanear</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 items-center active:opacity-70"
                onPress={() => router.push('/(tabs)/reports')}>
                <View className="mb-2 h-12 w-12 items-center justify-center rounded-2xl bg-purple-50">
                  <Ionicons name="bar-chart" size={18} color="#7c3aed" />
                </View>
                <Text className="text-sm font-semibold text-slate-700">Reportes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View className="mb-6 px-6">
          <View className="rounded-2xl bg-white p-6">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-900">Transacciones recientes</Text>
              <TouchableOpacity
                className="flex-row items-center active:opacity-70"
                onPress={() => router.push('/(tabs)/transactions')}>
                <Text className="mr-1 text-sm font-medium text-slate-600">Ver todas</Text>
                <Ionicons name="chevron-forward" size={14} color="#64748b" />
              </TouchableOpacity>
            </View>

            {recentTransactions.length === 0 ? (
              <View className="items-center py-12">
                <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <Ionicons name="wallet-outline" size={24} color="#64748b" />
                </View>
                <Text className="mb-2 text-lg font-semibold text-slate-900">Sin transacciones</Text>
                <Text className="mb-6 text-center leading-relaxed text-slate-500">
                  Comienza agregando tu primera transacción
                </Text>
                <TouchableOpacity
                  className="rounded-xl bg-slate-900 px-6 py-3 active:bg-slate-800"
                  onPress={() => router.push('/(tabs)/add-expense')}>
                  <Text className="font-semibold text-white">Agregar transacción</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-1">
                {recentTransactions.map((transaction, index) => (
                  <TouchableOpacity
                    key={transaction.id}
                    className="flex-row items-center rounded-xl px-2 py-3 active:bg-slate-50"
                    onPress={() => router.push(`/transaction/${transaction.id}`)}>
                    <View
                      className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: getTransactionColor(transaction) + '15' }}>
                      <Ionicons
                        name={getTransactionIcon(transaction) as any}
                        size={16}
                        color={getTransactionColor(transaction)}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="mb-0.5 font-semibold text-slate-900" numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text className="text-sm text-slate-500">
                        {formatDate(new Date(transaction.date))}
                      </Text>
                    </View>
                    <Text
                      className={`font-semibold ${
                        transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'
                      }`}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Month Summary */}
        {monthTransactions.length > 0 && (
          <View className="mb-6 px-6">
            <View className="rounded-2xl bg-white p-6">
              <Text className="mb-4 text-lg font-semibold text-slate-900">
                Resumen de {currentMonth.name}
              </Text>
              <View className="flex-row">
                <View className="flex-1 items-center">
                  <Text className="mb-1 text-2xl font-bold text-slate-900">
                    {monthTransactions.length}
                  </Text>
                  <Text className="text-sm font-medium text-slate-500">Transacciones</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="mb-1 text-2xl font-bold text-slate-900">
                    {summary.topCategories.length}
                  </Text>
                  <Text className="text-sm font-medium text-slate-500">Categorías</Text>
                </View>
                <View className="flex-1 items-center">
                  <Text className="mb-1 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      Math.round(
                        summary.totalExpenses /
                          (monthTransactions.filter((t) => t.type === 'expense').length || 1)
                      )
                    )}
                  </Text>
                  <Text className="text-sm font-medium text-slate-500">Promedio</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
