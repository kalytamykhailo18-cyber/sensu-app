/**
 * Device Configuration Hooks
 *
 * Hooks for managing EV04 button device configuration:
 * - useDeviceAlerts: Unified alert fetching with type filtering and polling
 * - useGeofences: CRUD operations for geofences
 * - useFallDetection: Fall detection config read/write
 * - useBatteryConfig: Battery threshold config read/write
 * - useContacts: CRUD for device contact phone numbers
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { DeviceService } from '@/services/deviceService';
import type {
  DeviceAlert,
  AlertType,
  FallDetectionConfig,
  FallDetectionConfigRequest,
  GeofenceConfig,
  GeofenceRequest,
  BatteryConfig,
  DeviceContact,
  DeviceContactRequest,
} from '@/types/device';

// ─── useDeviceAlerts ──────────────────────────────────────────────────────────

interface UseDeviceAlertsOptions {
  deviceId: string | null;
  eventType?: AlertType;
  limit?: number;
  pollInterval?: number; // ms, default 30000
  enabled?: boolean;
}

interface UseDeviceAlertsReturn {
  alerts: DeviceAlert[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDeviceAlerts(options: UseDeviceAlertsOptions): UseDeviceAlertsReturn {
  const { deviceId, eventType, limit = 50, pollInterval = 30000, enabled = true } = options;
  const [alerts, setAlerts] = useState<DeviceAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAlerts = useCallback(async () => {
    if (!deviceId || !enabled) return;

    try {
      setLoading(prev => prev || alerts.length === 0); // Only show loading on first fetch
      const result = await DeviceService.getDeviceAlerts({
        device_id: deviceId,
        event_type: eventType,
        limit,
      });
      setAlerts(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching alerts');
    } finally {
      setLoading(false);
    }
  }, [deviceId, eventType, limit, enabled]);

  useEffect(() => {
    fetchAlerts();

    if (enabled && pollInterval > 0) {
      intervalRef.current = setInterval(fetchAlerts, pollInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchAlerts, pollInterval, enabled]);

  return { alerts, loading, error, refresh: fetchAlerts };
}

// ─── useGeofences ─────────────────────────────────────────────────────────────

interface UseGeofencesReturn {
  geofences: GeofenceConfig[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createGeofence: (geofence: GeofenceRequest) => Promise<GeofenceConfig | null>;
  updateGeofence: (zoneNumber: number, geofence: GeofenceRequest) => Promise<GeofenceConfig | null>;
  deleteGeofence: (zoneNumber: number) => Promise<boolean>;
  syncGeofences: () => Promise<boolean>;
}

export function useGeofences(deviceId: string | null): UseGeofencesReturn {
  const [geofences, setGeofences] = useState<GeofenceConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      const result = await DeviceService.getGeofences(deviceId);
      setGeofences(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching geofences');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createGeofence = useCallback(async (geofence: GeofenceRequest): Promise<GeofenceConfig | null> => {
    if (!deviceId) return null;
    const result = await DeviceService.createGeofence(deviceId, geofence);
    if (result) {
      await refresh();
    }
    return result;
  }, [deviceId, refresh]);

  const updateGeofence = useCallback(async (zoneNumber: number, geofence: GeofenceRequest): Promise<GeofenceConfig | null> => {
    if (!deviceId) return null;
    const result = await DeviceService.updateGeofence(deviceId, zoneNumber, geofence);
    if (result) {
      await refresh();
    }
    return result;
  }, [deviceId, refresh]);

  const deleteGeofence = useCallback(async (zoneNumber: number): Promise<boolean> => {
    if (!deviceId) return false;
    const success = await DeviceService.deleteGeofence(deviceId, zoneNumber);
    if (success) {
      await refresh();
    }
    return success;
  }, [deviceId, refresh]);

  const syncGeofences = useCallback(async (): Promise<boolean> => {
    if (!deviceId) return false;
    const result = await DeviceService.syncGeofences(deviceId);
    if (result.synced) {
      await refresh();
    }
    return result.synced;
  }, [deviceId, refresh]);

  return {
    geofences,
    loading,
    error,
    refresh,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    syncGeofences,
  };
}

// ─── useFallDetection ─────────────────────────────────────────────────────────

interface UseFallDetectionReturn {
  config: FallDetectionConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateConfig: (config: FallDetectionConfigRequest) => Promise<boolean>;
}

export function useFallDetection(deviceId: string | null): UseFallDetectionReturn {
  const [config, setConfig] = useState<FallDetectionConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      const result = await DeviceService.getDeviceFallDetectionConfig(deviceId);
      setConfig(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching fall detection config');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateConfig = useCallback(async (newConfig: FallDetectionConfigRequest): Promise<boolean> => {
    if (!deviceId) return false;
    try {
      setSaving(true);
      const result = await DeviceService.setDeviceFallDetectionConfig(deviceId, newConfig);
      if (result) {
        setConfig(result);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating fall detection');
      return false;
    } finally {
      setSaving(false);
    }
  }, [deviceId]);

  return { config, loading, saving, error, refresh, updateConfig };
}

// ─── useBatteryConfig ─────────────────────────────────────────────────────────

interface UseBatteryConfigReturn {
  config: BatteryConfig | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateThreshold: (threshold: number) => Promise<boolean>;
}

export function useBatteryConfig(deviceId: string | null): UseBatteryConfigReturn {
  const [config, setConfig] = useState<BatteryConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      const result = await DeviceService.getBatteryConfig(deviceId);
      setConfig(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching battery config');
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateThreshold = useCallback(async (threshold: number): Promise<boolean> => {
    if (!deviceId) return false;
    try {
      setSaving(true);
      const result = await DeviceService.setBatteryConfig(deviceId, { threshold });
      if (result) {
        setConfig(result);
        setError(null);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating battery threshold');
      return false;
    } finally {
      setSaving(false);
    }
  }, [deviceId]);

  return { config, loading, saving, error, refresh, updateThreshold };
}

// ─── useContacts ───────────────────────────────────────────────────────────

interface UseContactsReturn {
  contacts: DeviceContact[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setContact: (contact: DeviceContactRequest) => Promise<boolean>;
  deleteContact: (index: number) => Promise<boolean>;
  getEmptySlot: () => number | null;
}

function getContactErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message === 'DEVICE_OFFLINE') {
    return 'El dispositivo esta desconectado. Enciendelo e intenta de nuevo.';
  }
  return fallback;
}

export function useContacts(deviceId: string | null): UseContactsReturn {
  const [contacts, setContacts] = useState<DeviceContact[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!deviceId) return;
    try {
      setLoading(true);
      const result = await DeviceService.getDeviceContacts(deviceId);
      if (result) {
        setContacts(result.contacts);
        setError(null);
      } else {
        setError('Error al obtener contactos del dispositivo');
      }
    } catch (err) {
      setError(getContactErrorMessage(err, 'Error al obtener contactos del dispositivo'));
    } finally {
      setLoading(false);
    }
  }, [deviceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const setContact = useCallback(async (contact: DeviceContactRequest): Promise<boolean> => {
    if (!deviceId) return false;
    try {
      setSaving(true);
      const result = await DeviceService.setDeviceContact(deviceId, contact);
      if (result) {
        await refresh();
        setError(null);
        return true;
      }
      setError('Error al guardar contacto en el dispositivo');
      return false;
    } catch (err) {
      setError(getContactErrorMessage(err, 'Error al guardar contacto en el dispositivo'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [deviceId, refresh]);

  const deleteContact = useCallback(async (index: number): Promise<boolean> => {
    if (!deviceId) return false;
    try {
      setSaving(true);
      const success = await DeviceService.deleteDeviceContact(deviceId, index);
      if (success) {
        await refresh();
        setError(null);
        return true;
      }
      setError('Error al eliminar contacto del dispositivo');
      return false;
    } catch (err) {
      setError(getContactErrorMessage(err, 'Error al eliminar contacto del dispositivo'));
      return false;
    } finally {
      setSaving(false);
    }
  }, [deviceId, refresh]);

  const getEmptySlot = useCallback((): number | null => {
    const usedSlots = new Set(
      contacts.filter(c => c.number && c.number.length > 0).map(c => c.index)
    );
    for (let i = 0; i < 10; i++) {
      if (!usedSlots.has(i)) return i;
    }
    return null;
  }, [contacts]);

  return { contacts, loading, saving, error, refresh, setContact, deleteContact, getEmptySlot };
}
