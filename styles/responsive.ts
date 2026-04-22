import { Dimensions } from 'react-native';
import { theme } from './theme';

// Obtener dimensiones de pantalla
const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

// Función para obtener valores responsivos basados en breakpoints
export function getResponsiveValue<T>(
  mobile: T,
  tablet: T,
  desktop: T
): T {
  if (screenWidth < theme.breakpoints.mobile) return mobile;
  if (screenWidth < theme.breakpoints.tablet) return tablet;
  return desktop;
}

// Función para obtener padding responsivo
export function getResponsivePadding(
  mobile: number,
  tablet: number,
  desktop: number
): number {
  return getResponsiveValue(mobile, tablet, desktop);
}

// Función para obtener tamaño de fuente responsivo
export function getResponsiveFontSize(
  mobile: number,
  tablet: number,
  desktop: number
): number {
  return getResponsiveValue(mobile, tablet, desktop);
}

// Función para obtener tamaño responsivo
export function getResponsiveSize(
  mobile: number,
  tablet: number,
  desktop: number
): number {
  return getResponsiveValue(mobile, tablet, desktop);
}

// Función para obtener porcentaje de ancho
export function getPercentWidth(percent: number): number {
  return (screenWidth * percent) / 100;
}

// Función para obtener porcentaje de alto
export function getPercentHeight(percent: number): number {
  return (screenHeight * percent) / 100;
}

// Función para obtener ancho de tarjeta responsivo
export function getCardWidth(width: number, percent: number): number {
  const horizontalGutters = theme.spacing.xl * 2; // 20px por lado
  const available = Math.max(0, width - horizontalGutters);
  return (available * Math.max(0, Math.min(1, percent / 100)));
}

// Función para determinar si es móvil
export function isMobile(): boolean {
  return screenWidth < theme.breakpoints.tablet;
}

// Función para determinar si es tablet
export function isTablet(): boolean {
  return screenWidth >= theme.breakpoints.tablet && screenWidth < theme.breakpoints.desktop;
}

// Función para determinar si es desktop
export function isDesktop(): boolean {
  return screenWidth >= theme.breakpoints.desktop;
}

// Función para obtener orientación
export function getOrientation(): 'portrait' | 'landscape' {
  return screenHeight > screenWidth ? 'portrait' : 'landscape';
}

// Dimensiones actuales
export const dimensions = {
  width: screenWidth,
  height: screenHeight,
  isMobile: isMobile(),
  isTablet: isTablet(),
  isDesktop: isDesktop(),
  orientation: getOrientation(),
};
