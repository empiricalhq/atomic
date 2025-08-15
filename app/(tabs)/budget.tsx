import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  icon: string;
  color: string;
}

export default function BudgetScreen() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Comida',
      budgeted: 500,
      spent: 340,
      icon: 'restaurant',
      color: '#f97316',
    },
    {
      id: '2',
      name: 'Transporte',
      budgeted: 200,
      spent: 150,
      icon: 'car',
      color: '#3b82f6',
    },
    {
      id: '3',
      name: 'Entretenimiento',
      budgeted: 300,
      spent: 280,
      icon: 'game-controller',
      color: '#8b5cf6',
    },
    {
      id: '4',
      name: 'Compras',
      budgeted: 400,
      spent: 420,
      icon: 'bag',
      color: '#a855f7',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);

  const getProgressPercentage = (spent: number, budgeted: number) => {
    return Math.min((spent / budgeted) * 100, 100);
  };

  const getProgressColorClass = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getAmountTextColor = (amount: number) => {
    if (amount >= 0) return 'text-green-600';
    return 'text-red-600';
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="flex-row items-center justify-between bg-white px-5 py-4">
        <Text className="text-2xl font-bold text-slate-900">Presupuesto</Text>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
          onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={22} color="#475569" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-5" showsVerticalScrollIndicator={false}>
        {/* Overview Card */}
        <View className="mb-5 rounded-2xl bg-white p-6 shadow-sm">
          <Text className="mb-4 text-lg font-semibold text-slate-900">Resumen del Mes</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-slate-500">Presupuestado</Text>
              <Text className="text-xl font-bold text-slate-900">${totalBudgeted}</Text>
            </View>
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-slate-500">Gastado</Text>
              <Text className="text-xl font-bold text-red-600">${totalSpent}</Text>
            </View>
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-slate-500">Restante</Text>
              <Text
                className={`text-xl font-bold ${getAmountTextColor(totalBudgeted - totalSpent)}`}>
                ${Math.abs(totalBudgeted - totalSpent)}
              </Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View className="mb-5">
          <Text className="mb-4 text-xl font-semibold text-slate-900">Categorías</Text>
          {budgetCategories.map((category) => {
            const progressPercentage = getProgressPercentage(category.spent, category.budgeted);
            const progressColorClass = getProgressColorClass(category.spent, category.budgeted);

            return (
              <TouchableOpacity
                key={category.id}
                className="mb-3 rounded-2xl bg-white p-5 shadow-sm active:bg-slate-50">
                {/* Category Header */}
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View
                      className="mr-3 h-10 w-10 items-center justify-center rounded-xl"
                      style={{ backgroundColor: category.color }}>
                      <Ionicons name={category.icon as any} size={20} color="white" />
                    </View>
                    <Text className="text-lg font-semibold text-slate-900">{category.name}</Text>
                  </View>
                  <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-full active:bg-slate-100">
                    <Ionicons name="ellipsis-horizontal" size={18} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Progress Bar */}
                <View className="mb-3 flex-row items-center">
                  <View className="mr-3 h-2 flex-1 rounded-full bg-slate-200">
                    <View
                      className={`h-2 rounded-full ${progressColorClass}`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </View>
                  <Text className="min-w-[35px] text-sm font-semibold text-slate-600">
                    {progressPercentage.toFixed(0)}%
                  </Text>
                </View>

                {/* Amounts */}
                <View className="flex-row items-center">
                  <Text className="text-base font-semibold text-slate-900">${category.spent}</Text>
                  <Text className="ml-1 text-base text-slate-500">de ${category.budgeted}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Add Category Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-2xl bg-white p-5 shadow-sm active:bg-slate-50"
          onPress={() => setShowAddModal(true)}>
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Ionicons name="add" size={22} color="#475569" />
          </View>
          <Text className="text-base font-semibold text-slate-700">Agregar Categoría</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Category Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-slate-50">
          {/* Modal Header */}
          <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text className="text-base font-medium text-slate-500">Cancelar</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-slate-900">Nueva categoría</Text>
            <TouchableOpacity>
              <Text className="text-base font-semibold text-blue-600">Guardar</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Content */}
          <View className="p-5">
            {/* Name Input */}
            <View className="mb-6">
              <Text className="mb-2 text-base font-semibold text-slate-900">Nombre</Text>
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                placeholder="Ej: Comida, Transporte..."
                placeholderTextColor="#94a3b8"
              />
            </View>

            {/* Budget Input */}
            <View className="mb-6">
              <Text className="mb-2 text-base font-semibold text-slate-900">Presupuesto</Text>
              <TextInput
                className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-base text-slate-900"
                value={newCategoryBudget}
                onChangeText={setNewCategoryBudget}
                placeholder="$0.00"
                placeholderTextColor="#94a3b8"
                keyboardType="numeric"
              />
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
