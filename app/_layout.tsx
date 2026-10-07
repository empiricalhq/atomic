import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { UserProvider } from '@/contexts/UserContext';
import { TransactionsProvider } from '@/contexts/TransactionsContext';
import { RootNavigator } from '@/navigation/RootNavigator';
import '../global.css';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <UserProvider>
        <TransactionsProvider>
          <RootNavigator />
        </TransactionsProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
