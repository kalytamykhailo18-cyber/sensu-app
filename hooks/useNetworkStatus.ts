import { API_CONFIG } from '@/config/api';
import { logger } from '@/utils/logger/logger';
import { useCallback, useEffect, useState } from 'react';

interface NetworkStatus {
  isConnected: boolean;
  isRetrying: boolean;
  lastError: string | null;
  retryCount: number;
}

export const useNetworkStatus = () => {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: false,
    isRetrying: false,
    lastError: null,
    retryCount: 0,
  });

  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${API_CONFIG.WATCH_SERVER_URL}/api/health`, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        return data?.status === 'healthy' || data?.status === 'ok' || response.status === 200;
      }

      return false;
    } catch (error) {
      logger.warn('Error checking server health:', error);
      return false;
    }
  }, []);

  const testConnection = useCallback(async () => {
    setStatus(prev => ({ ...prev, isRetrying: true }));
    
    try {
      const isHealthy = await checkServerHealth();
      
      setStatus(prev => ({
        isConnected: isHealthy,
        isRetrying: false,
        lastError: isHealthy ? null : 'Server not responding',
        retryCount: isHealthy ? 0 : prev.retryCount + 1,
      }));

      return isHealthy;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      setStatus(prev => ({
        isConnected: false,
        isRetrying: false,
        lastError: errorMessage,
        retryCount: prev.retryCount + 1,
      }));

      return false;
    }
  }, [checkServerHealth]);

  const retryConnection = useCallback(async () => {
    if (status.isRetrying) return;
    
    await testConnection();
  }, [status.isRetrying, testConnection]);

  // Auto-retry logic
  useEffect(() => {
    if (!status.isConnected && !status.isRetrying && status.retryCount < 3) {
      const retryInterval = Math.min(1000 * Math.pow(2, status.retryCount), 10000); // Exponential backoff, max 10s
      
      const timeoutId = setTimeout(() => {
        testConnection();
      }, retryInterval);

      return () => clearTimeout(timeoutId);
    }
  }, [status.isConnected, status.isRetrying, status.retryCount, testConnection]);

  // Initial connection test
  useEffect(() => {
    testConnection();
  }, [testConnection]);

  return {
    ...status,
    retryConnection,
    testConnection,
  };
};
