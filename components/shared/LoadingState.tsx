import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  icon?: string;
  iconColor?: string;
  variant?: 'default' | 'compact' | 'large';
}

export function LoadingState({
  message = 'Cargando...',
  showSpinner = true,
  icon,
  iconColor,
  variant = 'default',
}: LoadingStateProps) {
  const { getResponsivePadding, getResponsiveFontSize, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          padding: getResponsivePadding(20, 24, 28),
          iconSize: getResponsiveSize(20, 24, 28),
          fontSize: getResponsiveFontSize(12, 14, 16),
          spinnerSize: 'small' as const,
        };
      case 'large':
        return {
          padding: getResponsivePadding(40, 48, 56),
          iconSize: getResponsiveSize(48, 56, 64),
          fontSize: getResponsiveFontSize(16, 18, 20),
          spinnerSize: 'large' as const,
        };
      default:
        return {
          padding: getResponsivePadding(30, 36, 42),
          iconSize: getResponsiveSize(32, 36, 40),
          fontSize: getResponsiveFontSize(14, 16, 18),
          spinnerSize: 'large' as const,
        };
    }
  };

  const variantStyles = getVariantStyles();

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: variantStyles.padding,
    },
    iconContainer: {
      marginBottom: getResponsivePadding(8, 12, 16),
    },
    spinnerContainer: {
      marginBottom: getResponsivePadding(8, 12, 16),
    },
    text: {
      fontSize: variantStyles.fontSize,
      color: theme.colors.textSecondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {icon && (
        <View style={styles.iconContainer}>
          <IconSymbol 
            name={icon} 
            size={variantStyles.iconSize} 
            color={iconColor || theme.colors.info} 
          />
        </View>
      )}
      
      {showSpinner && (
        <View style={styles.spinnerContainer}>
          <ActivityIndicator 
            size={variantStyles.spinnerSize} 
            color={theme.colors.info} 
          />
        </View>
      )}
      
      <ThemedText style={styles.text}>
        {message}
      </ThemedText>
    </View>
  );
}
