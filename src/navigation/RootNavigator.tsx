import { View } from 'react-native';
import { Stack } from 'expo-router';
import { useUser } from '@/hooks/useUser';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import Typography from '@/components/common/Typography';
import Button from '@/components/common/Button';

// A missing user means onboarding hasn't created one yet, so the tabs and
// scanner stay unreachable (including by deep link) until it has. A load
// error is routed separately from a missing user: routing it to onboarding
// would let a retryable storage failure look like a fresh install and create
// a second user that overwrites the one already in storage.
export function RootNavigator() {
  const { user, loading, error, refreshUser } = useUser();

  if (loading) {
    return <LoadingSpinner message="Iniciando..." />;
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 p-8">
        <Typography variant="body" weight="semibold" color="error" className="mb-4 text-center">
          {error}
        </Typography>
        <Button variant="secondary" onPress={() => refreshUser()}>
          Reintentar
        </Button>
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Protected guard={user === null}>
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={user !== null}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="scanner"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}
