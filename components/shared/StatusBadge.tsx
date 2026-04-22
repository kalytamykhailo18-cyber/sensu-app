import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface StatusBadgeProps {
  status: 'connected' | 'disconnected' | 'loading' | 'error' | 'warning' | 'success';
  text: string;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function StatusBadge({
  status,
  text,
  showIcon = true,
  size = 'medium',
}: StatusBadgeProps) {
  const { getResponsivePadding, getResponsiveFontSize, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
      case 'success':
        return {
          backgroundColor: theme.isDark ? 'rgba(68,170,68,0.2)' : 'rgba(68,170,68,0.1)',
          borderColor: theme.isDark ? 'rgba(68,170,68,0.4)' : 'rgba(68,170,68,0.3)',
          textColor: theme.colors.success,
          icon: 'checkmark.circle.fill',
          iconColor: theme.colors.success,
        };
      case 'disconnected':
      case 'error':
        return {
          backgroundColor: theme.isDark ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)',
          borderColor: theme.isDark ? 'rgba(255,107,107,0.4)' : 'rgba(255,107,107,0.3)',
          textColor: theme.colors.error,
          icon: 'exclamationmark.triangle.fill',
          iconColor: theme.colors.error,
        };
      case 'loading':
        return {
          backgroundColor: theme.isDark ? 'rgba(0,122,255,0.2)' : 'rgba(0,122,255,0.1)',
          borderColor: theme.isDark ? 'rgba(0,122,255,0.4)' : 'rgba(0,122,255,0.3)',
          textColor: theme.colors.info,
          icon: 'arrow.clockwise',
          iconColor: theme.colors.info,
        };
      case 'warning':
        return {
          backgroundColor: theme.isDark ? 'rgba(255,165,0,0.2)' : 'rgba(255,165,0,0.1)',
          borderColor: theme.isDark ? 'rgba(255,165,0,0.4)' : 'rgba(255,165,0,0.3)',
          textColor: theme.colors.warning,
          icon: 'exclamationmark.triangle.fill',
          iconColor: theme.colors.warning,
        };
      default:
        return {
          backgroundColor: theme.isDark ? 'rgba(102,102,102,0.2)' : 'rgba(102,102,102,0.1)',
          borderColor: theme.isDark ? 'rgba(102,102,102,0.4)' : 'rgba(102,102,102,0.3)',
          textColor: theme.colors.textSecondary,
          icon: 'questionmark.circle.fill',
          iconColor: theme.colors.textSecondary,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: getResponsivePadding(2, 4, 6),
          paddingHorizontal: getResponsivePadding(6, 8, 10),
          fontSize: getResponsiveFontSize(10, 12, 14),
          iconSize: getResponsiveSize(10, 12, 14),
          borderRadius: getResponsiveSize(4, 6, 8),
        };
      case 'large':
        return {
          paddingVertical: getResponsivePadding(6, 8, 10),
          paddingHorizontal: getResponsivePadding(12, 16, 20),
          fontSize: getResponsiveFontSize(14, 16, 18),
          iconSize: getResponsiveSize(16, 18, 20),
          borderRadius: getResponsiveSize(8, 10, 12),
        };
      default:
        return {
          paddingVertical: getResponsivePadding(4, 6, 8),
          paddingHorizontal: getResponsivePadding(8, 12, 16),
          fontSize: getResponsiveFontSize(12, 14, 16),
          iconSize: getResponsiveSize(12, 14, 16),
          borderRadius: getResponsiveSize(6, 8, 10),
        };
    }
  };

  const statusConfig = getStatusConfig();
  const sizeStyles = getSizeStyles();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: statusConfig.backgroundColor,
      borderColor: statusConfig.borderColor,
      borderWidth: 1,
      borderRadius: sizeStyles.borderRadius,
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      gap: getResponsivePadding(4, 6, 8),
    },
    text: {
      fontSize: sizeStyles.fontSize,
      fontWeight: '600',
      color: statusConfig.textColor,
    },
  });

  return (
    <View style={styles.container}>
      {showIcon && (
        <IconSymbol 
          name={statusConfig.icon} 
          size={sizeStyles.iconSize} 
          color={statusConfig.iconColor} 
        />
      )}
      <ThemedText style={styles.text}>
        {text}
      </ThemedText>
    </View>
  );
}
