import { useState, useEffect } from 'react';
import { View, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/services/CategoryService';
import { Transaction } from '@/types';
import Screen from '@/components/layout/Screen';
import Typography from '@/components/ui/Typography';

type TransactionType = 'expense' | 'income';

export default function AddExpenseScreen() {
  const params = useLocalSearchParams();
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState((params.amount as string) || '');
  const [description, setDescription] = useState((params.description as string) || '');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState((params.category as string) || '');
  const [isLoading, setIsLoading] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCategory = categories.find((cat) => cat.id === category) || categories[0];

  useEffect(() => {
    if (!category || !categories.find((cat) => cat.id === category)) {
      setCategory(categories[0].id);
    }
  }, [type, categories, category]);

  useEffect(() => {
    if (params.receiptData) {
      try {
        const receiptData = JSON.parse(params.receiptData as string);
        setDescription(receiptData.merchant || '');
        setAmount(receiptData.amount?.toString() || '');
      } catch (error) {
        console.error('Error parsing receipt data:', error);
      }
    }
  }, [params.receiptData]);

  const handleAmountChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2) {
      return;
    }
    if (parts[1] && parts[1].length > 2) {
      return;
    }
    setAmount(cleanText);
  };

  const handleSave = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) return;

    setIsLoading(true);
    try {
      const transactionData: Omit<Transaction, 'id' | 'userId'> = {
        amount: numAmount,
        description:
          description || `${type === 'expense' ? 'Gasto' : 'Ingreso'} en ${selectedCategory.name}`,
        category: selectedCategory.id,
        type,
        date: new Date(),
      };

      await addTransaction(transactionData);
      setAmount('');
      setDescription('');
      router.back();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasAmount = amount && parseFloat(amount) > 0;

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

      <View className="flex-1 px-6">
        <View className="flex-1 items-center justify-center" style={{ marginTop: -60 }}>
          {/* Type Toggle Buttons */}
          <View className="mb-16 flex-row rounded-full bg-gray-50 p-1">
            <TouchableOpacity
              className={`rounded-full px-6 py-3 ${type === 'expense' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              onPress={() => {
                setType('expense');
                const newCategories = EXPENSE_CATEGORIES;
                if (!newCategories.find((cat) => cat.id === category)) {
                  setCategory(newCategories[0].id);
                }
              }}
              activeOpacity={0.8}>
              <Typography
                variant="body"
                weight="medium"
                className={`${type === 'expense' ? 'text-gray-900' : 'text-gray-500'}`}>
                Gasto
              </Typography>
            </TouchableOpacity>
            <TouchableOpacity
              className={`rounded-full px-6 py-3 ${type === 'income' ? 'bg-white shadow-sm' : 'bg-transparent'}`}
              onPress={() => {
                setType('income');
                // Reset category when switching types to prevent navigation errors
                const newCategories = INCOME_CATEGORIES;
                if (!newCategories.find((cat) => cat.id === category)) {
                  setCategory(newCategories[0].id);
                }
              }}
              activeOpacity={0.8}>
              <Typography
                variant="body"
                weight="medium"
                className={`${type === 'income' ? 'text-gray-900' : 'text-gray-500'}`}>
                Ingreso
              </Typography>
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-center">
            <Typography
              variant="h1"
              color="muted"
              className="mr-2"
              style={{ fontSize: 56, lineHeight: 56, fontWeight: '300' }}>
              S/.
            </Typography>
            <TextInput
              value={amount}
              onChangeText={handleAmountChange}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#d1d5db"
              autoFocus
              className="text-gray-900"
              style={{
                fontSize: 56,
                fontWeight: '300',
              }}
            />
          </View>

          {hasAmount && (
            <View className="mb-8 w-full max-w-xs">
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Agregar descripción..."
                placeholderTextColor="#9ca3af"
                className="border-b border-gray-200 py-3 text-center text-base text-gray-600"
                style={{ backgroundColor: 'transparent' }}
              />
            </View>
          )}

          {hasAmount && (
            <TouchableOpacity
              className="mb-8 rounded-full bg-gray-50 px-6 py-4"
              onPress={() => setShowCategories(true)}
              activeOpacity={0.8}>
              <View className="flex-row items-center">
                <Typography variant="body" className="mr-2 text-gray-700">
                  {selectedCategory.name}
                </Typography>
                <Ionicons name="chevron-down" size={16} color="#9ca3af" />
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View className="pb-8">
          <TouchableOpacity
            onPress={handleSave}
            disabled={!hasAmount || isLoading}
            className={`w-full items-center justify-center rounded-2xl py-4 ${
              !hasAmount || isLoading ? 'bg-gray-100' : 'bg-gray-900'
            }`}
            activeOpacity={0.8}>
            <Typography
              variant="body"
              weight="semibold"
              className={`${!hasAmount || isLoading ? 'text-gray-400' : 'text-white'}`}>
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Typography>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showCategories} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center justify-between border-b border-gray-100 px-6 py-4">
            <TouchableOpacity onPress={() => setShowCategories(false)}>
              <Typography variant="body" className="text-gray-500">
                Cancelar
              </Typography>
            </TouchableOpacity>
            <Typography variant="body" weight="semibold" className="text-gray-900">
              Categoría
            </Typography>
            <View className="w-16" />
          </View>

          <View className="flex-1 px-6">
            <View className="py-2">
              {categories.map((cat, index) => (
                <TouchableOpacity
                  key={cat.id}
                  className="flex-row items-center justify-between px-2 py-4"
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategories(false);
                  }}
                  activeOpacity={0.7}>
                  <Typography
                    variant="body"
                    className={`text-gray-700 ${cat.id === category ? 'font-medium' : ''}`}>
                    {cat.name}
                  </Typography>
                  {cat.id === category && (
                    <View className="h-5 w-5 items-center justify-center rounded-full bg-gray-900">
                      <Ionicons name="checkmark" size={12} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
