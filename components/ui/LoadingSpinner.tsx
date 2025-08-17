import React from 'react';
import { View, ActivityIndicator, Text, ViewStyle } from 'react-native';
import { STYLES } from '@/constants/design';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  color?: string;
  style?: ViewStyle;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  color = '#64748b',
  style,
}) => {
  return (
    <View className={`${STYLES.container} flex-1 items-center justify-center p-8`} style={style}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-4 text-center text-base font-medium text-slate-600">{message}</Text>
      )}
    </View>
  );
};
