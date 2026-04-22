import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { PROVIDER_GOOGLE, Region } from 'react-native-maps';

import { API_CONFIG } from '@/config/api';
import { useDeviceStatus } from '@/contexts/DeviceStatusContext';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { WatchLocation } from '@/types/watch';

// Device location info for map markers
export interface DeviceLocation {
  id: string;
  name: string;
  type: 'watch' | 'eview_button';
  latitude: number;
  longitude: number;
  battery?: number;
  online: boolean;
  timestamp?: string;
}

interface UseMapsReturn {
  mapProvider: typeof PROVIDER_GOOGLE | undefined;
  initialRegion: Region;
  currentRegion: Region | undefined;
  isLoading: boolean;
  error: string | null;
  isConnected: boolean;
  refreshLocation: () => Promise<void>;
  batteryLevel: number;
  watchLocation: WatchLocation | null;
  isWatchOffline: boolean;
  deviceLocations: DeviceLocation[];
  hasAnyDevice: boolean;
  primaryDevice: DeviceLocation | null;
}

/**
 * Hook personalizado para manejar la configuración y estado del mapa
 * Muestra ubicaciones de dispositivos Eview
 */
export function useMaps(): UseMapsReturn {
  const { watches: eviewDevices, isLoadingWatches: eviewDevicesLoading } = useWatchConfig();
  const { statuses: deviceStatuses, loading: statusLoading, refresh: refreshStatuses } = useDeviceStatus();
  const [currentRegion, setCurrentRegion] = useState<Region | undefined>(undefined);

  // Configuración del proveedor del mapa
  const mapProvider = Platform.OS === 'ios' ? undefined : PROVIDER_GOOGLE;

  // Región inicial por defecto
  const initialRegion: Region = {
    latitude: API_CONFIG.DEFAULT_LOCATION.latitude,
    longitude: API_CONFIG.DEFAULT_LOCATION.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // Build device locations array from shared context statuses
  const deviceLocations = useMemo((): DeviceLocation[] => {
    const locations: DeviceLocation[] = [];

    for (const device of eviewDevices) {
      const status = deviceStatuses.get(device.device_id);
      if (status && status.latitude && status.longitude) {
        locations.push({
          id: device.device_id,
          name: device.label || 'Botón de Emergencia',
          type: 'eview_button',
          latitude: status.latitude,
          longitude: status.longitude,
          battery: status.battery,
          online: status.online ?? false,
          timestamp: status.last_event_time,
        });
      }
    }

    return locations;
  }, [eviewDevices, deviceStatuses]);

  // Primary device is the first one with location
  const primaryDevice = useMemo(() => {
    return deviceLocations.length > 0 ? deviceLocations[0] : null;
  }, [deviceLocations]);

  // Actualizar región cuando cambie la ubicación del dispositivo primario
  useEffect(() => {
    if (primaryDevice) {
      const newRegion: Region = {
        latitude: primaryDevice.latitude,
        longitude: primaryDevice.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setCurrentRegion(newRegion);
    } else {
      setCurrentRegion(undefined);
    }
  }, [primaryDevice]);

  // Función para refrescar ubicaciones (delegates to shared context)
  const refreshLocation = useCallback(async () => {
    await refreshStatuses();
  }, [refreshStatuses]);

  const isLoading = eviewDevicesLoading || statusLoading;
  const hasAnyDevice = deviceLocations.length > 0;
  const isConnected = hasAnyDevice;

  return {
    mapProvider,
    initialRegion,
    currentRegion,
    isLoading,
    error: null,
    isConnected,
    refreshLocation,
    batteryLevel: primaryDevice?.battery || 0,
    watchLocation: null,
    isWatchOffline: false,
    deviceLocations,
    hasAnyDevice,
    primaryDevice,
  };
}
