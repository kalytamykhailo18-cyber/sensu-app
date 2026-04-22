import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from './Button';

interface EmptyStateProps {
  icon: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  actionText?: string;
  onAction?: () => void;
  variant?: 'default' | 'compact' | 'large';
}

export function EmptyState({
  icon,
  iconColor,
  title,
  subtitle,
  actionText,
  onAction,
  variant = 'default',
}: EmptyStateProps) {
  const { getResponsivePadding, getResponsiveFontSize, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          padding: getResponsivePadding(20, 24, 28),
          iconSize: getResponsiveSize(32, 36, 40),
          titleSize: getResponsiveFontSize(14, 16, 18),
          subtitleSize: getResponsiveFontSize(12, 14, 16),
          iconMargin: getResponsivePadding(8, 12, 16),
          titleMargin: getResponsivePadding(8, 12, 16),
          subtitleMargin: getResponsivePadding(4, 6, 8),
        };
      case 'large':
        return {
          padding: getResponsivePadding(40, 48, 56),
          iconSize: getResponsiveSize(64, 72, 80),
          titleSize: getResponsiveFontSize(20, 24, 28),
          subtitleSize: getResponsiveFontSize(16, 18, 20),
          iconMargin: getResponsivePadding(16, 20, 24),
          titleMargin: getResponsivePadding(16, 20, 24),
          subtitleMargin: getResponsivePadding(8, 12, 16),
        };
      default:
        return {
          padding: getResponsivePadding(30, 36, 42),
          iconSize: getResponsiveSize(48, 56, 64),
          titleSize: getResponsiveFontSize(18, 20, 22),
          subtitleSize: getResponsiveFontSize(14, 16, 18),
          iconMargin: getResponsivePadding(12, 16, 20),
          titleMargin: getResponsivePadding(12, 16, 20),
          subtitleMargin: getResponsivePadding(6, 8, 10),
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
      marginBottom: variantStyles.iconMargin,
    },
    title: {
      fontSize: variantStyles.titleSize,
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: variantStyles.titleMargin,
    },
    subtitle: {
      fontSize: variantStyles.subtitleSize,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: variantStyles.subtitleSize * 1.4,
      marginBottom: variantStyles.subtitleMargin,
    },
    actionContainer: {
      marginTop: getResponsivePadding(8, 12, 16),
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <IconSymbol 
          name={icon} 
          size={variantStyles.iconSize} 
          color={iconColor || theme.colors.textTertiary} 
        />
      </View>
      
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      
      {subtitle && (
        <ThemedText style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
      
      {actionText && onAction && (
        <View style={styles.actionContainer}>
          <Button
            title={actionText}
            onPress={onAction}
            variant="outline"
            size="medium"
          />
        </View>
      )}
    </View>
  );
}
