import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useTransactions } from '../../hooks/useTransactions';
import { useUser } from '../../hooks/useUser';
import { Card } from '../../components/ui/Card';
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
  const recentTransactions = transactions.slice(0, 5);

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
    return category?.color || '#8E8E93';
  };

  if (loading) {
    return <LoadingSpinner message="Cargando tus finanzas..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => router.push('/(tabs)/settings')}>
            <LinearGradient colors={['#667eea', '#764ba2']} style={styles.profileGradient}>
              <Ionicons name="person" size={20} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Balance actual</Text>
            <TouchableOpacity>
              <Ionicons name="eye-outline" size={20} color="rgba(255, 255, 255, 0.8)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>{formatCurrency(summary.netAmount)}</Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Ingresos</Text>
              <Text style={styles.balanceItemValue}>{formatCurrency(summary.totalIncome)}</Text>
            </View>
            <View style={styles.balanceItem}>
              <Text style={styles.balanceItemLabel}>Gastos</Text>
              <Text style={styles.balanceItemValue}>{formatCurrency(summary.totalExpenses)}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/add-expense')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#FF3B30' }]}>
                <Ionicons name="remove" size={20} color="white" />
              </View>
              <Text style={styles.quickActionText}>Gasto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/add-expense')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#34C759' }]}>
                <Ionicons name="add" size={20} color="white" />
              </View>
              <Text style={styles.quickActionText}>Ingreso</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickAction} onPress={() => router.push('/scanner')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#007AFF' }]}>
                <Ionicons name="camera" size={20} color="white" />
              </View>
              <Text style={styles.quickActionText}>Escanear</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => router.push('/(tabs)/reports')}>
              <View style={[styles.quickActionIcon, { backgroundColor: '#5856D6' }]}>
                <Ionicons name="analytics" size={20} color="white" />
              </View>
              <Text style={styles.quickActionText}>Reportes</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Recent Transactions */}
        <Card style={styles.transactionsCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transacciones recientes</Text>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/transactions')}
              style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <Ionicons name="chevron-forward" size={16} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {recentTransactions.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="Sin transacciones"
              description="Comienza agregando tu primera transacción"
              actionTitle="Agregar transacción"
              onAction={() => router.push('/(tabs)/add-expense')}
              style={styles.emptyState}
            />
          ) : (
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <TouchableOpacity
                  key={transaction.id}
                  style={styles.transactionItem}
                  onPress={() => router.push(`/transaction/${transaction.id}`)}>
                  <View style={styles.transactionLeft}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: getTransactionColor(transaction) + '20' },
                      ]}>
                      <Ionicons
                        name={getTransactionIcon(transaction) as any}
                        size={20}
                        color={getTransactionColor(transaction)}
                      />
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription} numberOfLines={1}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(new Date(transaction.date))}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text
                      style={[
                        styles.transactionAmount,
                        {
                          color: transaction.type === 'expense' ? '#FF3B30' : '#34C759',
                        },
                      ]}>
                      {transaction.type === 'expense' ? '-' : '+'}
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Card>

        {/* Month Summary */}
        {monthTransactions.length > 0 && (
          <Card style={styles.monthlySummaryCard}>
            <Text style={styles.sectionTitle}>Resumen de {currentMonth.name}</Text>
            <View style={styles.monthlyStats}>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>{monthTransactions.length}</Text>
                <Text style={styles.monthlyStatLabel}>Transacciones</Text>
              </View>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>{summary.topCategories.length}</Text>
                <Text style={styles.monthlyStatLabel}>Categorías</Text>
              </View>
              <View style={styles.monthlyStatItem}>
                <Text style={styles.monthlyStatValue}>
                  {Math.round(
                    summary.totalExpenses /
                      (monthTransactions.filter((t) => t.type === 'expense').length || 1)
                  )}
                </Text>
                <Text style={styles.monthlyStatLabel}>Promedio</Text>
              </View>
            </View>
          </Card>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
  },
  profileGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: 'white',
    marginBottom: 20,
    letterSpacing: -1,
  },
  balanceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
    marginBottom: 4,
  },
  balanceItemValue: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
  },
  quickActionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  transactionsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    paddingVertical: 40,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  transactionRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  monthlySummaryCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  monthlyStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  monthlyStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  monthlyStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  monthlyStatLabel: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 120,
  },
});
