import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '@/utils/cn';
import Typography from '@/components/ui/Typography';

interface ActionConfig {
  icon?: keyof typeof Ionicons.glyphMap;
  text?: string;
  onPress: () => void;
  disabled?: boolean;
}

interface HeaderProps {
  title: string;
  leftAction?: ActionConfig;
  rightAction?: ActionConfig;
  variant?: 'default' | 'transparent' | 'elevated';
  className?: string;
}

export default function Header({
  title,
  leftAction,
  rightAction,
  variant = 'default',
  className,
}: HeaderProps) {
  const variantStyles = {
    default: 'bg-white border-b border-gray-200',
    transparent: 'bg-transparent',
    elevated: 'bg-white shadow-sm',
  };

  const renderAction = (action: ActionConfig, position: 'left' | 'right') => {
    const iconColor = action.disabled ? '#cbd5e1' : '#475569'; // gray-300 : gray-600
    const textColor = action.disabled ? 'text-gray-300' : 'text-gray-600';

    return (
      <TouchableOpacity
        onPress={action.onPress}
        disabled={action.disabled}
        className={cn(
          'h-10 w-10 items-center justify-center rounded-lg',
          !action.disabled && 'active:bg-gray-100'
        )}
        activeOpacity={0.7}>
        {action.icon && <Ionicons name={action.icon} size={20} color={iconColor} />}
        {action.text && (
          <Typography variant="body" weight="medium" className={cn('text-sm', textColor)}>
            {action.text}
          </Typography>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      className={cn(
        'min-h-[56px] flex-row items-center justify-between px-4 py-3',
        variantStyles[variant],
        className
      )}>
      <View className="w-10 items-start">{leftAction && renderAction(leftAction, 'left')}</View>

      <View className="flex-1 items-center px-4">
        <Typography
          variant="h3"
          weight="semibold"
          color="primary"
          className="text-center"
          numberOfLines={1}>
          {title}
        </Typography>
      </View>

      <View className="w-10 items-end">{rightAction && renderAction(rightAction, 'right')}</View>
    </View>
  );
}
