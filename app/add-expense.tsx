import { useState, useRef } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import Screen from '@/components/layout/Screen';
import { AddTransactionForm } from '@/components/transactions/AddTransactionForm';
import { CategoryPickerModal } from '@/components/transactions/CategoryPickerModal';
import { Transaction } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/categories';

function resolveType(value: unknown): 'expense' | 'income' {
  return value === 'income' ? 'income' : 'expense';
}

export default function AddExpenseScreen() {
  const params = useLocalSearchParams();
  const { addTransaction } = useTransactions();

  const [formState, setFormState] = useState(() => {
    const type = resolveType(params.type);
    const defaultCategory = type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0];
    return { amount: '', description: '', type, category: defaultCategory.id };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Set before the first await, so a second tap fired before the re-render
  // that disables Guardar still sees this and bails out synchronously,
  // instead of calling addTransaction a second time.
  const isSavingRef = useRef(false);

  const categories = formState.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCategory = categories.find((cat) => cat.id === formState.category);

  const handleSave = async () => {
    const numAmount = parseFloat(formState.amount);
    if (!numAmount || numAmount <= 0) return;
    if (isSavingRef.current) return;
    isSavingRef.current = true;

    setIsLoading(true);
    setSaveError(null);
    try {
      const transactionData: Omit<Transaction, 'id' | 'userId'> = {
        amount: numAmount,
        description:
          formState.description ||
          `${formState.type === 'expense' ? 'Gasto' : 'Ingreso'} en ${selectedCategory?.name}`,
        category: formState.category,
        type: formState.type,
        date: new Date(),
      };
      await addTransaction(transactionData);
      router.back();
    } catch (error) {
      console.error('Error saving transaction:', error);
      // A failed save must not look like a saved transaction: stay on the
      // form and say so, instead of navigating back as if it went through.
      setSaveError('No se pudo guardar la transacción. Intenta de nuevo.');
    } finally {
      isSavingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <Screen background="white" safeArea padding="none">
      <View className="flex-row items-center px-6 py-4 pt-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <AddTransactionForm
        formState={formState}
        setFormState={setFormState}
        onSave={handleSave}
        isLoading={isLoading}
        error={saveError}
        onShowCategories={() => setShowCategories(true)}
      />

      <CategoryPickerModal
        visible={showCategories}
        onClose={() => setShowCategories(false)}
        categories={categories}
        selectedCategory={formState.category}
        onSelectCategory={(categoryId) => {
          setFormState((prev) => ({ ...prev, category: categoryId }));
          setShowCategories(false);
        }}
      />
    </Screen>
  );
}
