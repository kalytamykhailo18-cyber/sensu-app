import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface ServiceCategoryCardProps {
  icon: string;
  title: string;
  onPress?: () => void;
}

export function ServiceCategoryCard({ icon, title, onPress }: ServiceCategoryCardProps) {
  const theme = useAppTheme();
  const { getResponsivePadding, getResponsiveSize, getResponsiveFontSize } = useDimensions();

  const iconSize = getResponsiveSize(28, 32, 36);
  const iconContainerSize = getResponsiveSize(48, 56, 64);

  const styles = useMemo(() => StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: getResponsiveSize(12, 14, 16),
      padding: getResponsivePadding(12, 16, 20),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.black,
      shadowOpacity: theme.isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardPressed: {
      opacity: 0.8,
      backgroundColor: theme.isDark
        ? 'rgba(78,205,196,0.1)'
        : 'rgba(78,205,196,0.05)',
    },
    iconContainer: {
      width: iconContainerSize,
      height: iconContainerSize,
      borderRadius: iconContainerSize / 2,
      backgroundColor: theme.isDark
        ? 'rgba(78,205,196,0.2)'
        : 'rgba(78,205,196,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: getResponsivePadding(8, 10, 12),
    },
    title: {
      fontSize: getResponsiveFontSize(11, 12, 14),
      fontWeight: '600',
      color: theme.colors.text,
      textAlign: 'center',
      lineHeight: getResponsiveFontSize(14, 16, 18),
    },
  }), [theme, iconContainerSize, getResponsivePadding, getResponsiveSize, getResponsiveFontSize]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.iconContainer}>
        <IconSymbol
          name={icon as any}
          size={iconSize}
          color={theme.colors.primary}
        />
      </View>
      <ThemedText style={styles.title}>{title}</ThemedText>
    </Pressable>
  );
}
