import { PROJECT_OPTIONS } from '@/config/projectOptions';
import { DeviceService } from '@/services/deviceService';
import { logger } from '@/utils/logger/logger';
import { useCallback, useMemo, useState } from 'react';

const logsFeature = PROJECT_OPTIONS.features.communicationLogs;

const clampLimit = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(Math.max(Math.floor(value), min), max);
};

export function useCommunicationLogs(initialLimit?: number) {
  const defaultLimit = logsFeature.defaultLimit;
  const minLimit = logsFeature.minLimit;
  const maxLimit = logsFeature.maxLimit;

  const startingLimit = clampLimit(
    initialLimit ?? defaultLimit,
    minLimit,
    maxLimit
  );

  const [limit, setLimit] = useState<number>(startingLimit);
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const limitsConfig = useMemo(
    () => ({
      min: minLimit,
      max: maxLimit,
      default: defaultLimit,
    }),
    [defaultLimit, maxLimit, minLimit]
  );

  const fetchLogs = useCallback(
    async (overrideLimit?: number) => {
      const requestedLimit = overrideLimit ?? limit;
      const sanitizedLimit = clampLimit(requestedLimit, minLimit, maxLimit);

      if (sanitizedLimit !== requestedLimit) {
        setError(
          `El límite debe estar entre ${minLimit} y ${maxLimit} líneas.`
        );
      } else {
        setError(null);
      }

      setLimit(sanitizedLimit);
      setLoading(true);

      try {
        const response = await DeviceService.getCommunicationLogs({
          limit: sanitizedLimit,
        });

        if (response === null) {
          setLogs('');
          setError('No se pudieron cargar los logs de comunicación.');
        } else {
          setLogs(response);
        }
      } catch (err) {
        logger.error('Error al obtener logs de comunicación', err as Error);
        setLogs('');
        setError('Ocurrió un error al cargar los logs. Inténtalo nuevamente.');
      } finally {
        setLoading(false);
      }
    },
    [limit, maxLimit, minLimit]
  );

  const resetLogs = useCallback(() => {
    setLogs('');
    setError(null);
  }, []);

  return {
    enabled: logsFeature.enabled,
    limit,
    setLimit: (value: number) => setLimit(clampLimit(value, minLimit, maxLimit)),
    logs,
    loading,
    error,
    fetchLogs,
    resetLogs,
    limitsConfig,
  };
}

