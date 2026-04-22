/**
 * Hook personalizado para usar el tema de la aplicación
 * Proporciona acceso fácil a colores, espaciado y otras propiedades del tema
 */

import { useTheme } from '@/styles/theme';

export function useAppTheme() {
  const theme = useTheme();
  
  return {
    ...theme,
    // Funciones de utilidad para colores comunes
    getColor: (colorName: keyof typeof theme.colors) => theme.colors[colorName],
    
    // Funciones para crear estilos dinámicos
    createStyles: (styleFactory: (colors: typeof theme.colors) => any) => {
      return styleFactory(theme.colors);
    },
    
    // Colores comunes con nombres más descriptivos
    colors: {
      ...theme.colors,
      // Alias para compatibilidad
      primaryText: theme.colors.text,
      secondaryText: theme.colors.textSecondary,
      tertiaryText: theme.colors.textTertiary,
      primaryBackground: theme.colors.background,
      secondaryBackground: theme.colors.surface,
      tertiaryBackground: theme.colors.surfaceVariant,
    },
  };
}
