import { View, type ViewProps } from 'react-native';

import { useThemeColor } from '@/hooks/useThemeColor';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  variant?: 'background' | 'surface' | 'border' | 'text' | 'icon' | 'tabIconDefault' | 'tabIconSelected' | 'cardBackground' | 'buttonPrimary' | 'buttonSecondary' | 'alertBackground' | 'alertTitle' | 'alertMessage' | 'tint';
};

export function ThemedView({ 
  style, 
  lightColor, 
  darkColor, 
  variant = 'background',
  ...otherProps 
}: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, variant);

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
