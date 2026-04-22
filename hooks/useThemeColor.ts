/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useTheme } from '@/styles/theme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: 'text' | 'background' | 'tint' | 'icon' | 'tabIconDefault' | 'tabIconSelected' | 'surface' | 'border' | 'cardBackground' | 'buttonPrimary' | 'buttonSecondary' | 'alertBackground' | 'alertTitle' | 'alertMessage'
) {
  const { colors, isDark } = useTheme();
  const colorFromProps = props[isDark ? 'dark' : 'light'];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    // Mapear los nombres de colores al nuevo sistema de temas
    const colorMap = {
      text: colors.text,
      background: colors.background,
      tint: colors.tabIconSelected,
      icon: colors.icon,
      tabIconDefault: colors.tabIconDefault,
      tabIconSelected: colors.tabIconSelected,
      surface: colors.surface,
      border: colors.border,
      cardBackground: colors.cardBackground,
      buttonPrimary: colors.buttonPrimary,
      buttonSecondary: colors.buttonSecondary,
      alertBackground: colors.alertBackground,
      alertTitle: colors.alertTitle,
      alertMessage: colors.alertMessage,
    };
    return colorMap[colorName];
  }
}
