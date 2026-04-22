// Sistema de tema centralizado con soporte para modo oscuro/claro
import { useColorScheme } from '@/hooks/useColorScheme';

// Colores base que no cambian
const baseColors = {
  // Colores primarios - Sensu brand (brown + orange)
  primary: '#3D2314',
  secondary: '#E87A2F',

  // Colores de estado (se mantienen iguales en ambos modos)
  success: '#44AA44',
  error: '#D94444',
  warning: '#E87A2F',
  info: '#5A3E2B',

  // Colores base únicos
  white: '#fff',
  black: '#000',
} as const;

// Colores para modo claro
const lightColors = {
  ...baseColors,

  // Colores neutros
  light: '#FAF6F1',
  dark: '#3D2314',
  gray: '#6B5545',
  lightGray: '#A89485',

  // Colores de fondo
  background: '#FAF6F1',
  surface: '#F5EDE4',
  surfaceVariant: '#EDE5DC',

  // Colores de borde
  border: '#E0D5CA',
  borderLight: '#EDE5DC',
  borderDark: '#C9B9A8',

  // Colores de texto
  text: '#2C1A0E',
  textSecondary: '#6B5545',
  textTertiary: '#A89485',

  // Colores de iconos
  icon: '#6B5545',
  iconSecondary: '#A89485',

  // Colores de pestañas
  tabIconDefault: '#A89485',
  tabIconSelected: '#3D2314',

  // Colores de tarjetas
  cardBackground: '#FFFFFF',
  cardBorder: '#E0D5CA',

  // Colores de botones
  buttonPrimary: '#3D2314',
  buttonSecondary: 'rgba(232,122,47,0.1)',
  buttonSecondaryBorder: 'rgba(232,122,47,0.3)',
  buttonSecondaryText: '#E87A2F',

  // Colores de alertas
  alertBackground: '#F5EDE4',
  alertBorder: '#E0D5CA',
  alertTitle: '#2C1A0E',
  alertMessage: '#6B5545',
  alertTime: '#A89485',
} as const;

// Colores para modo oscuro
const darkColors = {
  ...baseColors,

  // Colores neutros
  light: '#2A2018',
  dark: '#F0E8E0',
  gray: '#A89485',
  lightGray: '#6B5545',

  // Colores de fondo
  background: '#1A120C',
  surface: '#241A12',
  surfaceVariant: '#2E2218',

  // Colores de borde
  border: '#3D2E22',
  borderLight: '#2E2218',
  borderDark: '#4A3828',

  // Colores de texto
  text: '#F5EDE4',
  textSecondary: '#A89485',
  textTertiary: '#6B5545',

  // Colores de iconos
  icon: '#A89485',
  iconSecondary: '#6B5545',

  // Colores de pestañas
  tabIconDefault: '#A89485',
  tabIconSelected: '#F5EDE4',

  // Colores de tarjetas
  cardBackground: '#241A12',
  cardBorder: '#3D2E22',

  // Colores de botones
  buttonPrimary: '#E87A2F',
  buttonSecondary: 'rgba(232,122,47,0.15)',
  buttonSecondaryBorder: 'rgba(232,122,47,0.4)',
  buttonSecondaryText: '#E87A2F',

  // Colores de alertas
  alertBackground: '#2E2218',
  alertBorder: '#3D2E22',
  alertTitle: '#F5EDE4',
  alertMessage: '#A89485',
  alertTime: '#6B5545',
} as const;

// Función para obtener el tema según el modo del dispositivo
export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    colorScheme,
  };
}

// Tema por defecto (modo claro)
export const theme = {
  colors: lightColors,
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 10,
    xl: 12,
    xxl: 16,
    xxxl: 20,
  },
  
  typography: {
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 20,
      xxxl: 24,
      xxxxl: 28,
      xxxxxl: 32,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
  },
  
  breakpoints: {
    mobile: 360,
    tablet: 768,
    desktop: 1024,
  },
} as const;

export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeTypography = typeof theme.typography;
