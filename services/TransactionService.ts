import { Transaction } from '../types';
import { storageService } from './StorageService';

class TransactionService {
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    return await storageService.getTransactions(userId);
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    await storageService.saveTransaction(newTransaction);
    return newTransaction;
  }

  async getTransactionsByCategory(userId: string, category: string): Promise<Transaction[]> {
    const transactions = await this.getUserTransactions(userId);
    return transactions.filter((t) => t.category === category);
  }

  async getTransactionsByDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const transactions = await this.getUserTransactions(userId);
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  async getMonthlyTransactions(
    userId: string,
    year: number,
    month: number
  ): Promise<Transaction[]> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);
    return await this.getTransactionsByDateRange(userId, startDate, endDate);
  }

  async deleteTransaction(transactionId: string): Promise<void> {
    // Implementation would remove from AsyncStorage
    console.log('Delete transaction:', transactionId);
  }

  async updateTransaction(transactionId: string, updates: Partial<Transaction>): Promise<void> {
    // Implementation would update in AsyncStorage
    console.log('Update transaction:', transactionId, updates);
  }

  getTransactionSummary(transactions: Transaction[]) {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netAmount = totalIncome - totalExpenses;

    const categoryTotals = transactions.reduce(
      (acc, transaction) => {
        const category = transaction.category;
        if (!acc[category]) {
          acc[category] = { total: 0, count: 0 };
        }
        acc[category].total += Math.abs(transaction.amount);
        acc[category].count += 1;
        return acc;
      },
      {} as Record<string, { total: number; count: number }>
    );

    const topCategories = Object.entries(categoryTotals)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
      }));

    return {
      totalIncome,
      totalExpenses,
      netAmount,
      totalTransactions: transactions.length,
      topCategories,
    };
  }
}

export const transactionService = new TransactionService();
