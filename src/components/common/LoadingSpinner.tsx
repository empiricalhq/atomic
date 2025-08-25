import { View, ActivityIndicator, Text, ViewStyle } from 'react-native';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export function LoadingSpinner({
  message,
  size = 'large',
  color = '#64748b',
  style,
}: LoadingSpinnerProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-8" style={style}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-4 text-center text-base font-medium text-gray-600">{message}</Text>
      )}
    </View>
  );
}
