import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Transaction } from '@/types';
import { transactionService } from '@/api/transactionService';
import { useUser } from '@/hooks/useUser';

export interface TransactionsContextValue {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (data: Omit<Transaction, 'id' | 'userId'>) => Promise<Transaction>;
  refreshTransactions: () => Promise<void>;
  getSummary: () => ReturnType<typeof transactionService.getTransactionSummary>;
}

export const TransactionsContext = createContext<TransactionsContextValue | null>(null);

// This context owns the current user's transaction list. Screens share it, so
// a transaction added in the add-expense modal appears without a reload.
export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useUser();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // A manual retry can overlap the effect's load, and the requests can resolve
  // out of order. Apply only the result with the latest sequence number.
  const loadSeqRef = useRef(0);
  // True while the latest load is running. A load that read storage before a
  // write can resolve after it, so addTransaction reloads when this is set.
  const loadingNowRef = useRef(false);
  // The user whose list is on screen, and whose list last loaded. Only the
  // first load for a user shows the loading state; later reloads keep the list.
  const listUserIdRef = useRef<string | null>(null);
  const loadedUserIdRef = useRef<string | null>(null);

  const loadTransactions = useCallback(async () => {
    const seq = ++loadSeqRef.current;
    listUserIdRef.current = user?.id ?? null;
    if (!user) {
      loadedUserIdRef.current = null;
      loadingNowRef.current = false;
      setTransactions([]);
      setLoading(false);
      return;
    }
    try {
      loadingNowRef.current = true;
      if (loadedUserIdRef.current !== user.id) setLoading(true);
      setError(null);
      const userTransactions = await transactionService.getUserTransactions(user.id);
      if (seq !== loadSeqRef.current) return;
      loadedUserIdRef.current = user.id;
      setTransactions(userTransactions);
    } catch (err) {
      if (seq !== loadSeqRef.current) return;
      console.error('Error loading transactions:', err);
      setError('Error cargando transacciones');
    } finally {
      if (seq === loadSeqRef.current) {
        loadingNowRef.current = false;
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = useCallback(
    async (transactionData: Omit<Transaction, 'id' | 'userId'>) => {
      if (!user) throw new Error('User not found');
      try {
        const newTransaction = await transactionService.createTransaction({
          ...transactionData,
          userId: user.id,
        });
        // The user can change while the write is pending; that list is not ours.
        if (listUserIdRef.current === user.id) {
          // A load that finished after the write may already include it.
          setTransactions((prev) =>
            prev.some((t) => t.id === newTransaction.id) ? prev : [newTransaction, ...prev]
          );
          if (loadingNowRef.current) loadTransactions();
        }
        return newTransaction;
      } catch (err) {
        console.error('Error adding transaction:', err);
        setError('Error agregando transacción');
        throw err;
      }
    },
    [user, loadTransactions]
  );

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      loading,
      error,
      addTransaction,
      refreshTransactions: loadTransactions,
      getSummary: () => transactionService.getTransactionSummary(transactions),
    }),
    [transactions, loading, error, addTransaction, loadTransactions]
  );

  return <TransactionsContext.Provider value={value}>{children}</TransactionsContext.Provider>;
}
