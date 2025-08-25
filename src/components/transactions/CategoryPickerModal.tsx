import { Modal, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Typography from '@/components/common/Typography';
import Header from '@/components/layout/Header';

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
          <View className="py-2">
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                className="flex-row items-center justify-between px-2 py-4"
                onPress={() => onSelectCategory(cat.id)}
                activeOpacity={0.7}>
                <Typography
                  variant="body"
                  className={`text-gray-700 ${cat.id === selectedCategory ? 'font-medium' : ''}`}>
                  {cat.name}
                </Typography>
                {cat.id === selectedCategory && (
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
  );
}
