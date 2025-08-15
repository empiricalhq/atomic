import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1e293b', // slate-800
        tabBarInactiveTintColor: '#64748b', // slate-500
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.12,
          shadowRadius: 20,
          paddingBottom: Platform.OS === 'ios' ? 28 : 80, // More padding for Android
          paddingHorizontal: 8,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
          bottom: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          marginTop: 6,
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        tabBarItemStyle: {
          paddingTop: 4,
        },
      }}>
      {/* Tab 1: Home */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-11 items-center justify-center rounded-2xl ${focused ? 'bg-slate-800' : 'bg-transparent'} py-1.5`}>
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={focused ? 22 : 20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 2: Budget */}
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Presupuesto',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-11 items-center justify-center rounded-2xl ${focused ? 'bg-slate-800' : 'bg-transparent'} py-1.5`}>
              <Ionicons
                name={focused ? 'wallet' : 'wallet-outline'}
                size={focused ? 22 : 20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 3: Add Expense (Center) */}
      <Tabs.Screen
        name="add-expense"
        options={{
          title: '',
          tabBarIcon: ({ color, focused }) => (
            <View
              className="h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-slate-800 shadow-lg"
              style={{
                marginTop: Platform.OS === 'ios' ? -28 : -32, // More negative margin for Android
                shadowColor: '#1e293b',
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 12,
              }}>
              <Ionicons name="add" size={28} color="white" />
            </View>
          ),
          tabBarLabelStyle: { display: 'none' },
        }}
      />

      {/* Tab 4: Reports */}
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-11 items-center justify-center rounded-2xl ${focused ? 'bg-slate-800' : 'bg-transparent'} py-1.5`}>
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'}
                size={focused ? 22 : 20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />

      {/* Tab 5: Settings */}
      <Tabs.Screen
        name="config"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, focused }) => (
            <View
              className={`h-8 w-11 items-center justify-center rounded-2xl ${focused ? 'bg-slate-800' : 'bg-transparent'} py-1.5`}>
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={focused ? 22 : 20}
                color={focused ? 'white' : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
