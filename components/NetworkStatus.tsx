import { IconSymbol } from '@/components/ui/IconSymbol';
import { API_CONFIG } from '@/config/api';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useDimensions } from '@/hooks/useDimensions';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface NetworkStatusProps {
  isConnected: boolean;
  onRetry: () => void;
  isRetrying?: boolean;
  errorMessage?: string;
}

export const NetworkStatus: React.FC<NetworkStatusProps> = ({
  isConnected,
  onRetry,
  isRetrying = false,
  errorMessage
}) => {
  const { getResponsivePadding, getResponsiveFontSize, getResponsiveSize } = useDimensions();
  const theme = useAppTheme();
  
  if (isConnected) {
    return null; // No mostrar nada si está conectado
  }

  const getStatusIcon = () => {
    if (isRetrying) return 'arrow.clockwise';
    return 'wifi.slash';
  };

  const getStatusColor = () => {
    if (isRetrying) return theme.colors.warning;
    return theme.colors.error;
  };

  const getStatusText = () => {
    if (isRetrying) return 'Reintentando conexión...';
    if (errorMessage?.includes('Network request failed')) {
      return 'Servidor del reloj no disponible';
    }
    return 'Sin conexión al reloj';
  };

  const getSubText = () => {
    if (errorMessage?.includes('Network request failed')) {
      return `Verifica que el servidor esté ejecutándose en ${API_CONFIG.WATCH_SERVER_URL}`;
    }
    return '';
  };

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: getResponsivePadding(16, 20, 24),
      marginBottom: getResponsivePadding(8, 12, 16),
    },
    statusCard: {
      backgroundColor: theme.isDark ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)',
      borderRadius: getResponsiveSize(10, 12, 14),
      padding: getResponsivePadding(12, 16, 20),
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255,107,107,0.4)' : 'rgba(255,107,107,0.3)',
      alignItems: 'center',
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(6, 8, 10),
      gap: getResponsivePadding(6, 8, 10),
    },
    statusTitle: {
      fontSize: getResponsiveFontSize(14, 16, 18),
      fontWeight: '600',
      color: theme.colors.error,
      textAlign: 'center',
    },
    statusSubtext: {
      fontSize: getResponsiveFontSize(11, 13, 15),
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: getResponsivePadding(8, 12, 16),
      lineHeight: getResponsiveSize(16, 18, 20),
    },
    retryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? 'rgba(0,122,255,0.2)' : 'rgba(0,122,255,0.1)',
      paddingVertical: getResponsivePadding(6, 8, 10),
      paddingHorizontal: getResponsivePadding(12, 16, 20),
      borderRadius: getResponsiveSize(6, 8, 10),
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(0,122,255,0.4)' : 'rgba(0,122,255,0.3)',
      gap: getResponsivePadding(4, 6, 8),
    },
    retryButtonDisabled: {
      backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.05)',
      borderColor: theme.isDark ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.1)',
    },
    retryButtonText: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      fontWeight: '600',
      color: theme.colors.info,
    },
    retryButtonTextDisabled: {
      color: theme.colors.textTertiary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <IconSymbol 
            name={getStatusIcon()} 
            size={getResponsiveSize(20, 24, 28)} 
            color={getStatusColor()} 
          />
          <Text style={styles.statusTitle}>{getStatusText()}</Text>
        </View>
        
        {getSubText() ? <Text style={styles.statusSubtext}>{getSubText()}</Text> : null}
        
        <Pressable 
          style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]} 
          onPress={onRetry}
          disabled={isRetrying}
        >
          <IconSymbol 
            name="arrow.clockwise" 
            size={getResponsiveSize(14, 16, 18)} 
            color={isRetrying ? theme.colors.textTertiary : theme.colors.info} 
          />
          <Text style={[styles.retryButtonText, isRetrying && styles.retryButtonTextDisabled]}>
            {isRetrying ? 'Reintentando...' : 'Reintentar'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};
