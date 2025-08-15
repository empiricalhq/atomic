import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'right',
  style,
}) => {
  const buttonStyle = [
    styles.base,
    styles[size],
    styles[variant],
    disabled && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.baseText,
    styles[`${size}Text`],
    styles[`${variant}Text`],
    disabled && styles.disabledText,
  ];

  const renderContent = () => (
    <>
      {icon && iconPosition === 'left' && (
        <Ionicons name={icon as any} size={20} color={getIconColor()} style={styles.iconLeft} />
      )}
      {loading ? (
        <ActivityIndicator size="small" color={getIconColor()} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
      {icon && iconPosition === 'right' && !loading && (
        <Ionicons name={icon as any} size={20} color={getIconColor()} style={styles.iconRight} />
      )}
    </>
  );

  const getIconColor = () => {
    if (disabled) return '#8E8E93';
    switch (variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return '#007AFF';
      case 'outline':
        return '#007AFF';
      case 'ghost':
        return '#007AFF';
      default:
        return 'white';
    }
  };

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity onPress={onPress} disabled={disabled || loading}>
        <LinearGradient
          colors={['#007AFF', '#0056CC']}
          style={buttonStyle}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  small: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  medium: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  large: {
    paddingHorizontal: 32,
    paddingVertical: 18,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F2F2F7',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: '#E5E5EA',
    shadowOpacity: 0,
  },
  baseText: {
    fontWeight: '600',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  primaryText: {
    color: 'white',
  },
  secondaryText: {
    color: '#007AFF',
  },
  outlineText: {
    color: '#007AFF',
  },
  ghostText: {
    color: '#007AFF',
  },
  disabledText: {
    color: '#8E8E93',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});
