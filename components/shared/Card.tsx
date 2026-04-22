import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'small' | 'medium' | 'large' | 'none';
  borderRadius?: 'small' | 'medium' | 'large';
}

export function Card({ 
  children, 
  style, 
  variant = 'default',
  padding = 'medium',
  borderRadius = 'medium'
}: CardProps) {
  const { getResponsivePadding, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: theme.colors.cardBackground,
          shadowColor: theme.colors.black,
          shadowOpacity: theme.isDark ? 0.3 : 0.1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        };
      case 'outlined':
        return {
          backgroundColor: theme.colors.cardBackground,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      default:
        return {
          backgroundColor: theme.colors.cardBackground,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.black,
          shadowOpacity: theme.isDark ? 0.2 : 0.05,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
          elevation: 1,
        };
    }
  };

  const getPaddingValue = () => {
    switch (padding) {
      case 'small': return getResponsivePadding(8, 12, 16);
      case 'large': return getResponsivePadding(20, 24, 28);
      case 'none': return 0;
      default: return getResponsivePadding(12, 16, 20);
    }
  };

  const getBorderRadiusValue = () => {
    switch (borderRadius) {
      case 'small': return getResponsiveSize(6, 8, 10);
      case 'large': return getResponsiveSize(16, 20, 24);
      default: return getResponsiveSize(10, 12, 14);
    }
  };

  const cardStyles = StyleSheet.create({
    card: {
      ...getVariantStyles(),
      padding: getPaddingValue(),
      borderRadius: getBorderRadiusValue(),
      ...style,
    },
  });

  return (
    <View style={cardStyles.card}>
      {children}
    </View>
  );
}
