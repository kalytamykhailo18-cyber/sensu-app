import { API_CONFIG, getAuthHeaders } from '@/config/api';
import {
  CommandResponse,
  DeviceAssociation,
  DeviceType,
  EviewButtonPressEvent,
  EviewEvent,
  EviewEventsParams,
  EviewLocation,
  EviewMQTTStatus,
  EviewStatus,
  LinkDeviceRequest,
} from '@/types/watch';
import type {
  FallDetectionConfig,
  FallDetectionConfigRequest,
  GeofenceConfig,
  GeofenceRequest,
  BatteryConfig,
  DeviceAlert,
  DeviceAlertsParams,
  DeviceContactsResponse,
  DeviceContactRequest,
} from '@/types/device';
import { router } from 'expo-router';
import { AuthService } from './authService';
import { createLogger, LogContext } from '@/utils/logger';

const logger = createLogger(LogContext.WATCH);

/**
 * Handles 401 Unauthorized responses by attempting a token refresh first.
 * Only logs out and redirects if the refresh also fails.
 * Returns true if the token was successfully refreshed (caller should retry).
 */
async function handleUnauthorized(): Promise<boolean> {
  logger.warn('Token JWT expirado o inválido - intentando refrescar');
  try {
    const refreshed = await AuthService.refreshAccessToken();
    if (refreshed) {
      logger.info('Token refrescado exitosamente, reintentando petición');
      return true;
    }
    // Refresh failed — force logout
    logger.warn('Refresh token inválido, cerrando sesión');
    await AuthService.logout();
    router.replace('/login');
    return false;
  } catch (error) {
    logger.error('Error al manejar sesión no autorizada', error as Error);
    await AuthService.logout();
    router.replace('/login');
    return false;
  }
}

/**
 * Wrapper around fetch that adds auth headers, handles 401 with token refresh,
 * and retries the request once after a successful refresh.
 */
async function fetchWithAuth(
  url: string,
  init: RequestInit = {},
  timeout = 10000,
): Promise<Response> {
  const doFetch = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const authHeaders = await getAuthHeaders();
    const response = await fetch(url, {
      ...init,
      headers: { ...authHeaders, ...(init.headers as Record<string, string>) },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  };

  let response = await doFetch();

  if (response.status === 401) {
    const refreshed = await handleUnauthorized();
    if (refreshed) {
      response = await doFetch();
    }
  }

  return response;
}

/**
 * Service for Eview button device operations.
 * Handles device management, status, events, MQTT, and configuration.
 */
export class DeviceService {

  // ─── Health Check ───────────────────────────────────────────────────────────

  /**
   * Check if the API server is reachable
   */
  static async checkServerHealth(serverUrl?: string): Promise<boolean> {
    try {
      const url = serverUrl || API_CONFIG.WATCH_SERVER_URL;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${url}/api/health`, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      logger.error('Error al verificar el estado del servidor', error as Error);
      return false;
    }
  }

  // ─── Device Management ──────────────────────────────────────────────────────

  /**
   * Get all devices linked to the authenticated user
   */
  static async getUserDevices(): Promise<DeviceAssociation[]> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/user/devices`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al obtener dispositivos del usuario', error as Error);
      return [];
    }
  }

  /**
   * Get only Eview button devices linked to the user
   */
  static async getUserEviewDevices(): Promise<DeviceAssociation[]> {
    try {
      const allDevices = await this.getUserDevices();
      // API returns 'PENDANT' for Eview buttons
      return allDevices.filter(d => d.device_type === 'PENDANT');
    } catch (error) {
      logger.error('Error al obtener dispositivos Eview del usuario', error as Error);
      return [];
    }
  }

  /**
   * Link a device to the authenticated user
   */
  static async linkDevice(
    deviceId: string,
    deviceType: DeviceType,
    label?: string,
    productId?: string
  ): Promise<DeviceAssociation | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/user/devices/link`;

      const requestBody: LinkDeviceRequest = {
        device_id: deviceId,
        device_type: deviceType,
        label: label || null,
        product_id: productId || null,
      };

      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al vincular dispositivo', error as Error);
      return null;
    }
  }

  /**
   * Link an Eview button device (convenience method)
   */
  static async linkEviewDevice(
    deviceId: string,
    label?: string,
    productId: string = 'fae'
  ): Promise<DeviceAssociation | null> {
    return this.linkDevice(deviceId, 'eview_button', label, productId);
  }

  /**
   * Unlink a device from the authenticated user
   */
  static async unlinkDevice(deviceId: string): Promise<{ detail: string } | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/user/devices/${deviceId}`;
      const response = await fetchWithAuth(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al desvincular dispositivo', error as Error);
      return null;
    }
  }

  // ─── Device Status & Location ───────────────────────────────────────────────

  /**
   * Get cached status for an Eview device
   */
  static async getEviewStatus(deviceId: string): Promise<EviewStatus | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/${deviceId}/status`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al obtener estado del dispositivo Eview', error as Error);
      return null;
    }
  }

  /**
   * Get real-time status from EVMars API (use when cached status is stale)
   */
  static async getEviewRealtimeStatus(deviceId: string): Promise<EviewStatus | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/${deviceId}/realtime`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' }, 15000);

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data = await response.json();

      const status: EviewStatus = {
        device_id: data.device_id,
        device_name: data.device_name,
        battery: data.battery,
        signal_strength: data.signal,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy_meters: data.accuracy_meters,
        is_gps: data.is_gps,
        is_wifi: data.is_wifi,
        is_gsm: data.is_gsm,
        is_charging: data.is_charging,
        is_motion: data.is_motion,
        work_mode: data.work_mode,
        last_event_time: data.timestamp,
        online: data.online ?? false,
      };

      return status;
    } catch (error) {
      logger.error('Error al obtener estado en tiempo real desde EVMars', error as Error);
      return null;
    }
  }

  /**
   * Get last known location for an Eview device
   */
  static async getEviewLocation(deviceId: string): Promise<EviewLocation | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/${deviceId}/location`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al obtener ubicación del dispositivo Eview', error as Error);
      return null;
    }
  }

  // ─── Events ─────────────────────────────────────────────────────────────────

  /**
   * Get events for an Eview device
   */
  static async getEviewEvents(params: EviewEventsParams): Promise<EviewEvent[]> {
    try {
      const { device_id, limit, offset, event_type } = params;

      const queryParams = new URLSearchParams();
      if (limit !== undefined) queryParams.append('limit', limit.toString());
      if (offset !== undefined) queryParams.append('offset', offset.toString());
      if (event_type) queryParams.append('event_type', event_type);

      const baseEndpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/${device_id}/events`;
      const endpoint = queryParams.toString()
        ? `${baseEndpoint}?${queryParams.toString()}`
        : baseEndpoint;

      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al obtener eventos del dispositivo Eview', error as Error);
      return [];
    }
  }

  /**
   * Get button press events (SOS, side buttons, etc.)
   */
  static async getEviewButtonPressEvents(
    deviceId?: string,
    limit?: number,
    offset?: number
  ): Promise<EviewButtonPressEvent[]> {
    try {
      const queryParams = new URLSearchParams();
      if (deviceId) queryParams.append('device_id', deviceId);
      if (limit !== undefined) queryParams.append('limit', limit.toString());
      if (offset !== undefined) queryParams.append('offset', offset.toString());

      const baseEndpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/button-events`;
      const endpoint = queryParams.toString()
        ? `${baseEndpoint}?${queryParams.toString()}`
        : baseEndpoint;

      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al obtener eventos de botón Eview', error as Error);
      return [];
    }
  }

  // ─── MQTT Service Control ───────────────────────────────────────────────────

  /**
   * Get MQTT service status
   */
  static async getEviewMQTTStatus(): Promise<EviewMQTTStatus | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/mqtt/status`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error al obtener estado del servicio MQTT Eview', error as Error);
      return null;
    }
  }

  /**
   * Start the MQTT subscriber service
   */
  static async startEviewMQTT(): Promise<CommandResponse> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/mqtt/start`;
      const response = await fetchWithAuth(endpoint, { method: 'POST' }, 15000);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, message: 'Servicio MQTT Eview iniciado exitosamente', data };
    } catch (error) {
      logger.error('Error al iniciar servicio MQTT Eview', error as Error);

      let errorMessage = 'Error desconocido al iniciar servicio MQTT Eview';
      if (error instanceof Error) {
        if (error.name === 'AbortError') errorMessage = 'Timeout al iniciar servicio MQTT Eview';
        else if (error.message.includes('Network request failed')) errorMessage = 'Error de red al iniciar servicio MQTT Eview';
        else if (error.message.includes('HTTP:')) errorMessage = error.message;
      }

      return { success: false, message: errorMessage };
    }
  }

  /**
   * Stop the MQTT subscriber service
   */
  static async stopEviewMQTT(): Promise<CommandResponse> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/eview/mqtt/stop`;
      const response = await fetchWithAuth(endpoint, { method: 'POST' }, 15000);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, message: 'Servicio MQTT Eview detenido exitosamente', data };
    } catch (error) {
      logger.error('Error al detener servicio MQTT Eview', error as Error);

      let errorMessage = 'Error desconocido al detener servicio MQTT Eview';
      if (error instanceof Error) {
        if (error.name === 'AbortError') errorMessage = 'Timeout al detener servicio MQTT Eview';
        else if (error.message.includes('Network request failed')) errorMessage = 'Error de red al detener servicio MQTT Eview';
        else if (error.message.includes('HTTP:')) errorMessage = error.message;
      }

      return { success: false, message: errorMessage };
    }
  }

  // ─── Device Configuration ───────────────────────────────────────────────────

  /**
   * Get fall detection configuration
   */
  static async getDeviceFallDetectionConfig(deviceId: string): Promise<FallDetectionConfig | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/fall-detection/config`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting fall detection config', error as Error);
      return null;
    }
  }

  /**
   * Update fall detection configuration
   */
  static async setDeviceFallDetectionConfig(
    deviceId: string,
    config: FallDetectionConfigRequest
  ): Promise<FallDetectionConfig | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/fall-detection/config`;
      const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating fall detection config', error as Error);
      return null;
    }
  }

  /**
   * Get all geofences for a device
   */
  static async getGeofences(deviceId: string): Promise<GeofenceConfig[]> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/geofences`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting geofences', error as Error);
      return [];
    }
  }

  /**
   * Create a new geofence
   */
  static async createGeofence(
    deviceId: string,
    geofence: GeofenceRequest
  ): Promise<GeofenceConfig | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/geofences`;
      const response = await fetchWithAuth(endpoint, {
        method: 'POST',
        body: JSON.stringify(geofence),
      }, 15000);

      if (!response.ok) {
        if (response.status === 409) throw new Error('Máximo 4 geocercas por dispositivo');
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error creating geofence', error as Error);
      throw error;
    }
  }

  /**
   * Update an existing geofence
   */
  static async updateGeofence(
    deviceId: string,
    zoneNumber: number,
    geofence: GeofenceRequest
  ): Promise<GeofenceConfig | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/geofences/${zoneNumber}`;
      const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(geofence),
      }, 15000);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating geofence', error as Error);
      throw error;
    }
  }

  /**
   * Delete a geofence zone
   */
  static async deleteGeofence(deviceId: string, zoneNumber: number): Promise<boolean> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/geofences/${zoneNumber}`;
      const response = await fetchWithAuth(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      logger.error('Error deleting geofence', error as Error);
      return false;
    }
  }

  /**
   * Force sync all geofences to device
   */
  static async syncGeofences(deviceId: string): Promise<{ synced: boolean; results?: any[] }> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/geofences/sync`;
      const response = await fetchWithAuth(endpoint, { method: 'POST' }, 20000);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return { synced: data.all_synced ?? true, results: data.results };
    } catch (error) {
      logger.error('Error syncing geofences', error as Error);
      return { synced: false };
    }
  }

  /**
   * Get battery alert configuration
   */
  static async getBatteryConfig(deviceId: string): Promise<BatteryConfig | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/battery/config`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting battery config', error as Error);
      return null;
    }
  }

  /**
   * Update battery alert threshold
   */
  static async setBatteryConfig(
    deviceId: string,
    config: { threshold: number }
  ): Promise<BatteryConfig | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/battery/config`;
      const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error updating battery config', error as Error);
      return null;
    }
  }

  // ─── Contacts ──────────────────────────────────────────────────────────────

  /**
   * Get all contact number slots for a device
   */
  static async getDeviceContacts(deviceId: string): Promise<DeviceContactsResponse | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/contacts`;
      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        if (response.status === 502) throw new Error('DEVICE_OFFLINE');
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting device contacts', error as Error);
      throw error;
    }
  }

  /**
   * Set a contact number on a specific slot (0-9)
   */
  static async setDeviceContact(
    deviceId: string,
    contact: DeviceContactRequest
  ): Promise<any | null> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/contacts/${contact.index}`;
      const response = await fetchWithAuth(endpoint, {
        method: 'PUT',
        body: JSON.stringify(contact),
      }, 15000);

      if (!response.ok) {
        if (response.status === 502) throw new Error('DEVICE_OFFLINE');
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error setting device contact', error as Error);
      throw error;
    }
  }

  /**
   * Delete (clear) a contact number slot
   */
  static async deleteDeviceContact(deviceId: string, index: number): Promise<boolean> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/contacts/${index}`;
      const response = await fetchWithAuth(endpoint, { method: 'DELETE' });

      if (!response.ok) {
        if (response.status === 502) throw new Error('DEVICE_OFFLINE');
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      logger.error('Error deleting device contact', error as Error);
      throw error;
    }
  }

  // ─── Alerts ─────────────────────────────────────────────────────────────────

  /**
   * Get unified device alerts with filtering
   */
  static async getDeviceAlerts(params: DeviceAlertsParams): Promise<DeviceAlert[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params.event_type) queryParams.set('event_type', params.event_type);
      if (params.start_date) queryParams.set('start_date', params.start_date);
      if (params.end_date) queryParams.set('end_date', params.end_date);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.offset) queryParams.set('offset', params.offset.toString());

      const queryString = queryParams.toString();
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${params.device_id}/alerts${queryString ? `?${queryString}` : ''}`;

      const response = await fetchWithAuth(endpoint, { method: 'GET' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      logger.error('Error getting device alerts', error as Error);
      return [];
    }
  }

  // ─── Device Actions ─────────────────────────────────────────────────────────

  /**
   * Make device beep/vibrate to locate it
   */
  static async findDevice(deviceId: string): Promise<boolean> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/find`;
      const response = await fetchWithAuth(endpoint, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      logger.error('Error finding device', error as Error);
      return false;
    }
  }

  /**
   * Request immediate location update from device
   */
  static async locateDevice(deviceId: string): Promise<boolean> {
    try {
      const endpoint = `${API_CONFIG.WATCH_SERVER_URL}/api/device/${deviceId}/locate`;
      const response = await fetchWithAuth(endpoint, { method: 'POST' });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return true;
    } catch (error) {
      logger.error('Error requesting device location', error as Error);
      return false;
    }
  }

  /**
   * Get communication logs from the device server
   */
  static async getCommunicationLogs(
    options?: { limit?: number; serverUrl?: string }
  ): Promise<string | null> {
    try {
      const url = options?.serverUrl || API_CONFIG.WATCH_SERVER_URL;

      if (!url) {
        throw new Error('WATCH_SERVER_URL no está configurado');
      }

      const sanitizedLimit =
        typeof options?.limit === 'number' && Number.isFinite(options.limit) && options.limit > 0
          ? Math.floor(options.limit)
          : undefined;
      const endpoint = sanitizedLimit
        ? `${url}/api/logs?limit=${encodeURIComponent(String(sanitizedLimit))}`
        : `${url}/api/logs`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'text/plain' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
      }

      return await response.text();
    } catch (error) {
      logger.error('Error al obtener los logs de comunicación', error as Error);
      return null;
    }
  }
}
