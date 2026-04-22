import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { DeviceService } from '@/services/deviceService';
import { EviewStatus } from '@/types/watch';
import { createLogger, LogContext } from '@/utils/logger';
import { useWatchConfig } from './WatchConfigContext';

const logger = createLogger(LogContext.CONFIG);

const POLL_INTERVAL = 30_000; // 30 seconds — single cadence for the whole app

interface DeviceStatusContextType {
  /** Status map: device_id → EviewStatus */
  statuses: Map<string, EviewStatus>;
  /** Convenience: status for the currently active device */
  activeStatus: EviewStatus | null;
  /** True only during the very first fetch */
  loading: boolean;
  /** Last error message, if any */
  error: string | null;
  /** Whether the active device is offline */
  isActiveDeviceOffline: boolean;
  /** Force-refresh all statuses right now */
  refresh: () => Promise<void>;
}

const DeviceStatusContext = createContext<DeviceStatusContextType | undefined>(undefined);

export function DeviceStatusProvider({ children }: { children: ReactNode }) {
  const { watchImei, watches } = useWatchConfig();
  const [statuses, setStatuses] = useState<Map<string, EviewStatus>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialFetchDone = useRef(false);

  const fetchAllStatuses = useCallback(async () => {
    if (watches.length === 0) {
      setStatuses(new Map());
      setLoading(false);
      initialFetchDone.current = true;
      return;
    }

    // Only show loading spinner on first fetch
    if (!initialFetchDone.current) {
      setLoading(true);
    }

    try {
      const newStatuses = new Map<string, EviewStatus>();

      for (const device of watches) {
        try {
          const timeout = (ms: number) => new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), ms)
          );
          // Local DB (cached) status as baseline — 8s timeout
          let data = await Promise.race([
            DeviceService.getEviewStatus(device.device_id),
            timeout(8000),
          ]);
          // Real-time status from EVMars API — 8s timeout
          const realtime = await Promise.race([
            DeviceService.getEviewRealtimeStatus(device.device_id),
            timeout(8000),
          ]);

          if (realtime) {
            data = { ...data, ...realtime, online: realtime.online };
          }

          if (data) {
            newStatuses.set(device.device_id, data);
          }
        } catch {
          // Skip individual device failures (includes timeouts)
        }
      }

      setStatuses(newStatuses);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener estado de dispositivos';
      setError(msg);
      logger.error('DeviceStatusContext fetch error:', msg);
    } finally {
      setLoading(false);
      initialFetchDone.current = true;
    }
  }, [watches]);

  // Fetch on mount + whenever the watch list changes, then poll
  useEffect(() => {
    initialFetchDone.current = false;
    fetchAllStatuses();

    const interval = setInterval(fetchAllStatuses, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAllStatuses]);

  const activeStatus = watchImei ? statuses.get(watchImei) ?? null : null;
  const isActiveDeviceOffline = activeStatus ? !activeStatus.online : true;

  return (
    <DeviceStatusContext.Provider
      value={{ statuses, activeStatus, loading, error, isActiveDeviceOffline, refresh: fetchAllStatuses }}
    >
      {children}
    </DeviceStatusContext.Provider>
  );
}

export function useDeviceStatus() {
  const ctx = useContext(DeviceStatusContext);
  if (!ctx) {
    throw new Error('useDeviceStatus must be used within DeviceStatusProvider');
  }
  return ctx;
}
