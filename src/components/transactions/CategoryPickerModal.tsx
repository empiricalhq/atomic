import { Modal, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Header from '@/components/layout/Header';
import { CategoryList } from './CategoryList';

interface Category {
  id: string;
  name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryPickerModal({
  visible,
  onClose,
  categories,
  selectedCategory,
  onSelectCategory,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <Header
          title="Categoría"
          leftAction={{ text: 'Cancelar', onPress: onClose }}
          variant="elevated"
        />
        <View className="flex-1 px-6">
          <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={onSelectCategory}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
}
