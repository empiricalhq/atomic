import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/theme';

interface TabBarIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  focused: boolean;
}

export function TabBarIcon({ iconName, focused }: TabBarIconProps) {
  return (
    <View
      className={`h-8 w-10 items-center justify-center rounded-xl ${
        focused ? 'bg-gray-800' : 'bg-transparent'
      }`}>
      <Ionicons
        name={iconName}
        size={20}
        color={focused ? COLORS.tab.activeIcon : COLORS.tab.inactive}
      />
    </View>
  );
}
