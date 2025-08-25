import { useState, useEffect } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTransactions } from '@/hooks/useTransactions';
import Screen from '@/components/layout/Screen';
import { AddTransactionForm } from '@/components/transactions/AddTransactionForm';
import { CategoryPickerModal } from '@/components/transactions/CategoryPickerModal';
import { Transaction } from '@/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/categories';

export default function AddExpenseScreen() {
  const params = useLocalSearchParams();
  const { addTransaction } = useTransactions();

  const [formState, setFormState] = useState({
    amount: (params.amount as string) || '',
    description: (params.description as string) || '',
    type: 'expense' as 'expense' | 'income',
    category: (params.category as string) || EXPENSE_CATEGORIES[0].id,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const categories = formState.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCategory = categories.find((cat) => cat.id === formState.category);

  useEffect(() => {
    // If parsed receipt data is available, update the form state
    if (params.receiptData) {
      try {
        const receipt = JSON.parse(params.receiptData as string);
        setFormState((prev) => ({
          ...prev,
          amount: receipt.amount?.toString() || prev.amount,
          description: receipt.merchant || prev.description,
          category: receipt.category || prev.category,
        }));
      } catch (error) {
        console.error('Error parsing receipt data:', error);
      }
    }
  }, [params.receiptData]);

  const handleSave = async () => {
    const numAmount = parseFloat(formState.amount);
    if (!numAmount || numAmount <= 0) return;

    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Screen background="white" safeArea padding="none">
      <View className="flex-row items-center justify-between px-6 py-4 pt-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full"
          activeOpacity={0.7}>
          <Ionicons name="close" size={24} color="#6b7280" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/scanner')}
          className="h-10 w-10 items-center justify-center rounded-full"
          activeOpacity={0.7}>
          <Ionicons name="scan-outline" size={24} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <AddTransactionForm
        formState={formState}
        setFormState={setFormState}
        onSave={handleSave}
        isLoading={isLoading}
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
