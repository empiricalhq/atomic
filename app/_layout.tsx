import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { storageService } from '../services/StorageService';
import { userService } from '../services/UserService';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check if onboarding is complete
      const onboardingComplete = await storageService.getOnboardingComplete();

      if (!onboardingComplete) {
        setShowOnboarding(true);
      } else {
        await userService.getCurrentUser();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Iniciando..." />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        {showOnboarding ? (
          <Stack.Screen name="onboarding" />
        ) : (
          <>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="scanner"
              options={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
              }}
            />
            <Stack.Screen
              name="transaction/[id]"
              options={{
                presentation: 'modal',
              }}
            />
            <Stack.Screen
              name="category-select"
              options={{
                presentation: 'modal',
              }}
            />
          </>
        )}
      </Stack>
    </SafeAreaProvider>
  );
}
