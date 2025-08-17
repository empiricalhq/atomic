import { useState } from 'react';
import { View, TextInput, Text, TextInputProps } from 'react-native';
import { cn } from '@/utils/cn';

interface InputProps extends Omit<TextInputProps, 'className'> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  inputClassName?: string;
}

export default function Input({
  label,
  error,
  hint,
  className,
  inputClassName,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const baseInputStyles = 'px-4 py-3 rounded-lg text-base text-gray-900 min-h-[44px]';

  const inputStateStyles = error
    ? 'bg-red-50 border border-red-500'
    : isFocused
      ? 'bg-white border border-gray-400'
      : 'bg-gray-50 border border-gray-200';

  return (
    <View className={cn('w-full', className)}>
      {label && <Text className="mb-2 text-sm font-medium text-gray-700">{label}</Text>}

      <TextInput
        {...props}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={cn(baseInputStyles, inputStateStyles, inputClassName)}
        placeholderTextColor="#9ca3af"
      />

      {error && <Text className="mt-1 text-sm text-red-600">{error}</Text>}

      {hint && !error && <Text className="mt-1 text-sm text-gray-500">{hint}</Text>}
    </View>
  );
}
