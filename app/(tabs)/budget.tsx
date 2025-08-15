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
import { DESIGN } from '../../constants/design';

interface BudgetCategory {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  icon: string;
}

export default function BudgetScreen() {
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>([
    {
      id: '1',
      name: 'Comida',
      budgeted: 500,
      spent: 340,
      icon: 'restaurant',
    },
    {
      id: '2',
      name: 'Transporte',
      budgeted: 200,
      spent: 150,
      icon: 'car',
    },
    {
      id: '3',
      name: 'Entretenimiento',
      budgeted: 300,
      spent: 280,
      icon: 'game-controller',
    },
    {
      id: '4',
      name: 'Compras',
      budgeted: 400,
      spent: 420,
      icon: 'bag',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const totalBudgeted = budgetCategories.reduce((sum, cat) => sum + cat.budgeted, 0);
  const totalSpent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
  const remaining = totalBudgeted - totalSpent;

  const addNewCategory = () => {
    if (!newCategoryName || !newCategoryBudget) return;

    const newCategory: BudgetCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
      budgeted: parseFloat(newCategoryBudget),
      spent: 0,
      icon: 'receipt',
    };

    setBudgetCategories([...budgetCategories, newCategory]);
    setShowAddModal(false);
    setNewCategoryName('');
    setNewCategoryBudget('');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="flex-row items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
        <Text className="text-2xl font-bold text-slate-900">Presupuesto</Text>
        <TouchableOpacity
          className="h-10 w-10 items-center justify-center rounded-full bg-slate-100 active:bg-slate-200"
          onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={22} color={DESIGN.colors.primary[600]} />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="mx-5 my-5 rounded-2xl border border-slate-200 bg-white p-6">
          <Text className="mb-4 text-lg font-bold text-slate-900">Resumen del Mes</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-slate-500">Presupuestado</Text>
              <Text className="text-xl font-bold text-slate-900">${totalBudgeted.toFixed(2)}</Text>
            </View>
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-slate-500">Gastado</Text>
              <Text className="text-xl font-bold text-slate-900">${totalSpent.toFixed(2)}</Text>
            </View>
            <View className="items-center">
              <Text className="mb-1 text-sm font-medium text-slate-500">Restante</Text>
              <Text
                className={`text-xl font-bold ${
                  remaining >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                ${Math.abs(remaining).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        <View className="mb-5 px-5">
          <Text className="mb-4 text-xl font-bold text-slate-900">Categorías</Text>
          {budgetCategories.map((category) => {
            const progressPercentage = Math.min((category.spent / category.budgeted) * 100, 100);
            const isOverBudget = category.spent > category.budgeted;
            const remainingCategory = category.budgeted - category.spent;

            return (
              <View
                key={category.id}
                className="mb-4 rounded-2xl border border-slate-200 bg-white p-5">
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <View className="mr-3 h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                      <Ionicons
                        name={category.icon as any}
                        size={20}
                        color={DESIGN.colors.primary[600]}
                      />
                    </View>
                    <Text className="text-lg font-semibold text-slate-900">{category.name}</Text>
                  </View>
                  <Text
                    className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-slate-600'}`}>
                    ${category.spent.toFixed(2)}
                  </Text>
                </View>

                <View className="mb-3">
                  <View className="mb-1 flex-row justify-between">
                    <Text className="text-sm font-medium text-slate-500">
                      {isOverBudget ? 'Excedido' : 'Disponible'}:
                      <Text
                        className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-slate-900'}`}>
                        ${Math.abs(remainingCategory).toFixed(2)}
                      </Text>
                    </Text>
                    <Text className="text-sm font-semibold text-slate-600">
                      {progressPercentage.toFixed(0)}%
                    </Text>
                  </View>
                  <View className="h-2 w-full rounded-full bg-slate-100">
                    <View
                      className="h-2 rounded-full"
                      style={{
                        width: `${progressPercentage}%`,
                        backgroundColor: isOverBudget
                          ? DESIGN.colors.error
                          : DESIGN.colors.primary[600],
                      }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        <TouchableOpacity
          className="mx-5 mb-8 flex-row items-center justify-center rounded-2xl border border-slate-200 bg-white p-5"
          onPress={() => setShowAddModal(true)}>
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Ionicons name="add" size={22} color={DESIGN.colors.primary[600]} />
          </View>
          <Text className="text-base font-semibold text-slate-700">Agregar Categoría</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-slate-50">
          <View className="flex-row items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text className="text-base font-medium text-slate-500">Cancelar</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-slate-900">Nueva categoría</Text>
            <TouchableOpacity onPress={addNewCategory}>
              <Text className="text-base font-semibold text-slate-900">Guardar</Text>
            </TouchableOpacity>
          </View>

          <View className="p-6">
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
