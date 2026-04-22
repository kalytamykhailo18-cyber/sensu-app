import { dimensions, getResponsiveValue } from '@/styles/responsive';
import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';

interface ScreenData {
  dimensions: typeof dimensions;
  getResponsiveSize: (small: number, medium: number, large: number) => number;
  getResponsivePadding: (small: number, medium: number, large: number) => number;
  getResponsiveFontSize: (small: number, medium: number, large: number) => number;
  getResponsiveValue: (small: number, medium: number, large: number) => number;
  getPercentWidth: (percent: number) => number;
  getPercentHeight: (percent: number) => number;
  getCardWidth: (width: number, percent: number) => number;
}

export function useScreenData(): ScreenData {
  const [screenData, setScreenData] = useState(dimensions);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ screen }) => {
      const newDimensions = {
        width: screen.width,
        height: screen.height,
        isMobile: screen.width < 768,
        isTablet: screen.width >= 768 && screen.width < 1024,
        isDesktop: screen.width >= 1024,
        orientation: screen.height > screen.width ? 'portrait' as const : 'landscape' as const,
      };
      setScreenData(newDimensions);
    });

    return () => subscription?.remove();
  }, []);

  return {
    dimensions: screenData,
    getResponsiveSize: (small: number, medium: number, large: number) => 
      getResponsiveValue(small, medium, large),
    getResponsivePadding: (small: number, medium: number, large: number) => 
      getResponsiveValue(small, medium, large),
    getResponsiveFontSize: (small: number, medium: number, large: number) => 
      getResponsiveValue(small, medium, large),
    getResponsiveValue: (small: number, medium: number, large: number) => 
      getResponsiveValue(small, medium, large),
    getPercentWidth: (percent: number) => (screenData.width * percent) / 100,
    getPercentHeight: (percent: number) => (screenData.height * percent) / 100,
    getCardWidth: (width: number, percent: number) => {
      const horizontalGutters = 32;
      const available = Math.max(0, width - horizontalGutters);
      return (available * Math.max(0, Math.min(1, percent / 100)));
    },
  };
}
