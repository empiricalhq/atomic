import { Tabs } from 'expo-router';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.tab.active,
        tabBarInactiveTintColor: COLORS.tab.inactive,
        headerShown: false,
        tabBarShowLabel: false,
        // we do this to remove the ripple animation
        tabBarButton: (props) => <TouchableOpacity {...(props as any)} activeOpacity={1} />,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          borderTopWidth: 0,
          elevation: 8,
          backgroundColor: 'white',
          paddingTop: 14,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingHorizontal: 24,
          minHeight: 100,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'home' : 'home-outline'} />
          ),
          tabBarAccessibilityLabel: 'Inicio',
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Presupuesto',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'wallet' : 'wallet-outline'} />
          ),
          tabBarAccessibilityLabel: 'Presupuesto',
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          title: '',
          tabBarIcon: () => (
            <View
              className="h-10 w-14 items-center justify-center rounded-full rounded-lg bg-gray-800 shadow-lg"
              accessibilityRole="button"
              accessibilityLabel="Agregar gasto">
              <Ionicons name="add" size={24} color="white" />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'analytics' : 'analytics-outline'} />
          ),
          tabBarAccessibilityLabel: 'Reportes',
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'person' : 'person-outline'} />
          ),
          tabBarAccessibilityLabel: 'Ajustes',
        }}
      />
    </Tabs>
  );
}
