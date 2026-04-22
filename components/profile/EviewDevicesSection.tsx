import { EviewDeviceCard } from '@/components/eview-setup';
import { Button } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';

export function EviewDevicesSection() {
  const theme = useAppTheme();
  const { watches: devices, isLoadingWatches: loading, hasApiError, unlinkWatch } = useWatchConfig();
  const hasDevices = devices.length > 0;
  const error = hasApiError ? 'Error al cargar dispositivos' : null;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 16,
      marginBottom: 16,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 20,
    },
    errorContainer: {
      padding: 16,
      backgroundColor: theme.colors.error + '15',
      borderRadius: 12,
      marginBottom: 16,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      fontSize: 14,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 24,
    },
    emptyIcon: {
      fontSize: 48,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    devicesContainer: {
      marginBottom: 16,
    },
    addButtonContainer: {
      marginTop: 8,
    },
  });

  const handleAddDevice = () => {
    router.push('/eview-setup' as any);
  };

  const handleUnlink = (deviceId: string, label?: string | null) => {
    Alert.alert(
      'Desvincular Botón',
      `¿Estás seguro de que deseas desvincular "${label || deviceId}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkWatch(deviceId);
              Alert.alert('Listo', 'El botón ha sido desvinculado.');
            } catch {
              Alert.alert('Error', 'No se pudo desvincular el botón.');
            }
          },
        },
      ]
    );
  };

  const handleDevicePress = (deviceId: string) => {
    router.push(`/eview-details/${deviceId}` as any);
  };

  if (loading && !hasDevices) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={{ marginTop: 12, color: theme.colors.textSecondary }}>
            Cargando botones de emergencia...
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {!hasDevices ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyIcon}>🔔</ThemedText>
          <ThemedText style={styles.emptyTitle}>
            Sin botones de emergencia
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Vincula un botón de emergencia Eview para recibir alertas cuando sea presionado.
          </ThemedText>
          <Button
            title="Agregar Botón"
            onPress={handleAddDevice}
            icon="plus.circle"
            variant="primary"
          />
        </View>
      ) : (
        <>
          <View style={styles.devicesContainer}>
            {devices.map((device) => (
              <EviewDeviceCard
                key={device.device_id}
                device={device}
                onPress={() => handleDevicePress(device.device_id)}
                onUnlink={() => handleUnlink(device.device_id, device.label)}
              />
            ))}
          </View>

          <View style={styles.addButtonContainer}>
            <Button
              title="Agregar Otro Botón"
              onPress={handleAddDevice}
              icon="plus.circle"
              variant="outline"
            />
          </View>
        </>
      )}
    </View>
  );
}
