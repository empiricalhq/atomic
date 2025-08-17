import { View, ScrollView, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cn } from '@/utils/cn';

interface ScreenProps {
  children: React.ReactNode;
  variant?: 'default' | 'scroll' | 'modal';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  background?: 'default' | 'gray' | 'white';
  safeArea?: boolean;
  header?: React.ReactNode;
  className?: string;
  contentContainerStyle?: ViewStyle;
}

export default function Screen({
  children,
  variant = 'default',
  padding = 'md',
  background = 'default',
  safeArea = true,
  header,
  className,
  contentContainerStyle,
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  const backgroundStyles = {
    default: 'bg-gray-25',
    gray: 'bg-gray-50',
    white: 'bg-white',
  };

  const paddingStyles = {
    none: '',
    sm: 'px-3 py-2',
    md: 'px-4 py-4',
    lg: 'px-6 py-6',
  };

  const safeAreaStyle = safeArea
    ? {
        paddingTop: insets.top,
        paddingBottom: variant === 'modal' ? insets.bottom : 0,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }
    : {};

  const baseContainerClass = cn('flex-1', backgroundStyles[background], className);

  const contentClass = cn(paddingStyles[padding]);

  if (variant === 'scroll') {
    return (
      <View style={safeAreaStyle} className={baseContainerClass}>
        {header}
        <ScrollView
          className={contentClass}
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={safeAreaStyle} className={baseContainerClass}>
      {header}
      <View className={cn('flex-1', contentClass)} style={contentContainerStyle}>
        {children}
      </View>
    </View>
  );
}
