import { useRef, useState } from 'react';
import { ScrollView, Modal, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useBudget } from '@/hooks/useBudget';
import Screen from '@/components/layout/Screen';
import Header from '@/components/layout/Header';
import { BudgetSummaryCard } from '@/components/budget/BudgetSummaryCard';
import { BudgetCategoryList } from '@/components/budget/BudgetCategoryList';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { COLORS } from '@/constants/theme';
import { EXPENSE_CATEGORIES } from '@/constants/categories';
import { CategoryList } from '@/components/transactions/CategoryList';
import Input from '@/components/common/Input';
import Typography from '@/components/common/Typography';
import Button from '@/components/common/Button';
import { hasAtMostTwoDecimals, subtractMoney } from '@/utils/money';
import { isValidBudgetAmount } from '@/utils/budget';

export default function BudgetScreen() {
  const { categories, totalBudgeted, totalSpent, loading, error, addCategory, refreshCategories } =
    useBudget();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCategoryBudget, setNewCategoryBudget] = useState('');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  // Set before the first await, so a second tap fired before the re-render
  // that disables Guardar still sees this and bails out synchronously.
  const isSavingRef = useRef(false);

  const remaining = subtractMoney(totalBudgeted, totalSpent);

  // A category that already has a budget would only be rejected by the
  // service after a round trip, so it's left out of the picker instead.
  const budgetedCategoryIds = new Set(categories.map((category) => category.categoryId));
  const availableCategories = EXPENSE_CATEGORIES.filter(
    (category) => !budgetedCategoryIds.has(category.id)
  );

  const parsedBudget = parseFloat(newCategoryBudget);
  const isFormValid = newCategoryId !== '' && isValidBudgetAmount(parsedBudget);

  const resetForm = () => {
    setNewCategoryId('');
    setNewCategoryBudget('');
    setBudgetError(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleAddNewCategory = async () => {
    if (!isFormValid || isSavingRef.current) return;
    isSavingRef.current = true;
    setIsSaving(true);
    try {
      await addCategory(newCategoryId, parsedBudget);
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      setBudgetError(err instanceof Error ? err.message : 'Error guardando la categoría');
    } finally {
      isSavingRef.current = false;
      setIsSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Cargando presupuesto..." />;
  }

  return (
    <Screen background="gray" padding="none">
      <Header
        title="Presupuesto"
        rightAction={{ icon: 'add', onPress: openAddModal }}
        variant="elevated"
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
        {error && (
          <View className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-5">
            <Typography variant="body" weight="semibold" color="error" className="mb-2">
              {error}
            </Typography>
            <Button
              variant="secondary"
              size="sm"
              onPress={refreshCategories}
              className="self-start">
              Reintentar
            </Button>
          </View>
        )}

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
          onPress={openAddModal}>
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
            leftAction={{
              text: 'Cancelar',
              onPress: () => {
                setShowAddModal(false);
                resetForm();
              },
              disabled: isSaving,
            }}
            rightAction={{
              text: 'Guardar',
              onPress: handleAddNewCategory,
              disabled: isSaving || !isFormValid,
            }}
          />
          <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
            <View className="mb-6">
              <Typography variant="body" weight="medium" className="mb-2 text-gray-700">
                Categoría
              </Typography>
              <View className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                <CategoryList
                  categories={availableCategories}
                  selectedCategory={newCategoryId}
                  onSelectCategory={(categoryId) => {
                    setNewCategoryId(categoryId);
                    setBudgetError(null);
                  }}
                />
              </View>
            </View>
            <Input
              label="Presupuesto"
              value={newCategoryBudget}
              onChangeText={(text) => {
                const cleanText = text.replace(/[^0-9.]/g, '');
                if (!hasAtMostTwoDecimals(cleanText)) return;
                setNewCategoryBudget(cleanText);
                setBudgetError(null);
              }}
              placeholder="0.00"
              keyboardType="numeric"
              error={budgetError ?? undefined}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </Screen>
  );
}
