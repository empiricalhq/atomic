import { Tabs } from 'expo-router/js-tabs';
import { TabBar } from '@/components/navigation/TabBar';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';

const HomeIcon = ({ focused }: { focused: boolean }) => (
  <TabBarIcon focused={focused} iconName="home" />
);
const BudgetIcon = ({ focused }: { focused: boolean }) => (
  <TabBarIcon focused={focused} iconName="wallet" />
);
const ReportsIcon = ({ focused }: { focused: boolean }) => (
  <TabBarIcon focused={focused} iconName="analytics" />
);

export default function TabLayout() {
  return (
    <Tabs tabBar={TabBar} screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Inicio', tabBarIcon: HomeIcon, tabBarAccessibilityLabel: 'Inicio' }}
      />
      <Tabs.Screen
        name="budget"
        options={{
          title: 'Presupuesto',
          tabBarIcon: BudgetIcon,
          tabBarAccessibilityLabel: 'Presupuesto',
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reportes',
          tabBarIcon: ReportsIcon,
          tabBarAccessibilityLabel: 'Reportes',
        }}
      />
    </Tabs>
  );
}
