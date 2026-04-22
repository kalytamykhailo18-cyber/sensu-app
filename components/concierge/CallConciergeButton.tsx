import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface CallConciergeButtonProps {
  onPress: () => void;
}

export function CallConciergeButton({ onPress }: CallConciergeButtonProps) {
  const theme = useAppTheme();
  const { getResponsiveSize, getResponsivePadding, getResponsiveFontSize } = useDimensions();

  const buttonSize = getResponsiveSize(160, 180, 200);
  const iconSize = getResponsiveSize(48, 56, 64);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: getResponsivePadding(24, 32, 40),
    },
    button: {
      width: buttonSize,
      height: buttonSize,
      borderRadius: buttonSize / 2,
      backgroundColor: theme.colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.black,
      shadowOpacity: theme.isDark ? 0.4 : 0.2,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    buttonPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.98 }],
    },
    buttonContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: {
      color: theme.colors.white,
      fontSize: getResponsiveFontSize(14, 16, 18),
      fontWeight: '700',
      textAlign: 'center',
      marginTop: getResponsivePadding(8, 10, 12),
      maxWidth: buttonSize - 20,
    },
  }), [theme, buttonSize, getResponsivePadding, getResponsiveFontSize]);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <View style={styles.buttonContent}>
          <IconSymbol
            name="phone.fill"
            size={iconSize}
            color={theme.colors.white}
          />
          <ThemedText style={styles.buttonText}>
            Llamar a{'\n'}Sensu{'\n'}Concierge
          </ThemedText>
        </View>
      </Pressable>
    </View>
  );
}
