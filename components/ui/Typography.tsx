import React from 'react';
import { Text } from 'react-native';
import { cn } from '@/utils/cn';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'error';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  children: React.ReactNode;
  className?: string;
}

const Typography: React.FC<TypographyProps> = ({
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  children,
  className,
}) => {
  const variantStyles = {
    h1: 'text-4xl leading-10',
    h2: 'text-3xl leading-9',
    h3: 'text-2xl leading-8',
    body: 'text-base leading-6',
    caption: 'text-sm leading-5',
    overline: 'text-xs leading-4 uppercase tracking-wide',
  };

  const colorStyles = {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-400',
    success: 'text-green-600',
    error: 'text-red-600',
  };

  const weightStyles = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Text
      className={cn(variantStyles[variant], colorStyles[color], weightStyles[weight], className)}>
      {children}
    </Text>
  );
};

export const Heading1: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography {...props} variant="h1" weight="bold" />
);

export const Heading2: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography {...props} variant="h2" weight="semibold" />
);

export const Heading3: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography {...props} variant="h3" weight="semibold" />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography {...props} variant="body" />
);

export const Caption: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography {...props} variant="caption" color="secondary" />
);

export const Overline: React.FC<Omit<TypographyProps, 'variant'>> = (props) => (
  <Typography {...props} variant="overline" color="muted" weight="medium" />
);

export default Typography;
