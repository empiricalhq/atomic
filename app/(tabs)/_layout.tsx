import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
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
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          paddingBottom: Math.max(insets.bottom, 16) + (Platform.OS === 'ios' ? 16 : 24),
          paddingHorizontal: 16,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          bottom: 0,
          height: (Platform.OS === 'ios' ? 88 : 72) + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.5,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'home' : 'home-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Presupuesto',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'wallet' : 'wallet-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="add-expense"
        options={{
          title: '',
          tabBarIcon: () => (
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-gray-800"
              style={{
                marginTop: Platform.OS === 'ios' ? -24 : -20,
                shadowColor: '#1e293b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 8,
              }}>
              <Ionicons name="add" size={24} color="white" />
            </View>
          ),
          tabBarLabelStyle: { display: 'none' },
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'analytics' : 'analytics-outline'} />
          ),
        }}
      />
      <Tabs.Screen
        name="config"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} iconName={focused ? 'person' : 'person-outline'} />
          ),
        }}
      />
    </Tabs>
  );
}
