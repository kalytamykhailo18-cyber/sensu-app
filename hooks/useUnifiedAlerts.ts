import { DeviceService } from '@/services/deviceService';
import { EviewButtonPressEvent, EviewButtonType, UnifiedAlarm } from '@/types/watch';
import { logger } from '@/utils/logger/logger';
import { useCallback, useEffect, useState } from 'react';

/**
 * Hook para obtener alertas unificadas de dispositivos Eview
 * Obtiene eventos de botón (SOS, laterales, etc.)
 */
export function useUnifiedAlerts(options?: {
  limit?: number;
  autoRefreshInterval?: number;
}) {
  const {
    limit = 50,
    autoRefreshInterval = 60000,
  } = options || {};

  const [alerts, setAlerts] = useState<UnifiedAlarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Convierte un tipo de botón Eview a prioridad
   */
  const getEviewButtonPriority = useCallback((buttonType: EviewButtonType): UnifiedAlarm['priority'] => {
    switch (buttonType) {
      case 'SOS Button':
        return 'critical';
      case 'Side Call Button 1':
      case 'Side Call Button 2':
        return 'high';
      case 'SOS Ending':
      case 'SOS Stop':
        return 'medium';
      default:
        return 'medium';
    }
  }, []);

  /**
   * Obtiene el mensaje descriptivo para un evento de botón Eview
   */
  const getEviewButtonMessage = useCallback((buttonType: EviewButtonType, deviceName?: string): string => {
    const device = deviceName || 'Dispositivo Eview';
    switch (buttonType) {
      case 'SOS Button':
        return `Botón SOS presionado en ${device}`;
      case 'Side Call Button 1':
        return `Botón lateral 1 presionado en ${device}`;
      case 'Side Call Button 2':
        return `Botón lateral 2 presionado en ${device}`;
      case 'SOS Ending':
        return `Alerta SOS finalizada en ${device}`;
      case 'SOS Stop':
        return `Alerta SOS detenida en ${device}`;
      default:
        return `Evento de botón en ${device}`;
    }
  }, []);

  /**
   * Convierte un evento de botón Eview a formato unificado
   */
  const convertEviewButtonEvent = useCallback((event: EviewButtonPressEvent): UnifiedAlarm => {
    return {
      id: `eview_${event.id}`,
      device_id: event.device_id,
      device_type: 'eview_button',
      device_name: event.device_name,
      type: 'button_press',
      button_type: event.button_type,
      status: 'active',
      timestamp: event.timestamp,
      message: getEviewButtonMessage(event.button_type, event.device_name),
      priority: getEviewButtonPriority(event.button_type),
      location: event.latitude && event.longitude ? {
        latitude: event.latitude,
        longitude: event.longitude,
        accuracy_meters: event.accuracy_meters,
      } : undefined,
      battery: event.battery,
    };
  }, [getEviewButtonMessage, getEviewButtonPriority]);

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const eviewEvents = await DeviceService.getEviewButtonPressEvents(undefined, limit);
      const allAlerts = eviewEvents.map(convertEviewButtonEvent);

      // Ordenar por timestamp (más recientes primero)
      allAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setAlerts(allAlerts.slice(0, limit));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener alertas';
      setError(errorMessage);
      logger.error('Error en useUnifiedAlerts:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit, convertEviewButtonEvent]);

  const refresh = useCallback(async () => {
    await fetchAlerts();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();

    // Auto-refresh si está configurado
    if (autoRefreshInterval > 0) {
      const interval = setInterval(fetchAlerts, autoRefreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchAlerts, autoRefreshInterval]);

  // Contar alertas por prioridad
  const criticalCount = alerts.filter(a => a.priority === 'critical').length;
  const highCount = alerts.filter(a => a.priority === 'high').length;
  const mediumCount = alerts.filter(a => a.priority === 'medium').length;
  const lowCount = alerts.filter(a => a.priority === 'low').length;

  // Contar alertas de dispositivos
  const eviewAlertsCount = alerts.filter(a => a.device_type === 'eview_button').length;

  // Obtener la alerta más reciente crítica
  const latestCriticalAlert = alerts.find(a => a.priority === 'critical') || null;

  return {
    alerts,
    loading,
    error,
    refresh,
    // Contadores
    totalCount: alerts.length,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    eviewAlertsCount,
    // Helpers
    latestCriticalAlert,
    hasCriticalAlerts: criticalCount > 0,
    hasAlerts: alerts.length > 0,
  };
}

/**
 * Hook simplificado para obtener solo alertas críticas de emergencia
 */
export function useEmergencyAlerts(autoRefreshInterval: number = 30000) {
  const { alerts, loading, error, refresh, criticalCount, latestCriticalAlert } = useUnifiedAlerts({
    limit: 20,
    autoRefreshInterval,
  });

  // Filtrar solo alertas críticas
  const emergencyAlerts = alerts.filter(a => a.priority === 'critical');

  return {
    alerts: emergencyAlerts,
    loading,
    error,
    refresh,
    count: criticalCount,
    latestAlert: latestCriticalAlert,
    hasEmergencies: criticalCount > 0,
  };
}
