import { View, Text, ScrollView, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <TouchableOpacity>
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.incomeCard]}>
            <Text style={styles.summaryLabel}>Ingresos</Text>
            <Text style={styles.summaryAmount}>${totalIncome.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryCard, styles.expenseCard]}>
            <Text style={styles.summaryLabel}>Gastos</Text>
            <Text style={styles.summaryAmount}>${totalExpenses.toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.netAmountCard}>
          <Text style={styles.netAmountLabel}>Balance Neto</Text>
          <Text style={[styles.netAmountValue, netAmount >= 0 ? styles.positive : styles.negative]}>
            ${Math.abs(netAmount).toLocaleString()}
          </Text>
        </View>

        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Resumen Mensual</Text>
          <View style={styles.chart}>
            {monthlyData.map((item, index) => {
              const maxAmount = Math.max(...monthlyData.map((d) => Math.max(d.income, d.expenses)));
              const incomeHeight = (item.income / maxAmount) * 150;
              const expenseHeight = (item.expenses / maxAmount) * 150;

              return (
                <View key={index} style={styles.chartBar}>
                  <View style={styles.barContainer}>
                    <View style={[styles.incomeBar, { height: incomeHeight }]} />
                    <View style={[styles.expenseBar, { height: expenseHeight }]} />
                  </View>
                  <Text style={styles.monthLabel}>{item.month}</Text>
                </View>
              );
            })}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
              <Text style={styles.legendText}>Ingresos</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.legendText}>Gastos</Text>
            </View>
          </View>
        </View>

        <View style={styles.categoriesContainer}>
          <Text style={styles.categoriesTitle}>Categorías Top</Text>
          <View style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: '#FF9500' }]}>
                <Ionicons name="restaurant" size={16} color="white" />
              </View>
              <Text style={styles.categoryName}>Comida</Text>
            </View>
            <Text style={styles.categoryAmount}>$1,234</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: '#007AFF' }]}>
                <Ionicons name="car" size={16} color="white" />
              </View>
              <Text style={styles.categoryName}>Transporte</Text>
            </View>
            <Text style={styles.categoryAmount}>$856</Text>
          </View>
          <View style={styles.categoryItem}>
            <View style={styles.categoryLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: '#5856D6' }]}>
                <Ionicons name="home" size={16} color="white" />
              </View>
              <Text style={styles.categoryName}>Casa</Text>
            </View>
            <Text style={styles.categoryAmount}>$642</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 4,
  },
  incomeCard: {
    backgroundColor: '#34C759',
  },
  expenseCard: {
    backgroundColor: '#FF3B30',
  },
  summaryLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryAmount: {
    color: 'white',
    fontSize: 24,
    fontWeight: '700',
  },
  netAmountCard: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  netAmountLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  netAmountValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  positive: {
    color: '#34C759',
  },
  negative: {
    color: '#FF3B30',
  },
  chartContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 20,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 20,
  },
  chartBar: {
    alignItems: 'center',
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  incomeBar: {
    width: 12,
    backgroundColor: '#34C759',
    borderRadius: 6,
    marginRight: 4,
  },
  expenseBar: {
    width: 12,
    backgroundColor: '#FF3B30',
    borderRadius: 6,
  },
  monthLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  categoryAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
  },
});
