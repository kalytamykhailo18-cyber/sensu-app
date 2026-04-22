import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEviewStatus } from '@/hooks/useEviewData';
import { DeviceAssociation } from '@/types/watch';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

interface EviewDeviceCardProps {
  device: DeviceAssociation;
  onPress?: () => void;
  onUnlink?: () => void;
}

export function EviewDeviceCard({ device, onPress, onUnlink }: EviewDeviceCardProps) {
  const theme = useAppTheme();
  const { status, loading } = useEviewStatus(device.device_id);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 16,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    deviceInfo: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
    },
    imei: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: 'monospace',
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusOnline: {
      backgroundColor: theme.colors.success + '20',
    },
    statusOffline: {
      backgroundColor: theme.colors.error + '20',
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
    },
    statusDotOnline: {
      backgroundColor: theme.colors.success,
    },
    statusDotOffline: {
      backgroundColor: theme.colors.error,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
    },
    statusTextOnline: {
      color: theme.colors.success,
    },
    statusTextOffline: {
      color: theme.colors.error,
    },
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
    },
    detailValue: {
      fontSize: 13,
      fontWeight: '500',
      color: theme.colors.text,
    },
    batteryLow: {
      color: theme.colors.error,
    },
    batteryMedium: {
      color: theme.colors.warning,
    },
    batteryGood: {
      color: theme.colors.success,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: 12,
      gap: 12,
    },
    actionButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    detailsButton: {
      backgroundColor: theme.colors.primary + '15',
    },
    unlinkButton: {
      backgroundColor: theme.colors.error + '15',
    },
    actionButtonText: {
      fontSize: 13,
      fontWeight: '600',
    },
    detailsButtonText: {
      color: theme.colors.primary,
    },
    unlinkButtonText: {
      color: theme.colors.error,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 8,
    },
    linkedDate: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
  });

  const isOnline = status?.online ?? false;
  const battery = status?.battery;

  const getBatteryStyle = (batteryLevel: number | undefined) => {
    if (batteryLevel === undefined) return {};
    if (batteryLevel <= 20) return styles.batteryLow;
    if (batteryLevel <= 50) return styles.batteryMedium;
    return styles.batteryGood;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.deviceInfo}>
          <ThemedText style={styles.label}>
            {device.label || 'Botón de Emergencia'}
          </ThemedText>
          <ThemedText style={styles.imei}>IMEI: {device.device_id}</ThemedText>
          <ThemedText style={styles.linkedDate}>
            Vinculado: {formatDate(device.linked_at)}
          </ThemedText>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        ) : (
          <View
            style={[
              styles.statusBadge,
              isOnline ? styles.statusOnline : styles.statusOffline,
            ]}
          >
            <View
              style={[
                styles.statusDot,
                isOnline ? styles.statusDotOnline : styles.statusDotOffline,
              ]}
            />
            <ThemedText
              style={[
                styles.statusText,
                isOnline ? styles.statusTextOnline : styles.statusTextOffline,
              ]}
            >
              {isOnline ? 'En línea' : 'Desconectado'}
            </ThemedText>
          </View>
        )}
      </View>

      {status && !loading && (
        <>
          {battery != null && (
            <View style={styles.detailsRow}>
              <ThemedText style={styles.detailLabel}>Batería</ThemedText>
              <ThemedText style={[styles.detailValue, getBatteryStyle(battery)]}>
                {battery}%{status.is_charging ? ' (Cargando)' : ''}
              </ThemedText>
            </View>
          )}

          {status.signal_strength !== undefined && (
            <View style={styles.detailsRow}>
              <ThemedText style={styles.detailLabel}>Señal</ThemedText>
              <ThemedText style={styles.detailValue}>
                {status.signal_strength}/31
              </ThemedText>
            </View>
          )}

          {status.latitude && status.longitude && (
            <View style={styles.detailsRow}>
              <ThemedText style={styles.detailLabel}>Ubicación</ThemedText>
              <ThemedText style={styles.detailValue}>
                {status.latitude.toFixed(4)}, {status.longitude.toFixed(4)}
              </ThemedText>
            </View>
          )}
        </>
      )}

      <View style={styles.actions}>
        {onPress && (
          <Pressable
            style={[styles.actionButton, styles.detailsButton]}
            onPress={onPress}
          >
            <ThemedText style={[styles.actionButtonText, styles.detailsButtonText]}>
              Ver detalles
            </ThemedText>
          </Pressable>
        )}

        {onUnlink && (
          <Pressable
            style={[styles.actionButton, styles.unlinkButton]}
            onPress={onUnlink}
          >
            <ThemedText style={[styles.actionButtonText, styles.unlinkButtonText]}>
              Desvincular
            </ThemedText>
          </Pressable>
        )}
      </View>
    </View>
  );
}
