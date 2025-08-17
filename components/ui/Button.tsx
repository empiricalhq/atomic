import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';
import { cn } from '@/utils/cn';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  loading = false,
  disabled = false,
  icon,
  className,
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  const baseStyles = 'flex-row items-center justify-center rounded-lg';

  const variantStyles = {
    primary: 'bg-gray-800 active:bg-gray-900',
    secondary: 'bg-gray-100 active:bg-gray-200',
    ghost: 'bg-transparent active:bg-gray-100',
    danger: 'bg-red-500 active:bg-red-600',
  };

  const disabledVariantStyles = {
    primary: 'bg-gray-300',
    secondary: 'bg-gray-100',
    ghost: 'bg-transparent',
    danger: 'bg-red-300',
  };

  const sizeStyles = {
    sm: 'px-3 py-2 min-h-[32px]',
    md: 'px-4 py-3 min-h-[44px]',
    lg: 'px-6 py-4 min-h-[52px]',
  };

  const textVariantStyles = {
    primary: 'text-white font-medium',
    secondary: 'text-gray-700 font-medium',
    ghost: 'text-gray-600 font-medium',
    danger: 'text-white font-medium',
  };

  const disabledTextVariantStyles = {
    primary: 'text-gray-500',
    secondary: 'text-gray-400',
    ghost: 'text-gray-400',
    danger: 'text-red-200',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spinnerColors = {
    primary: '#ffffff',
    secondary: '#374151',
    ghost: '#6b7280',
    danger: '#ffffff',
  };

  const disabledSpinnerColors = {
    primary: '#6b7280',
    secondary: '#9ca3af',
    ghost: '#9ca3af',
    danger: '#fca5a5',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={cn(
        baseStyles,
        sizeStyles[size],
        isDisabled ? disabledVariantStyles[variant] : variantStyles[variant],
        isDisabled && 'opacity-60',
        className
      )}
      activeOpacity={0.8}>
      {loading && (
        <ActivityIndicator
          size="small"
          color={isDisabled ? disabledSpinnerColors[variant] : spinnerColors[variant]}
          className="mr-2"
        />
      )}

      {icon && !loading && <View className="mr-2">{icon}</View>}

      <Text
        className={cn(
          textSizeStyles[size],
          isDisabled ? disabledTextVariantStyles[variant] : textVariantStyles[variant]
        )}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
