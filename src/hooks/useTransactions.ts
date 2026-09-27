import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Transaction } from '@/types';
import { transactionService } from '@/api/transactionService';
import { useUser } from './useUser';

export const useTransactions = () => {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // refreshTransactions can be called (e.g. a manual retry) while the
  // effect's own load for the same or a different user is still in flight,
  // and the two can resolve out of order. Each load gets a sequence number
  // so only the result matching the latest one is applied.
  const loadSeqRef = useRef(0);

  const loadTransactions = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    if (!user) {
      setTransactions([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const userTransactions = await transactionService.getUserTransactions(user.id);
      if (seq !== loadSeqRef.current) return;
      setTransactions(userTransactions);
    } catch (err) {
      if (seq !== loadSeqRef.current) return;
      console.error('Error loading transactions:', err);
      setError('Error cargando transacciones');
    } finally {
      if (seq === loadSeqRef.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) throw new Error('User not found');
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

  const getSummary = useMemo(() => {
    return () => transactionService.getTransactionSummary(transactions);
  }, [transactions]);

  return {
    transactions,
    loading,
    error,
    addTransaction,
    refreshTransactions: loadTransactions,
    getSummary,
  };
};
