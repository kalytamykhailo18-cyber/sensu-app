import { useDeviceStatus } from '@/contexts/DeviceStatusContext';
import { DeviceService } from '@/services/deviceService';
import {
  DeviceAssociation,
  EviewButtonPressEvent,
  EviewEvent,
  EviewLocation,
  EviewMQTTStatus,
  EviewStatus,
} from '@/types/watch';
import { logger } from '@/utils/logger/logger';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para obtener dispositivos Eview vinculados al usuario
 */
export function useEviewDevices() {
  const [devices, setDevices] = useState<DeviceAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await DeviceService.getUserEviewDevices();
      setDevices(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener dispositivos Eview';
      setError(errorMessage);
      logger.error('Error en useEviewDevices:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchDevices();
  }, [fetchDevices]);

  const linkDevice = useCallback(async (deviceId: string, label?: string, productId?: string) => {
    try {
      const result = await DeviceService.linkEviewDevice(deviceId, label, productId);
      if (result) {
        await fetchDevices();
        return result;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al vincular dispositivo Eview';
      logger.error('Error al vincular dispositivo Eview:', errorMessage);
      throw err;
    }
  }, [fetchDevices]);

  const unlinkDevice = useCallback(async (deviceId: string) => {
    try {
      const result = await DeviceService.unlinkDevice(deviceId);
      if (result) {
        await fetchDevices();
        return result;
      }
      return null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al desvincular dispositivo Eview';
      logger.error('Error al desvincular dispositivo Eview:', errorMessage);
      throw err;
    }
  }, [fetchDevices]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  return {
    devices,
    loading,
    error,
    refresh,
    linkDevice,
    unlinkDevice,
    hasDevices: devices.length > 0,
  };
}

/**
 * Hook para obtener el estado de un dispositivo Eview específico.
 * Reads from the shared DeviceStatusContext — all consumers see the same data.
 */
export function useEviewStatus(deviceId: string | null) {
  const { statuses, loading, error, refresh } = useDeviceStatus();

  const status = deviceId ? statuses.get(deviceId) ?? null : null;
  const isDeviceOffline = status ? !status.online : true;

  return {
    status,
    loading,
    error,
    refresh,
    isDeviceOffline,
  };
}

/**
 * Hook para obtener eventos de un dispositivo Eview
 */
export function useEviewEvents(deviceId: string | null, limit: number = 50) {
  const [events, setEvents] = useState<EviewEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!deviceId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await DeviceService.getEviewEvents({
        device_id: deviceId,
        limit,
      });
      setEvents(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener eventos del dispositivo Eview';
      setError(errorMessage);
      logger.error('Error en useEviewEvents:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deviceId, limit]);

  const refresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();

    // Actualizar eventos cada 2 minutos
    const interval = setInterval(fetchEvents, 120000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook para obtener la ubicación de un dispositivo Eview
 */
export function useEviewLocation(deviceId: string | null) {
  const [location, setLocation] = useState<EviewLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    if (!deviceId) {
      setLocation(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await DeviceService.getEviewLocation(deviceId);
      setLocation(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener ubicación del dispositivo Eview';
      setError(errorMessage);
      logger.error('Error en useEviewLocation:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  const refresh = useCallback(async () => {
    await fetchLocation();
  }, [fetchLocation]);

  useEffect(() => {
    fetchLocation();

    // Actualizar ubicación cada 30 segundos
    const interval = setInterval(fetchLocation, 30000);

    return () => clearInterval(interval);
  }, [fetchLocation]);

  return {
    location,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook para obtener eventos de presión de botón Eview
 */
export function useEviewButtonPressEvents(deviceId?: string, limit: number = 50) {
  const [events, setEvents] = useState<EviewButtonPressEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await DeviceService.getEviewButtonPressEvents(deviceId, limit);
      setEvents(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener eventos de botón Eview';
      setError(errorMessage);
      logger.error('Error en useEviewButtonPressEvents:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [deviceId, limit]);

  const refresh = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();

    // Actualizar eventos cada minuto (los eventos de botón son importantes)
    const interval = setInterval(fetchEvents, 60000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    refresh,
    hasEvents: events.length > 0,
    latestEvent: events.length > 0 ? events[0] : null,
  };
}

/**
 * Hook para controlar el estado del servicio MQTT de Eview
 */
export function useEviewMQTT() {
  const [status, setStatus] = useState<EviewMQTTStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await DeviceService.getEviewMQTTStatus();
      setStatus(data);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener estado del servicio MQTT';
      setError(errorMessage);
      logger.error('Error en useEviewMQTT:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  const startMQTT = useCallback(async () => {
    try {
      setActionLoading(true);
      setError(null);

      const result = await DeviceService.startEviewMQTT();
      if (result.success) {
        await fetchStatus();
      } else {
        setError(result.message ?? 'Error desconocido');
      }
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al iniciar servicio MQTT';
      setError(errorMessage);
      logger.error('Error al iniciar MQTT:', errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchStatus]);

  const stopMQTT = useCallback(async () => {
    try {
      setActionLoading(true);
      setError(null);

      const result = await DeviceService.stopEviewMQTT();
      if (result.success) {
        await fetchStatus();
      } else {
        setError(result.message ?? 'Error desconocido');
      }
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al detener servicio MQTT';
      setError(errorMessage);
      logger.error('Error al detener MQTT:', errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setActionLoading(false);
    }
  }, [fetchStatus]);

  useEffect(() => {
    fetchStatus();

    // Actualizar estado del MQTT cada 30 segundos
    const interval = setInterval(fetchStatus, 30000);

    return () => clearInterval(interval);
  }, [fetchStatus]);

  return {
    status,
    loading,
    error,
    actionLoading,
    refresh,
    startMQTT,
    stopMQTT,
    isConnected: status?.connected ?? false,
    isRunning: status?.running ?? false,
  };
}

/**
 * Hook combinado para obtener todos los datos de un dispositivo Eview
 */
export function useEviewDevice(deviceId: string | null) {
  const statusHook = useEviewStatus(deviceId);
  const locationHook = useEviewLocation(deviceId);
  const eventsHook = useEviewEvents(deviceId, 10);
  const buttonEventsHook = useEviewButtonPressEvents(deviceId ?? undefined, 10);

  const refresh = useCallback(async () => {
    await Promise.all([
      statusHook.refresh(),
      locationHook.refresh(),
      eventsHook.refresh(),
      buttonEventsHook.refresh(),
    ]);
  }, [statusHook, locationHook, eventsHook, buttonEventsHook]);

  return {
    status: statusHook.status,
    location: locationHook.location,
    events: eventsHook.events,
    buttonEvents: buttonEventsHook.events,
    loading: statusHook.loading || locationHook.loading || eventsHook.loading || buttonEventsHook.loading,
    error: statusHook.error || locationHook.error || eventsHook.error || buttonEventsHook.error,
    isDeviceOffline: statusHook.isDeviceOffline,
    latestButtonEvent: buttonEventsHook.latestEvent,
    refresh,
  };
}
