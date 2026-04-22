import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Button } from '@/components/shared';

interface NetworkUnavailableIndicatorProps {
  style?: any;
  onRetry?: () => void;
}

export const NetworkUnavailableIndicator = React.memo(function NetworkUnavailableIndicator({ style, onRetry }: NetworkUnavailableIndicatorProps) {
  const theme = useAppTheme();

  const backgroundColor = theme.isDark
    ? 'rgba(255,159,10,0.1)'
    : 'rgba(255,159,10,0.1)';
  const borderColor = theme.isDark
    ? 'rgba(255,159,10,0.3)'
    : 'rgba(255,159,10,0.3)';
  const textColor = theme.isDark
    ? '#FFA726'
    : '#F57C00';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
        style
      ]}
    >
      <Text style={[styles.icon]}>🌐</Text>
      <View style={styles.textContainer}>
        <Text style={[styles.title, { color: textColor }]}>
          Sin conexión al servidor
        </Text>
        <Text style={[styles.subtitle, { color: textColor, opacity: 0.8 }]}>
          No se puede conectar con el servidor. Verifica tu conexión a internet.
        </Text>
        {onRetry && (
          <Button
            title="Reintentar"
            onPress={onRetry}
            variant="secondary"
            size="small"
            style={styles.retryButton}
          />
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    fontSize: 32,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 8,
  },
});