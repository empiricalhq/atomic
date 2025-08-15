import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 16,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 15,
          paddingTop: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transacciones',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'list' : 'list-outline'}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add-expense"
        options={{
          title: '',
          tabBarIcon: ({ color, size, focused }) => (
            <LinearGradient
              colors={['#007AFF', '#0056CC']}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                shadowColor: '#007AFF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
              <Ionicons name="add" size={28} color="white" />
            </LinearGradient>
          ),
          tabBarStyle: { display: 'none' }, // Hide tab bar on this screen
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'bar-chart' : 'bar-chart-outline'}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'settings' : 'settings-outline'}
              size={focused ? 26 : 24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
