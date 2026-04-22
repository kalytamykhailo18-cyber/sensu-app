import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';
import { Card } from './Card';

type Trend = 'up' | 'down' | 'stable';
type Variant = 'default' | 'compact' | 'large';

interface MetricCardProps {
  icon: string;
  iconColor: string;
  label: string;
  value?: string | number;
  unit?: string;
  subtitle?: string;
  trend?: Trend;
  trendValue?: string;
  variant?: Variant;
}

export const MetricCard = React.memo(function MetricCard({
  icon,
  iconColor,
  label,
  value,
  unit,
  subtitle,
  trend,
  trendValue,
  variant = 'default',
}: MetricCardProps) {
  const { getResponsivePadding, getResponsiveFontSize, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();

  // Animation for smooth value transitions
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const previousValue = useRef(value);

  // Animate value changes
  useEffect(() => {
    if (previousValue.current !== value && value !== undefined) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      previousValue.current = value;
    }
  }, [value, fadeAnim]);

  // Format value with consistent width
  const formatValue = () => {
    if (value === null || value === undefined || value === 0) {
      return '--';
    }
    if (typeof value === 'number') {
      return value.toLocaleString('en-US', { minimumIntegerDigits: 2 });
    }
    return value;
  };

  const variantStyles = (() => {
    switch (variant) {
      case 'compact':
        return {
          iconSize: getResponsiveSize(16, 20, 24),
          labelSize: getResponsiveFontSize(10, 12, 14),
          valueSize: getResponsiveFontSize(18, 20, 22), // subimos respecto al original
          minHeight: getResponsiveSize(64, 72, 84),
          padding: getResponsivePadding(12, 14, 16),
        };
      case 'large':
        return {
          iconSize: getResponsiveSize(30, 36, 40),
          labelSize: getResponsiveFontSize(16, 18, 20),
          valueSize: getResponsiveFontSize(28, 30, 34),
          minHeight: getResponsiveSize(120, 140, 160),
          padding: getResponsivePadding(18, 20, 24),
        };
      default:
        return {
          iconSize: getResponsiveSize(22, 24, 28),
          labelSize: getResponsiveFontSize(12, 14, 16),
          valueSize: getResponsiveFontSize(24, 26, 28),
          minHeight: getResponsiveSize(90, 100, 110),
          padding: getResponsivePadding(14, 16, 18),
        };
    }
  })();

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return 'arrow.up';
      case 'down': return 'arrow.down';
      default: return 'minus';
    }
  };

  const styles = StyleSheet.create({
    card: {
      flex: 1,
      flexDirection: 'column',
      minHeight: variantStyles.minHeight,
      padding: variantStyles.padding,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      ...Platform.select({
        ios: { shadowColor: theme.colors.black, shadowOpacity: theme.isDark ? 0.3 : 0.1, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8 },
        android: { elevation: 2 },
      }),
    },
    contentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      backgroundColor: withAlpha(iconColor, 0.12),
    },
    textCol: { flex: 1 },
    label: {
      fontSize: variantStyles.labelSize,
      color: theme.colors.textSecondary,
      marginBottom: 10,
      textAlign: 'left',
      fontWeight: '500',
    },
    valueRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      minHeight: 32,
      flexWrap: 'wrap',
    },
    value: {
      fontSize: variantStyles.valueSize,
      fontWeight: '700',
      color: theme.colors.text,
      lineHeight: Math.max(30, variantStyles.valueSize + 6),
      flexShrink: 1,
    },
    unit: {
      fontSize: Math.max(14, variantStyles.valueSize - 10),
      color: theme.colors.text,
      marginLeft: 4,
      opacity: 0.9,
      flexShrink: 0,
    },
    subtitle: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      marginTop: 6,
    },
    rightCol: {
      marginLeft: 12,
      gap: 8,
      alignItems: 'flex-end',
    },
    trendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    trendText: { fontSize: 12, color: getTrendColor(), fontWeight: '500' },
  });

  return (
    <Card variant="elevated" padding="none" style={styles.card}>
      {/* Label on top */}
      <ThemedText style={styles.label} numberOfLines={1}>{label}</ThemedText>

      {/* Icon and values row */}
      <View style={styles.contentRow}>
        {/* Icono */}
        <View style={styles.iconWrap}>
          <IconSymbol name={icon} size={variantStyles.iconSize} color={iconColor} />
        </View>

        {/* Textos */}
        <View style={styles.textCol}>
          <Animated.View style={[styles.valueRow, { opacity: fadeAnim }]}>
            <ThemedText style={styles.value}>
              {formatValue()}
            </ThemedText>
            {unit && value !== null && value !== undefined && value !== 0 ?
              <ThemedText style={styles.unit}>{unit}</ThemedText> : null}
          </Animated.View>

          {subtitle ? <ThemedText style={styles.subtitle}>{subtitle}</ThemedText> : null}
        </View>

        {/* Lado derecho: trend */}
        <View style={styles.rightCol}>
          {trend && trendValue ? (
            <View style={styles.trendRow}>
              <IconSymbol name={getTrendIcon()} size={12} color={getTrendColor()} />
              <ThemedText style={styles.trendText}>{trendValue}</ThemedText>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );
});

/** Convierte #RRGGBB a rgba con alpha */
function withAlpha(hex: string, alpha = 0.12) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
