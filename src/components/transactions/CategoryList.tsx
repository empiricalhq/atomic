import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Typography from '@/components/common/Typography';

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export function CategoryList({ categories, selectedCategory, onSelectCategory }: Props) {
  return (
    <View className="py-2">
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          className="flex-row items-center justify-between px-2 py-4"
          onPress={() => onSelectCategory(category.id)}
          activeOpacity={0.7}>
          <Typography
            variant="body"
            className={`text-gray-700 ${category.id === selectedCategory ? 'font-medium' : ''}`}>
            {category.name}
          </Typography>
          {category.id === selectedCategory && (
            <View className="h-5 w-5 items-center justify-center rounded-full bg-gray-900">
              <Ionicons name="checkmark" size={12} color="white" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}
