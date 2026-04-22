import Constants from 'expo-constants';
import { logger } from '@/utils/logger/logger';

// Configuración de APIs
export const API_CONFIG = {
  // API key de Google Maps desde variables de entorno
  GOOGLE_MAPS_API_KEY: Constants.expoConfig?.extra?.API_KEY_GMAPS || process.env.API_KEY_GMAPS,
  
  // Servidor del reloj desde variables de entorno
  WATCH_SERVER_URL: Constants.expoConfig?.extra?.WATCH_SERVER_URL || process.env.WATCH_SERVER_URL || 'https://api.sensu.com.mx',
  
  // Endpoint para obtener la ubicación del reloj (requiere IMEI dinámico)
  get WATCH_LOCATION_API() {
    logger.info('🔧 API Config Debug:', {
      WATCH_SERVER_URL: this.WATCH_SERVER_URL,
      note: 'IMEI debe obtenerse dinámicamente desde AsyncStorage'
    });
    return `${this.WATCH_SERVER_URL}/api/watches/{IMEI}/location`;
  },
  
  // Intervalo de actualización en milisegundos (30 segundos)
  UPDATE_INTERVAL: 10000,
  
  DEFAULT_LOCATION: {
    latitude: 19.4326,
    longitude: -99.1332,
  },
};

// Headers por defecto para las peticiones API
export const DEFAULT_HEADERS = {
  'accept': 'application/json',
  'Content-Type': 'application/json',
};

/**
 * Obtiene los headers de autorización para las peticiones API
 * @returns Promise con los headers incluyendo el token de autorización
 */
export async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    // Importar dinámicamente para evitar dependencias circulares
    const { AuthService } = await import('@/services/authService');
    const authHeader = await AuthService.getAuthorizationHeader();
    
    const headers = { ...DEFAULT_HEADERS };
    
    if (authHeader) {
      (headers as any)['Authorization'] = authHeader;
    }
    
    return headers;
  } catch (error) {
    logger.error('Error al obtener headers de autorización:', error);
    return DEFAULT_HEADERS;
  }
}
