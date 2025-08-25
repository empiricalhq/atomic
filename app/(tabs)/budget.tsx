import { useState } from 'react';
import { ScrollView, Modal, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useBudget } from '@/hooks/useBudget';
import Screen from '@/components/layout/Screen';
import Header from '@/components/layout/Header';
import { BudgetSummaryCard } from '@/components/budget/BudgetSummaryCard';
import { BudgetCategoryList } from '@/components/budget/BudgetCategoryList';
import { COLORS } from '@/constants/theme';
import Input from '@/components/common/Input';
import Typography from '@/components/common/Typography';

export default function BudgetScreen() {
  const { categories, totalBudgeted, totalSpent, addCategory } = useBudget();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');

  const remaining = totalBudgeted - totalSpent;

  const handleAddNewCategory = () => {
    if (!newCategoryName || !newCategoryBudget) return;
    addCategory(newCategoryName, parseFloat(newCategoryBudget));
    setShowAddModal(false);
    setNewCategoryName('');
    setNewCategoryBudget('');
  };

  return (
    <Screen background="gray" padding="none">
      <Header
        title="Presupuesto"
        rightAction={{ icon: 'add', onPress: () => setShowAddModal(true) }}
        variant="elevated"
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        <BudgetSummaryCard
          budgeted={totalBudgeted}
          spent={totalSpent}
          remaining={remaining}
          className="mb-5"
        />

        <View className="mb-5">
          <Typography variant="h3" weight="bold" className="mb-4">
            Categorías
          </Typography>
          <BudgetCategoryList categories={categories} />
        </View>

        <TouchableOpacity
          className="flex-row items-center justify-center rounded-2xl border border-gray-200 bg-white p-5"
          onPress={() => setShowAddModal(true)}>
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100">
            <Ionicons name="add" size={22} color={COLORS.primary.DEFAULT} />
          </View>
          <Typography variant="body" weight="semibold" color="secondary">
            Agregar Categoría
          </Typography>
        </TouchableOpacity>
        <View className="h-24" />
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView className="flex-1 bg-gray-50">
          <Header
            title="Nueva Categoría"
            leftAction={{ text: 'Cancelar', onPress: () => setShowAddModal(false) }}
            rightAction={{ text: 'Guardar', onPress: handleAddNewCategory }}
          />
          <View className="p-6">
            <Input
              label="Nombre"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              placeholder="Ej: Comida, Transporte..."
              className="mb-6"
            />
            <Input
              label="Presupuesto"
              value={newCategoryBudget}
              onChangeText={setNewCategoryBudget}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
