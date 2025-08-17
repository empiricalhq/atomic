import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { cn } from '@/utils/cn';

interface CardProps {
  variant?: 'default' | 'elevated' | 'bordered';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export default function Card({
  variant = 'default',
  padding = 'md',
  children,
  onPress,
  className,
}: CardProps) {
  const baseStyles = 'bg-white rounded-xl';

  const variantStyles = {
    default: '',
    elevated: 'shadow-md',
    bordered: 'border border-gray-200',
  };

  const paddingStyles = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const combinedClassName = cn(
    baseStyles,
    variantStyles[variant],
    paddingStyles[padding],
    className
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} className={combinedClassName} activeOpacity={0.95}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={combinedClassName}>{children}</View>;
}
