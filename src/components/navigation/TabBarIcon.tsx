import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface TabBarIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

export function TabBarIcon({ iconName, focused }: TabBarIconProps) {
  return (
    <View className="h-12 w-12 items-center justify-center rounded-full">
      <Ionicons
        name={iconName}
        size={22}
        color={COLORS.tab.activeIcon}
        style={{ opacity: focused ? 1 : 0.5 }}
        accessibilityRole="image"
      />
    </View>
  );
}
