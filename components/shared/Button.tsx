import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, TextStyle, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const PRESS_IN  = { duration: 100 };
const PRESS_OUT = { duration: 200 };

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { getResponsivePadding, getResponsiveFontSize, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();

  const scale   = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value   = withTiming(0.92, PRESS_IN);
    opacity.value = withTiming(0.75, PRESS_IN);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    scale.value   = withTiming(1, PRESS_OUT);
    opacity.value = withTiming(1, PRESS_OUT);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return { backgroundColor: theme.colors.buttonSecondary, borderColor: theme.colors.buttonSecondaryBorder, borderWidth: 1 };
      case 'outline':
        return { backgroundColor: 'transparent', borderColor: theme.colors.buttonPrimary, borderWidth: 1 };
      case 'danger':
        return { backgroundColor: theme.colors.error, borderColor: theme.colors.error, borderWidth: 1 };
      case 'success':
        return { backgroundColor: theme.colors.success, borderColor: theme.colors.success, borderWidth: 1 };
      default:
        return { backgroundColor: theme.colors.buttonPrimary, borderColor: theme.colors.buttonPrimary, borderWidth: 1 };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline':   return theme.colors.buttonPrimary;
      case 'secondary': return theme.colors.buttonSecondaryText;
      default:          return theme.colors.white;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: getResponsivePadding(6, 8, 10), paddingHorizontal: getResponsivePadding(8, 12, 16), fontSize: getResponsiveFontSize(12, 14, 16), borderRadius: getResponsiveSize(6, 8, 10) };
      case 'large':
        return { paddingVertical: getResponsivePadding(14, 16, 18), paddingHorizontal: getResponsivePadding(20, 24, 28), fontSize: getResponsiveFontSize(16, 18, 20), borderRadius: getResponsiveSize(10, 12, 14) };
      default:
        return { paddingVertical: getResponsivePadding(10, 12, 14), paddingHorizontal: getResponsivePadding(16, 20, 24), fontSize: getResponsiveFontSize(14, 16, 18), borderRadius: getResponsiveSize(8, 10, 12) };
    }
  };

  const sizeStyles = getSizeStyles();

  const buttonStyles = StyleSheet.create({
    button: {
      ...getVariantStyles(),
      paddingVertical: sizeStyles.paddingVertical,
      paddingHorizontal: sizeStyles.paddingHorizontal,
      borderRadius: sizeStyles.borderRadius,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: getResponsivePadding(4, 6, 8),
      opacity: disabled || loading ? 0.5 : 1,
      width: fullWidth ? '100%' : undefined,
    },
    text: {
      color: getTextColor(),
      fontWeight: '600',
      fontSize: sizeStyles.fontSize,
      textAlign: 'center',
    },
  });

  const iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <Animated.View style={[animStyle, fullWidth && { width: '100%' }]}>
      <Pressable
        style={[buttonStyles.button, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
      >
        {icon && iconPosition === 'left' && (
          <IconSymbol name={icon} size={iconSize} color={getTextColor()} />
        )}
        <Text style={[buttonStyles.text, textStyle]}>
          {loading ? 'Cargando...' : title}
        </Text>
        {icon && iconPosition === 'right' && (
          <IconSymbol name={icon} size={iconSize} color={getTextColor()} />
        )}
      </Pressable>
    </Animated.View>
  );
}
