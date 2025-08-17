import { useState, useEffect } from 'react';
import { Transaction } from '@/types';
import { transactionService } from '@/services/TransactionService';
import { useUser } from './useUser';

export const useTransactions = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const userTransactions = await transactionService.getUserTransactions(user.id);
      setTransactions(userTransactions);
    } catch (err) {
      console.error('Error loading transactions:', err);
      setError('Error cargando transacciones');
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) return;

    try {
      const newTransaction = await transactionService.createTransaction({
        ...transactionData,
        userId: user.id,
      });
      setTransactions((prev) => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error('Error adding transaction:', err);
      setError('Error agregando transacción');
      throw err;
    }
  };

  const getTransactionsByMonth = (year: number, month: number) => {
    return transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return transactionDate.getFullYear() === year && transactionDate.getMonth() === month;
    });
  };

  const getSummary = () => {
    return transactionService.getTransactionSummary(transactions);
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    refreshTransactions: loadTransactions,
    getTransactionsByMonth,
    getSummary,
  };
};
