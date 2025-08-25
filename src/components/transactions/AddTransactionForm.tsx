import { View, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '@/components/common/Typography';
import Button from '@/components/common/Button';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '@/constants/categories';

type FormState = {
  amount: string;
  description: string;
  type: 'expense' | 'income';
  category: string;
};

interface Props {
  formState: FormState;
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
  onSave: () => void;
  isLoading: boolean;
  onShowCategories: () => void;
}

export function AddTransactionForm({
  formState,
  setFormState,
  onSave,
  isLoading,
  onShowCategories,
}: Props) {
  const { amount, description, type, category } = formState;

  const handleAmountChange = (text: string) => {
    const cleanText = text.replace(/[^0-9.]/g, '');
    const parts = cleanText.split('.');
    if (parts.length > 2 || (parts[1] && parts[1].length > 2)) {
      return;
    }
    setFormState((prev) => ({ ...prev, amount: cleanText }));
  };

  const handleTypeChange = (newType: 'expense' | 'income') => {
    const newCategories = newType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
    setFormState((prev) => ({
      ...prev,
      type: newType,
      category: newCategories[0].id,
    }));
  };

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const selectedCategory = categories.find((cat) => cat.id === category) || categories[0];
  const hasAmount = amount && parseFloat(amount) > 0;

  return (
    <View className="flex-1 px-6">
      <View className="flex-1 items-center justify-center" style={{ marginTop: -60 }}>
        <View className="mb-16 flex-row rounded-full bg-gray-50 p-1">
          <TouchableOpacity
            className={`rounded-full px-6 py-3 ${type === 'expense' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => handleTypeChange('expense')}
            activeOpacity={0.8}>
            <Typography
              variant="body"
              weight="medium"
              className={type === 'expense' ? 'text-gray-900' : 'text-gray-500'}>
              Gasto
            </Typography>
          </TouchableOpacity>
          <TouchableOpacity
            className={`rounded-full px-6 py-3 ${type === 'income' ? 'bg-white shadow-sm' : ''}`}
            onPress={() => handleTypeChange('income')}
            activeOpacity={0.8}>
            <Typography
              variant="body"
              weight="medium"
              className={type === 'income' ? 'text-gray-900' : 'text-gray-500'}>
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
            className="text-5xl font-extralight text-gray-900"
          />
        </View>

        {hasAmount && (
          <View className="mt-8 w-full max-w-xs">
            <TextInput
              value={description}
              onChangeText={(text) => setFormState((prev) => ({ ...prev, description: text }))}
              placeholder="Agregar descripción..."
              placeholderTextColor="#9ca3af"
              className="border-b border-gray-200 py-3 text-center text-base text-gray-600"
            />
          </View>
        )}
        {hasAmount && (
          <TouchableOpacity
            className="mt-8 rounded-full bg-gray-50 px-6 py-4"
            onPress={onShowCategories}
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
        <Button
          onPress={onSave}
          disabled={!hasAmount || isLoading}
          loading={isLoading}
          size="lg"
          className="rounded-2xl">
          {isLoading ? 'Guardando...' : 'Guardar'}
        </Button>
      </View>
    </View>
  );
}
