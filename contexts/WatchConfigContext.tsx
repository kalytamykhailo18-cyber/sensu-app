import { useAuth } from '@/hooks/useAuth';
import { DeviceService } from '@/services/deviceService';
import { DeviceAssociation } from '@/types/watch';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createLogger, LogContext } from '@/utils/logger';

const logger = createLogger(LogContext.CONFIG);

interface WatchConfigContextType {
  watchImei: string | null;
  watches: DeviceAssociation[];
  setWatchImei: (deviceId: string | null, label?: string) => Promise<void>;
  selectDevice: (deviceId: string) => void;
  isWatchConfigured: boolean;
  isLoadingWatches: boolean;
  hasApiError: boolean;
  clearWatchConfig: () => Promise<void>;
  refreshWatches: () => Promise<void>;
  unlinkWatch: (deviceId: string) => Promise<void>;
}

const WatchConfigContext = createContext<WatchConfigContextType | undefined>(undefined);

interface WatchConfigProviderProps {
  children: ReactNode;
}

export function WatchConfigProvider({ children }: WatchConfigProviderProps) {
  const { isAuthenticated } = useAuth();
  const [watchImei, setWatchImeiState] = useState<string | null>(null);
  const [watches, setWatches] = useState<DeviceAssociation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoadingWatches, setIsLoadingWatches] = useState(false);
  const [hasApiError, setHasApiError] = useState(false);

  const loadUserDevices = useCallback(async () => {
    setIsLoadingWatches(true);
    try {
      logger.debug('Cargando dispositivos del usuario');
      const userDevices = await DeviceService.getUserEviewDevices();
      logger.debug('Dispositivos recibidos', { devices: userDevices, count: userDevices.length });

      setWatches(userDevices);
      setHasApiError(false);

      // Establecer el primer dispositivo como el activo por defecto
      if (userDevices.length > 0) {
        logger.info('Estableciendo dispositivo activo', { deviceId: userDevices[0].device_id });
        setWatchImeiState(userDevices[0].device_id);
      } else {
        logger.info('No hay dispositivos vinculados');
        setWatchImeiState(null);
      }
    } catch (error) {
      logger.error('Error al cargar dispositivos del usuario', error as Error);
      setHasApiError(true);
    } finally {
      setIsLoadingWatches(false);
      setIsLoaded(true);
    }
  }, []);

  // Cargar dispositivos del usuario solo cuando esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadUserDevices();
    } else {
      setWatches([]);
      setWatchImeiState(null);
      setIsLoaded(true);
    }
  }, [isAuthenticated, loadUserDevices]);

  const setWatchImei = async (deviceId: string | null, label?: string) => {
    try {
      if (deviceId) {
        const linked = await DeviceService.linkEviewDevice(deviceId, label);
        if (linked) {
          await refreshWatches();
          setWatchImeiState(deviceId);
        } else {
          throw new Error('No se pudo vincular el dispositivo');
        }
      } else {
        await clearWatchConfig();
      }
    } catch (error) {
      logger.error('Error al vincular dispositivo', error as Error);
      throw error;
    }
  };

  const clearWatchConfig = async () => {
    try {
      for (const device of watches) {
        await DeviceService.unlinkDevice(device.device_id);
      }
      setWatches([]);
      setWatchImeiState(null);
    } catch (error) {
      logger.error('Error al limpiar configuración de dispositivos', error as Error);
      throw error;
    }
  };

  const refreshWatches = async () => {
    try {
      const userDevices = await DeviceService.getUserEviewDevices();
      setWatches(userDevices);
      setHasApiError(false);

      if (watchImei && !userDevices.find(d => d.device_id === watchImei)) {
        if (userDevices.length > 0) {
          setWatchImeiState(userDevices[0].device_id);
        } else {
          setWatchImeiState(null);
        }
      }
    } catch (error) {
      logger.error('Error al actualizar dispositivos', error as Error);
      setHasApiError(true);
    }
  };

  const unlinkWatch = async (deviceId: string) => {
    try {
      const result = await DeviceService.unlinkDevice(deviceId);
      if (result) {
        await refreshWatches();

        if (watchImei === deviceId) {
          const remaining = watches.filter(d => d.device_id !== deviceId);
          if (remaining.length > 0) {
            setWatchImeiState(remaining[0].device_id);
          } else {
            setWatchImeiState(null);
          }
        }
      }
    } catch (error) {
      logger.error('Error al desvincular dispositivo', error as Error);
      throw error;
    }
  };

  const selectDevice = useCallback((deviceId: string) => {
    if (watches.some(d => d.device_id === deviceId)) {
      setWatchImeiState(deviceId);
    }
  }, [watches]);

  const isWatchConfigured = Boolean(watchImei);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0B0B0F' }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <WatchConfigContext.Provider
      value={{
        watchImei,
        watches,
        setWatchImei,
        selectDevice,
        isWatchConfigured,
        isLoadingWatches,
        hasApiError,
        clearWatchConfig,
        refreshWatches,
        unlinkWatch,
      }}
    >
      {children}
    </WatchConfigContext.Provider>
  );
}

export function useWatchConfig() {
  const context = useContext(WatchConfigContext);
  if (context === undefined) {
    throw new Error('useWatchConfig debe ser usado dentro de un WatchConfigProvider');
  }
  return context;
}
