import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1e293b',
        tabBarInactiveTintColor: '#94a3b8',
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
        tabBarIconStyle: {
          marginBottom: 0,
        },
        tabBarItemStyle: {
          paddingTop: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-10 items-center justify-center rounded-xl ${
                focused ? 'bg-slate-800' : 'bg-transparent'
              }`}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="budget"
        options={{
          title: 'Presupuesto',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-10 items-center justify-center rounded-xl ${
                focused ? 'bg-slate-800' : 'bg-transparent'
              }`}>
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="add-expense"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl border-2 border-white bg-slate-800"
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
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-10 items-center justify-center rounded-xl ${
                focused ? 'bg-slate-800' : 'bg-transparent'
              }`}>
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="config"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-10 items-center justify-center rounded-xl ${
                focused ? 'bg-slate-800' : 'bg-transparent'
              }`}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
