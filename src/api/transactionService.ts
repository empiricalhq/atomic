import * as Crypto from 'expo-crypto';
import { Transaction } from '@/types';
import { storageService } from '@/services/storageService';
import { subtractMoney, sumMoney } from '@/utils/money';

class TransactionService {
  async getUserTransactions(userId: string): Promise<Transaction[]> {
    const transactions = await storageService.getTransactions(userId);
    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async createTransaction(transaction: Omit<Transaction, 'id'>): Promise<Transaction> {
    const newTransaction: Transaction = {
      ...transaction,
      id: Crypto.randomUUID(),
    };
    await storageService.saveTransaction(newTransaction);
    return newTransaction;
  }

  getTransactionSummary(transactions: Transaction[]) {
    const totalIncome = sumMoney(
      transactions.filter((t) => t.type === 'income').map((t) => t.amount)
    );

    const totalExpenses = sumMoney(
      transactions.filter((t) => t.type === 'expense').map((t) => Math.abs(t.amount))
    );

    const netAmount = subtractMoney(totalIncome, totalExpenses);

    const amountsByCategory = transactions
      .filter((t) => t.type === 'expense')
      .reduce(
        (acc, transaction) => {
          const { category, amount } = transaction;
          acc[category] = [...(acc[category] ?? []), Math.abs(amount)];
          return acc;
        },
        {} as Record<string, number[]>
      );
    const categoryTotals = Object.fromEntries(
      Object.entries(amountsByCategory).map(([category, amounts]) => [category, sumMoney(amounts)])
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
