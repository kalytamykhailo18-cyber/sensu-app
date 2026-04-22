// hooks/useDimensions.ts
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

type Breakpoint = 'sm' | 'md' | 'lg';

export function useDimensions() {
  // Estado para las dimensiones que se actualiza cuando cambia la orientación
  const [dimensions, setDimensions] = useState(() => Dimensions.get('screen'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      setDimensions(screen);
    });

    return () => subscription?.remove();
  }, []);

  const { width, height, scale, fontScale } = dimensions;

  // Breakpoints simples (ajusta a tu gusto)
  const bp: Breakpoint = width < 360 ? 'sm' : width < 768 ? 'md' : 'lg';

  // Helpers puros en función del breakpoint / width
  const getResponsiveSize = useMemo(() => {
    return (small: number, medium: number, large: number) => {
      if (bp === 'sm') return small;
      if (bp === 'md') return medium;
      return large;
    };
  }, [bp]);

  const getResponsivePadding = useMemo(() => {
    return (small: number, medium: number, large: number) => {
      if (bp === 'sm') return small;
      if (bp === 'md') return medium;
      return large;
    };
  }, [bp]);

  const getResponsiveFontSize = useMemo(() => {
    // Considera fontScale para accesibilidad
    return (small: number, medium: number, large: number) => {
      const base =
        bp === 'sm' ? small :
        bp === 'md' ? medium :
        large;
      // Ajuste ligero por plataforma
      const platformNudge = Platform.OS === 'android' ? 0 : 0;
      return Math.round((base + platformNudge) * (1 / fontScale));
    };
  }, [bp, fontScale]);

  const getPercentWidth = useMemo(() => {
    return (percent: number) => Math.max(0, Math.min(1, percent / 100)) * width;
  }, [width]);

  const getPercentHeight = useMemo(() => {
    return (percent: number) => Math.max(0, Math.min(1, percent / 100)) * height;
  }, [height]);

  return {
    dimensions: { width, height, scale, fontScale, bp },
    getResponsiveSize,
    getResponsivePadding,
    getResponsiveFontSize,
    getPercentWidth,
    getPercentHeight,
  };
}
