import { Text, TextStyle } from 'react-native';
import { cn } from '@/utils/cn';

interface TypographyProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'overline';
  color?: 'primary' | 'secondary' | 'muted' | 'success' | 'error';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extralight' | 'light';
  children: React.ReactNode;
  className?: string;
  numberOfLines?: number;
  style?: TextStyle;
}

export default function Typography({
  variant = 'body',
  color = 'primary',
  weight = 'normal',
  children,
  className,
  numberOfLines,
  style,
}: TypographyProps) {
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
    extralight: 'font-extralight',
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  return (
    <Text
      className={cn(variantStyles[variant], colorStyles[color], weightStyles[weight], className)}
      style={style}
      numberOfLines={numberOfLines}>
      {children}
    </Text>
  );
}

export function Heading1(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h1" weight="bold" />;
}

export function Heading2(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h2" weight="semibold" />;
}

export function Heading3(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="h3" weight="semibold" />;
}

export function BodyText(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="body" />;
}

export function Caption(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="caption" color="secondary" />;
}

export function Overline(props: Omit<TypographyProps, 'variant'>) {
  return <Typography {...props} variant="overline" color="muted" weight="medium" />;
}
