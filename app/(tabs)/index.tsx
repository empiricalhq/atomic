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
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getCurrentMonth } from '../../utils/dateHelpers';
import { categoryService } from '../../services/CategoryService';
import { STYLES } from '../../constants/design';

export default function HomeScreen() {
  const { user } = useUser();
  const { transactions, loading, refreshTransactions, getSummary, getTransactionsByMonth } =
    useTransactions();

  const [refreshing, setRefreshing] = useState(false);
  const currentMonth = getCurrentMonth();

  const monthTransactions = getTransactionsByMonth(currentMonth.year, currentMonth.month);
  const summary = getSummary();
  const recentTransactions = transactions.slice(0, 3);

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

  if (loading) {
    return <LoadingSpinner message="Cargando..." />;
  }

  return (
    <SafeAreaView className={STYLES.container + ' flex-1'}>
      <ScrollView
        className="flex-1"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="px-6 pb-8 pt-4">
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="mb-1 text-sm text-slate-400">{getGreeting()}</Text>
              <Text className="text-2xl font-bold text-slate-900">{user?.name || 'Usuario'}</Text>
            </View>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-slate-100"
              onPress={() => router.push('/(tabs)/config')}>
              <Ionicons name="person-outline" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View className="rounded-3xl bg-slate-900 p-8">
            <View className="mb-8 items-center">
              <Text className="mb-2 text-sm text-slate-400">Balance actual</Text>
              <Text className="text-4xl font-light tracking-tight text-white">
                {formatCurrency(summary.netAmount)}
              </Text>
            </View>

            <View className="flex-row">
              <View className="flex-1 items-center">
                <Text className="mb-1 text-xs uppercase tracking-wider text-slate-500">
                  Ingresos
                </Text>
                <Text className="text-lg font-medium text-slate-200">
                  {formatCurrency(summary.totalIncome)}
                </Text>
              </View>
              <View className="mx-6 w-px bg-slate-700" />
              <View className="flex-1 items-center">
                <Text className="mb-1 text-xs uppercase tracking-wider text-slate-500">Gastos</Text>
                <Text className="text-lg font-medium text-slate-200">
                  {formatCurrency(summary.totalExpenses)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-8 px-6">
          <Text className="mb-4 text-lg font-bold text-slate-900">Acciones</Text>
          <View className="flex-row justify-between">
            <TouchableOpacity
              className="mr-2 flex-1 items-center rounded-2xl bg-white p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              onPress={() => router.push('/(tabs)/add-expense')}>
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Ionicons name="remove" size={20} color="#475569" />
              </View>
              <Text className="text-sm font-semibold text-slate-700">Gasto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mx-1 flex-1 items-center rounded-2xl bg-white p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              onPress={() => router.push('/(tabs)/add-expense')}>
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Ionicons name="add" size={20} color="#475569" />
              </View>
              <Text className="text-sm font-semibold text-slate-700">Ingreso</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="ml-2 flex-1 items-center rounded-2xl bg-white p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}
              onPress={() => router.push('/scanner')}>
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                <Ionicons name="camera" size={20} color="#475569" />
              </View>
              <Text className="text-sm font-semibold text-slate-700">Escanear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-slate-900">Recientes</Text>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push('/(tabs)/transactions')}>
              <Text className="mr-1 text-sm text-slate-500">Ver todas</Text>
              <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <View
              className="items-center rounded-2xl bg-white p-8"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <Ionicons name="wallet-outline" size={24} color="#94a3b8" />
              </View>
              <Text className="mb-2 text-lg font-semibold text-slate-900">Sin transacciones</Text>
              <Text className="mb-6 text-center leading-relaxed text-slate-500">
                Comienza agregando tu primera transacción
              </Text>
              <TouchableOpacity
                className="rounded-xl bg-slate-800 px-6 py-3"
                onPress={() => router.push('/(tabs)/add-expense')}>
                <Text className="font-semibold text-white">Agregar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              className="overflow-hidden rounded-2xl bg-white"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
              {recentTransactions.map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  className={`flex-row items-center p-4 ${
                    index !== recentTransactions.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                  onPress={() => router.push(`/transaction/${transaction.id}`)}>
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                    <Ionicons
                      name={
                        (categoryService.getCategoryById(transaction.category)?.icon as any) ||
                        'card'
                      }
                      size={16}
                      color="#64748b"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="mb-0.5 font-semibold text-slate-900" numberOfLines={1}>
                      {transaction.description}
                    </Text>
                    <Text className="text-xs text-slate-400">
                      {formatDate(new Date(transaction.date))}
                    </Text>
                  </View>
                  <Text
                    className={`font-semibold ${
                      transaction.type === 'expense' ? 'text-slate-600' : 'text-slate-800'
                    }`}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {monthTransactions.length > 0 && (
          <View className="px-6">
            <View
              className="rounded-2xl bg-white p-6"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              }}>
              <Text className="mb-6 text-center text-lg font-bold text-slate-900">
                {currentMonth.name}
              </Text>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Text className="mb-1 text-2xl font-bold text-slate-900">
                    {monthTransactions.length}
                  </Text>
                  <Text className="text-xs uppercase tracking-wider text-slate-500">
                    Transacciones
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="mb-1 text-2xl font-bold text-slate-900">
                    {summary.topCategories.length}
                  </Text>
                  <Text className="text-xs uppercase tracking-wider text-slate-500">
                    Categorías
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="mb-1 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      Math.round(
                        summary.totalExpenses /
                          (monthTransactions.filter((t) => t.type === 'expense').length || 1)
                      )
                    )}
                  </Text>
                  <Text className="text-xs uppercase tracking-wider text-slate-500">Promedio</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
