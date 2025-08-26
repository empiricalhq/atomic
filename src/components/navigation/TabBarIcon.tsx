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
        color={focused ? COLORS.tab.activeIcon : COLORS.tab.inactive}
        style={{ opacity: focused ? 1 : 0.7 }}
        accessibilityRole="image"
      />
    </View>
  );
}
