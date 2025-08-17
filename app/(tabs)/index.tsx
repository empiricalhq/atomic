import { useState } from 'react';
import { View, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';
import { useUser } from '../../hooks/useUser';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatCurrency, formatDate, getCurrentMonth } from '../../utils/dateHelpers';
import { categoryService } from '../../services/CategoryService';
import Screen from '../../components/layout/Screen';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Typography from '../../components/ui/Typography';

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
    <Screen
      variant="scroll"
      background="gray"
      safeArea
      padding="none"
      contentContainerStyle={{ paddingBottom: 120 }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-8 pt-4">
          <View className="mb-8 flex-row items-center justify-between">
            <View className="flex-1">
              <Typography variant="caption" color="muted" className="mb-1">
                {getGreeting()}
              </Typography>
              <Typography variant="h2" weight="bold">
                {user?.name || 'Usuario'}
              </Typography>
            </View>
            <TouchableOpacity
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              onPress={() => router.push('/(tabs)/config')}>
              <Ionicons name="person-outline" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>

          <Card variant="elevated" padding="lg" className="rounded-3xl bg-gray-900">
            <View className="mb-8 items-center">
              <Typography variant="caption" className="mb-2 text-gray-400">
                Balance actual
              </Typography>
              <Typography
                variant="h1"
                weight="normal"
                className="text-4xl tracking-tight text-white">
                {formatCurrency(summary.netAmount)}
              </Typography>
            </View>

            <View className="flex-row">
              <View className="flex-1 items-center">
                <Typography variant="overline" className="mb-1 text-gray-500">
                  Ingresos
                </Typography>
                <Typography variant="body" weight="medium" className="text-lg text-gray-200">
                  {formatCurrency(summary.totalIncome)}
                </Typography>
              </View>
              <View className="mx-6 w-px bg-gray-700" />
              <View className="flex-1 items-center">
                <Typography variant="overline" className="mb-1 text-gray-500">
                  Gastos
                </Typography>
                <Typography variant="body" weight="medium" className="text-lg text-gray-200">
                  {formatCurrency(summary.totalExpenses)}
                </Typography>
              </View>
            </View>
          </Card>
        </View>

        <View className="mb-8 px-6">
          <Typography variant="body" weight="bold" className="mb-4 text-lg">
            Acciones
          </Typography>
          <View className="flex-row justify-between">
            <Card
              variant="elevated"
              padding="lg"
              onPress={() => router.push('/(tabs)/add-expense')}
              className="mr-2 flex-1 items-center rounded-2xl">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Ionicons name="remove" size={20} color="#475569" />
              </View>
              <Typography variant="caption" weight="semibold" color="secondary">
                Gasto
              </Typography>
            </Card>

            <Card
              variant="elevated"
              padding="lg"
              onPress={() => router.push('/(tabs)/add-expense')}
              className="mx-1 flex-1 items-center rounded-2xl">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Ionicons name="add" size={20} color="#475569" />
              </View>
              <Typography variant="caption" weight="semibold" color="secondary">
                Ingreso
              </Typography>
            </Card>

            <Card
              variant="elevated"
              padding="lg"
              onPress={() => router.push('/scanner')}
              className="ml-2 flex-1 items-center rounded-2xl">
              <View className="mb-3 h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                <Ionicons name="camera" size={20} color="#475569" />
              </View>
              <Typography variant="caption" weight="semibold" color="secondary">
                Escanear
              </Typography>
            </Card>
          </View>
        </View>

        <View className="mb-8 px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Typography variant="body" weight="bold" className="text-lg">
              Recientes
            </Typography>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => router.push('/(tabs)/transactions')}>
              <Typography variant="caption" color="muted" className="mr-1">
                Ver todas
              </Typography>
              <Ionicons name="chevron-forward" size={14} color="#94a3b8" />
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <Card variant="elevated" padding="lg" className="items-center rounded-2xl">
              <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Ionicons name="wallet-outline" size={24} color="#94a3b8" />
              </View>
              <Typography variant="body" weight="semibold" className="mb-2 text-lg">
                Sin transacciones
              </Typography>
              <Typography
                variant="body"
                color="secondary"
                className="mb-6 text-center leading-relaxed">
                Comienza agregando tu primera transacción
              </Typography>
              <Button
                variant="primary"
                size="md"
                onPress={() => router.push('/(tabs)/add-expense')}
                className="rounded-xl">
                Agregar
              </Button>
            </Card>
          ) : (
            <Card variant="elevated" padding="none" className="overflow-hidden rounded-2xl">
              {recentTransactions.map((transaction, index) => (
                <TouchableOpacity
                  key={transaction.id}
                  className={`flex-row items-center p-4 ${
                    index !== recentTransactions.length - 1 ? 'border-b border-gray-100' : ''
                  }`}
                  onPress={() => router.push(`/transaction/${transaction.id}`)}>
                  <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
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
                    <Typography
                      variant="body"
                      weight="semibold"
                      className="mb-0.5"
                      numberOfLines={1}>
                      {transaction.description}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {formatDate(new Date(transaction.date))}
                    </Typography>
                  </View>
                  <Typography
                    variant="body"
                    weight="semibold"
                    className={transaction.type === 'expense' ? 'text-gray-600' : 'text-gray-800'}>
                    {transaction.type === 'expense' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </Typography>
                </TouchableOpacity>
              ))}
            </Card>
          )}
        </View>

        {monthTransactions.length > 0 && (
          <View className="px-6">
            <Card variant="elevated" padding="lg" className="rounded-2xl">
              <Typography variant="body" weight="bold" className="mb-6 text-center text-lg">
                {currentMonth.name}
              </Typography>
              <View className="flex-row justify-between">
                <View className="items-center">
                  <Typography variant="h2" weight="bold" className="mb-1">
                    {monthTransactions.length}
                  </Typography>
                  <Typography variant="overline" color="muted">
                    Transacciones
                  </Typography>
                </View>
                <View className="items-center">
                  <Typography variant="h2" weight="bold" className="mb-1">
                    {summary.topCategories.length}
                  </Typography>
                  <Typography variant="overline" color="muted">
                    Categorías
                  </Typography>
                </View>
                <View className="items-center">
                  <Typography variant="h2" weight="bold" className="mb-1">
                    {formatCurrency(
                      Math.round(
                        summary.totalExpenses /
                          (monthTransactions.filter((t) => t.type === 'expense').length || 1)
                      )
                    )}
                  </Typography>
                  <Typography variant="overline" color="muted">
                    Promedio
                  </Typography>
                </View>
              </View>
            </Card>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
