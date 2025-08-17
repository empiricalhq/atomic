import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTransactions } from '@/hooks/useTransactions';
import { categoryService, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/services/CategoryService';
import { Transaction } from '@/types';

type TransactionType = 'expense' | 'income';

export default function AddExpenseScreen() {
  const params = useLocalSearchParams();
  const { addTransaction } = useTransactions();

  const [amount, setAmount] = useState((params.amount as string) || '0');
  const [description, setDescription] = useState((params.description as string) || '');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState((params.category as string) || '');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showNotesInput, setShowNotesInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCategory = categories.find((cat) => cat.id === category) || categories[0];

  useEffect(() => {
    if (params.receiptData) {
      try {
        const receiptData = JSON.parse(params.receiptData as string);
        setDescription(receiptData.merchant || '');
        setAmount(receiptData.amount?.toString() || '0');
      } catch (error) {
        console.error('Error parsing receipt data:', error);
      }
    }
  }, [params.receiptData]);

  const handleNumberPress = (num: string) => {
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else if (amount.includes('.') && num === '.') {
      return;
    } else if (amount.includes('.') && amount.split('.')[1].length >= 2) {
      return;
    } else {
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleSave = async () => {
    if (parseFloat(amount) <= 0) return;

    setIsLoading(true);
    try {
      const transactionData: Omit<Transaction, 'id' | 'userId'> = {
        amount: parseFloat(amount),
        description:
          description || `${type === 'expense' ? 'Gasto' : 'Ingreso'} en ${selectedCategory.name}`,
        category: selectedCategory.id,
        type,
        date: date,
      };

      await addTransaction(transactionData);
      setAmount('0');
      setDescription('');
      setNotes('');
      router.back();
    } catch (error) {
      console.error('Error saving transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateString = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <TouchableOpacity
          className="-ml-2 h-10 w-10 items-center justify-center active:opacity-70"
          onPress={() => router.back()}>
          <Ionicons name="close" size={22} color="#475569" />
        </TouchableOpacity>
        <Text className="text-lg font-semibold text-slate-900">Nueva transacción</Text>
        <TouchableOpacity
          className="-mr-2 h-10 w-10 items-center justify-center active:opacity-70"
          onPress={() => router.push('/scanner')}>
          <Ionicons name="camera-outline" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="space-y-6 px-6 py-6">
          {/* Transaction Type Selector */}
          <View className="rounded-2xl bg-white p-4">
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center rounded-xl border-2 px-4 py-4 ${
                  type === 'expense' ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
                }`}
                onPress={() => {
                  setType('expense');
                  setCategory('');
                }}>
                <Ionicons
                  name="remove-circle-outline"
                  size={20}
                  color={type === 'expense' ? '#dc2626' : '#64748b'}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    type === 'expense' ? 'text-red-700' : 'text-slate-600'
                  }`}>
                  Gasto
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 flex-row items-center justify-center rounded-xl border-2 px-4 py-4 ${
                  type === 'income'
                    ? 'border-green-200 bg-green-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
                onPress={() => {
                  setType('income');
                  setCategory('');
                }}>
                <Ionicons
                  name="add-circle-outline"
                  size={20}
                  color={type === 'income' ? '#16a34a' : '#64748b'}
                />
                <Text
                  className={`ml-2 font-semibold ${
                    type === 'income' ? 'text-green-700' : 'text-slate-600'
                  }`}>
                  Ingreso
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Amount Display */}
          <View className="rounded-2xl bg-white py-8">
            <View className="flex-row items-baseline justify-center">
              <Text className="mr-2 text-3xl font-light text-slate-400">$</Text>
              <Text
                className={`text-5xl font-light tracking-tight ${
                  type === 'expense' ? 'text-red-600' : 'text-green-600'
                }`}>
                {amount}
              </Text>
            </View>
          </View>

          {/* Details */}
          <View className="space-y-4 rounded-2xl bg-white p-6">
            {/* Description Input */}
            <View>
              <Text className="mb-3 text-sm font-semibold text-slate-700">Descripción</Text>
              <TextInput
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
                value={description}
                onChangeText={setDescription}
                placeholder={`¿En qué ${type === 'expense' ? 'gastaste' : 'obtuviste este ingreso'}?`}
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Category Selection */}
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 active:bg-slate-100"
              onPress={() => setShowCategories(true)}>
              <View className="flex-1 flex-row items-center">
                <View
                  className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                  style={{ backgroundColor: selectedCategory.color }}>
                  <Ionicons name={selectedCategory.icon as any} size={18} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="mb-0.5 text-sm font-medium text-slate-500">Categoría</Text>
                  <Text className="font-semibold text-slate-900">{selectedCategory.name}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
            </TouchableOpacity>

            {/* Date */}
            <View className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <Ionicons name="calendar-outline" size={18} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 text-sm font-medium text-slate-500">Fecha</Text>
                <Text className="font-semibold text-slate-900">{formatDateString(date)}</Text>
              </View>
            </View>

            {/* Notes */}
            <TouchableOpacity
              className="flex-row items-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 active:bg-slate-100"
              onPress={() => setShowNotesInput(true)}>
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
                <Ionicons name="document-text-outline" size={18} color="#7c3aed" />
              </View>
              <View className="flex-1">
                <Text className="mb-0.5 text-sm font-medium text-slate-500">Nota</Text>
                <Text className="font-semibold text-slate-600">
                  {notes ? 'Editar nota' : 'Agregar nota'}
                </Text>
              </View>
              {notes && (
                <View className="h-5 w-5 items-center justify-center rounded-full bg-green-100">
                  <Ionicons name="checkmark" size={12} color="#16a34a" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Calculator */}
          <View className="rounded-2xl bg-white p-6">
            <View className="space-y-3">
              {/* Row 1 */}
              <View className="flex-row justify-between space-x-3">
                {['1', '2', '3'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-100"
                    onPress={() => handleNumberPress(num)}>
                    <Text className="text-lg font-semibold text-slate-900">{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 2 */}
              <View className="flex-row justify-between space-x-3">
                {['4', '5', '6'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-100"
                    onPress={() => handleNumberPress(num)}>
                    <Text className="text-lg font-semibold text-slate-900">{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 3 */}
              <View className="flex-row justify-between space-x-3">
                {['7', '8', '9'].map((num) => (
                  <TouchableOpacity
                    key={num}
                    className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-100"
                    onPress={() => handleNumberPress(num)}>
                    <Text className="text-lg font-semibold text-slate-900">{num}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Row 4 */}
              <View className="flex-row justify-between space-x-3">
                <TouchableOpacity
                  className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-100"
                  onPress={() => handleNumberPress('.')}>
                  <Text className="text-lg font-semibold text-slate-900">.</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="h-12 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 active:bg-slate-100"
                  onPress={() => handleNumberPress('0')}>
                  <Text className="text-lg font-semibold text-slate-900">0</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="h-12 flex-1 items-center justify-center rounded-xl border border-red-200 bg-red-50 active:bg-red-100"
                  onPress={handleDelete}>
                  <Ionicons name="backspace-outline" size={20} color="#dc2626" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="border-t border-slate-100 bg-white px-6 py-4">
        <TouchableOpacity
          className={`items-center rounded-2xl px-8 py-4 ${
            parseFloat(amount) > 0 && !isLoading
              ? 'bg-slate-900 active:bg-slate-800'
              : 'bg-slate-300'
          }`}
          onPress={handleSave}
          disabled={parseFloat(amount) <= 0 || isLoading}>
          <Text className="text-lg font-semibold text-white">
            {isLoading ? 'Guardando...' : `Guardar ${type === 'expense' ? 'gasto' : 'ingreso'}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Category Selection Modal */}
      <Modal visible={showCategories} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-slate-50">
          <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <TouchableOpacity onPress={() => setShowCategories(false)}>
              <Text className="font-medium text-slate-500">Cancelar</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-slate-900">Seleccionar categoría</Text>
            <View className="w-16" />
          </View>

          <ScrollView className="flex-1 p-6">
            <View className="space-y-2">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  className={`flex-row items-center rounded-2xl border-2 px-4 py-4 ${
                    cat.id === category
                      ? 'border-slate-300 bg-slate-100'
                      : 'border-slate-200 bg-white'
                  } active:bg-slate-50`}
                  onPress={() => {
                    setCategory(cat.id);
                    setShowCategories(false);
                  }}>
                  <View
                    className="mr-4 h-10 w-10 items-center justify-center rounded-xl"
                    style={{ backgroundColor: cat.color }}>
                    <Ionicons name={cat.icon as any} size={20} color="white" />
                  </View>
                  <Text className="flex-1 font-semibold text-slate-900">{cat.name}</Text>
                  {cat.id === category && (
                    <View className="h-6 w-6 items-center justify-center rounded-full bg-green-100">
                      <Ionicons name="checkmark" size={14} color="#16a34a" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Notes Input Modal */}
      <Modal visible={showNotesInput} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-slate-50">
          <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <TouchableOpacity onPress={() => setShowNotesInput(false)}>
              <Text className="font-medium text-slate-500">Cancelar</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-slate-900">Nota</Text>
            <TouchableOpacity onPress={() => setShowNotesInput(false)}>
              <Text className="font-semibold text-slate-900">Guardar</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 p-6">
            <View className="rounded-2xl bg-white p-4">
              <TextInput
                className="min-h-32 text-base text-slate-900"
                value={notes}
                onChangeText={setNotes}
                placeholder="Agregar una nota para esta transacción..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                autoFocus
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
