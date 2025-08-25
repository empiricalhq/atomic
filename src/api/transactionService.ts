import { Transaction } from '@/types';
import { storageService } from '@/services/storageService';

class TransactionService {
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await storageService.getTransactions(userId);
    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
    await storageService.saveTransaction(newTransaction);
    return newTransaction;
  }

  getTransactionSummary(transactions: Transaction[]) {
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netAmount = totalIncome - totalExpenses;

    const categoryTotals = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, transaction) => {
          const { category, amount } = transaction;
          acc[category] = (acc[category] || 0) + Math.abs(amount);
          return acc;
        },
        {} as Record<string, number>
      );

    const topCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category, total]) => ({ category, total }));

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
