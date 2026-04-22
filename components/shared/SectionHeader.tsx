import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  icon?: string;
  iconColor?: string;
  rightElement?: React.ReactNode;
  subtitle?: string;
  variant?: 'default' | 'compact' | 'large';
}

export function SectionHeader({
  title,
  icon,
  iconColor,
  rightElement,
  subtitle,
  variant = 'default',
}: SectionHeaderProps) {
  const { getResponsivePadding, getResponsiveFontSize, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          paddingVertical: getResponsivePadding(8, 10, 12),
          paddingHorizontal: getResponsivePadding(16, 20, 24),
          iconSize: getResponsiveSize(20, 24, 28),
          titleSize: getResponsiveFontSize(16, 18, 20),
        };
      case 'large':
        return {
          paddingVertical: getResponsivePadding(20, 24, 28),
          paddingHorizontal: getResponsivePadding(16, 20, 24),
          iconSize: getResponsiveSize(32, 36, 40),
          titleSize: getResponsiveFontSize(24, 28, 32),
        };
      default:
        return {
          paddingVertical: getResponsivePadding(12, 16, 20),
          paddingHorizontal: getResponsivePadding(16, 20, 24),
          iconSize: getResponsiveSize(24, 28, 32),
          titleSize: getResponsiveFontSize(18, 20, 22),
        };
    }
  };

  const variantStyles = getVariantStyles();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: variantStyles.paddingVertical,
      paddingHorizontal: variantStyles.paddingHorizontal,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      marginRight: getResponsivePadding(8, 12, 16),
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: variantStyles.titleSize,
      fontWeight: '700',
      color: theme.colors.text,
    },
    subtitle: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      color: theme.colors.textSecondary,
      marginTop: getResponsivePadding(2, 4, 6),
    },
    rightSection: {
      alignItems: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {icon && (
          <View style={styles.iconContainer}>
            <IconSymbol
              name={icon}
              size={variantStyles.iconSize}
              color={iconColor || theme.colors.icon}
            />
          </View>
        )}
        <View style={styles.textContainer}>
          <ThemedText type="title" style={styles.title}>
            {title}
          </ThemedText>
          {subtitle && (
            <ThemedText style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          )}
        </View>
      </View>
      {rightElement && (
        <View style={styles.rightSection}>
          {rightElement}
        </View>
      )}
    </View>
  );
}
