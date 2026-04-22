import { API_CONFIG } from '@/config/api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { createLogger, LogContext } from '@/utils/logger';

const logger = createLogger(LogContext.AUTH);

// Tipos para la autenticación
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  username: string;
  user_id: number;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface UserProfileResponse {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    profile_image_url: string;
    date_of_birth: string;
    height_cm: number;
    weight_kg: number;
    blood_type: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relationship: string;
    medical_conditions: string[];
    medications: string[];
    created_at: string;
    updated_at: string;
  };
}

// Claves para SecureStore
const AUTH_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  TOKEN_TYPE: 'token_type',
  USERNAME: 'username',
  USER_ID: 'user_id',
} as const;

/**
 * Servicio de autenticación para manejar login, logout y gestión de tokens
 */
export class AuthService {
  /**
   * Realiza el login del usuario
   * @param credentials Credenciales del usuario
   * @returns Promise con la respuesta del login o error
   */
  static async login(credentials: LoginRequest): Promise<LoginResponse | AuthError> {
    try {
      logger.info('Iniciando proceso de login');
      
      // Validar credenciales
      if (!credentials.email || !credentials.password) {
        return {
          message: 'El correo electrónico y la contraseña son requeridos',
        };
      }

      // Construir la URL del endpoint de login
      const loginUrl = `${API_CONFIG.WATCH_SERVER_URL}/api/auth/login`;
      logger.debug('Enviando petición de login', { url: loginUrl });

      // Crear un AbortController para manejar el timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

      // Realizar la petición de login
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(credentials),
        signal: controller.signal,
      });

      // Limpiar el timeout si la respuesta es exitosa
      clearTimeout(timeoutId);

      logger.debug('Respuesta del servidor recibida', { status: response.status, statusText: response.statusText });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        let errorMessage = 'Error al iniciar sesión';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el error, usar el mensaje por defecto
          if (response.status === 401) {
            errorMessage = 'Credenciales incorrectas';
          } else if (response.status === 404) {
            errorMessage = 'Servidor no encontrado';
          } else if (response.status >= 500) {
            errorMessage = 'Error del servidor';
          }
        }

        return {
          message: errorMessage,
          status: response.status,
        };
      }

      // Parsear la respuesta exitosa
      const loginData: LoginResponse = await response.json();
      logger.info('Login exitoso', {
        username: loginData.username,
        user_id: loginData.user_id,
        token_type: loginData.token_type,
        has_token: !!loginData.access_token,
      });

      // Guardar los datos de autenticación en SecureStore
      await this.saveAuthData(loginData);

      return loginData;

    } catch (error) {
      logger.error('Error durante el login', error as Error);
      
      let errorMessage = 'Error de conexión al servidor';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: El servidor tardó demasiado en responder';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Error de red: Verifica tu conexión a internet';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Error de conexión al servidor';
        }
      }

      return {
        message: errorMessage,
      };
    }
  }

  /**
   * Guarda los datos de autenticación en SecureStore
   * @param authData Datos de autenticación del servidor
   */
  private static async saveAuthData(authData: LoginResponse): Promise<void> {
    try {
      logger.debug('Guardando datos de autenticación en SecureStore');
      
      // Guardar cada campo por separado en SecureStore
      await Promise.all([
        SecureStore.setItemAsync(AUTH_KEYS.ACCESS_TOKEN, authData.access_token),
        SecureStore.setItemAsync(AUTH_KEYS.REFRESH_TOKEN, authData.refresh_token),
        SecureStore.setItemAsync(AUTH_KEYS.TOKEN_TYPE, authData.token_type),
        SecureStore.setItemAsync(AUTH_KEYS.USERNAME, authData.username),
        SecureStore.setItemAsync(AUTH_KEYS.USER_ID, authData.user_id.toString()),
      ]);

      logger.debug('Datos de autenticación guardados exitosamente');
    } catch (error) {
      logger.error('Error al guardar datos de autenticación', error as Error);
      throw new Error('Error al guardar la sesión');
    }
  }

  /**
   * Obtiene el token de acceso actual
   * @returns Promise con el token o null si no existe
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      const token = await SecureStore.getItemAsync(AUTH_KEYS.ACCESS_TOKEN);
      return token;
    } catch (error) {
      logger.error('Error al obtener el token de acceso', error as Error);
      return null;
    }
  }

  /**
   * Obtiene el tipo de token actual
   * @returns Promise con el tipo de token o null si no existe
   */
  static async getTokenType(): Promise<string | null> {
    try {
      const tokenType = await SecureStore.getItemAsync(AUTH_KEYS.TOKEN_TYPE);
      return tokenType;
    } catch (error) {
      logger.error('Error al obtener el tipo de token', error as Error);
      return null;
    }
  }

  /**
   * Obtiene el nombre de usuario actual
   * @returns Promise con el username o null si no existe
   */
  static async getUsername(): Promise<string | null> {
    try {
      const username = await SecureStore.getItemAsync(AUTH_KEYS.USERNAME);
      return username;
    } catch (error) {
      logger.error('Error al obtener el username', error as Error);
      return null;
    }
  }

  /**
   * Obtiene el ID del usuario actual
   * @returns Promise con el user_id o null si no existe
   */
  static async getUserId(): Promise<number | null> {
    try {
      const userId = await SecureStore.getItemAsync(AUTH_KEYS.USER_ID);
      return userId ? parseInt(userId, 10) : null;
    } catch (error) {
      logger.error('Error al obtener el user_id', error as Error);
      return null;
    }
  }

  /**
   * Obtiene el header de autorización completo
   * @returns Promise con el header de autorización o null si no hay token
   */
  static async getAuthorizationHeader(): Promise<string | null> {
    try {
      const token = await this.getAccessToken();
      const tokenType = await this.getTokenType();
      
      if (!token || !tokenType) {
        return null;
      }

      return `${tokenType} ${token}`;
    } catch (error) {
      logger.error('Error al obtener el header de autorización', error as Error);
      return null;
    }
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns Promise con boolean indicando si está autenticado
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch (error) {
      logger.error('Error al verificar autenticación', error as Error);
      return false;
    }
  }

  /**
   * Obtiene todos los datos de autenticación
   * @returns Promise con todos los datos de auth o null si no hay sesión
   */
  static async getAuthData(): Promise<LoginResponse | null> {
    try {
      const [access_token, refresh_token, token_type, username, user_id] = await Promise.all([
        this.getAccessToken(),
        SecureStore.getItemAsync(AUTH_KEYS.REFRESH_TOKEN),
        this.getTokenType(),
        this.getUsername(),
        this.getUserId(),
      ]);

      if (!access_token || !refresh_token || !token_type || !username || user_id === null) {
        return null;
      }

      return {
        access_token,
        refresh_token,
        token_type,
        username,
        user_id,
      };
    } catch (error) {
      logger.error('Error al obtener datos de autenticación', error as Error);
      return null;
    }
  }

  /**
   * Cierra la sesión del usuario (logout)
   * @returns Promise que se resuelve cuando se completa el logout
   */
  static async logout(): Promise<void> {
    try {
      logger.info('Cerrando sesión del usuario');
      
      // Eliminar todos los datos de autenticación de SecureStore
      await Promise.all([
        SecureStore.deleteItemAsync(AUTH_KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(AUTH_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(AUTH_KEYS.TOKEN_TYPE),
        SecureStore.deleteItemAsync(AUTH_KEYS.USERNAME),
        SecureStore.deleteItemAsync(AUTH_KEYS.USER_ID),
      ]);

      logger.info('Sesión cerrada exitosamente');
    } catch (error) {
      logger.error('Error al cerrar sesión', error as Error);
      // Aunque haya error, consideramos que el logout se completó
      // porque los datos podrían no existir
    }
  }

  /**
   * Valida si el token actual es válido haciendo una petición de prueba
   * @returns Promise con boolean indicando si el token es válido
   */
  static async validateToken(): Promise<boolean> {
    try {
      const authHeader = await this.getAuthorizationHeader();
      if (!authHeader) {
        return false;
      }

      // Hacer una petición simple para validar el token
      const testUrl = `${API_CONFIG.WATCH_SERVER_URL}/api/watches`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Si la respuesta es 401, el token no es válido
      if (response.status === 401) {
        logger.warn('Token inválido, cerrando sesión automáticamente');
        await this.logout();
        return false;
      }

      return response.ok;
    } catch (error) {
      logger.error('Error al validar token', error as Error);
      return false;
    }
  }

  /**
   * Flag to prevent multiple concurrent refresh attempts
   */
  private static _isRefreshing = false;
  private static _refreshPromise: Promise<boolean> | null = null;

  /**
   * Attempts to refresh the access token using the stored refresh token.
   * Returns true if refresh succeeded, false if user must re-login.
   * Deduplicates concurrent calls so only one refresh request is in-flight.
   */
  static async refreshAccessToken(): Promise<boolean> {
    // Deduplicate: if a refresh is already in progress, wait for it
    if (this._isRefreshing && this._refreshPromise) {
      return this._refreshPromise;
    }

    this._isRefreshing = true;
    this._refreshPromise = this._doRefresh();

    try {
      return await this._refreshPromise;
    } finally {
      this._isRefreshing = false;
      this._refreshPromise = null;
    }
  }

  private static async _doRefresh(): Promise<boolean> {
    try {
      const refreshToken = await SecureStore.getItemAsync(AUTH_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        logger.warn('No refresh token available');
        return false;
      }

      logger.info('Intentando refrescar el token de acceso');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${API_CONFIG.WATCH_SERVER_URL}/api/auth/refresh`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.warn('Refresh token inválido o expirado', { status: response.status });
        return false;
      }

      const data: LoginResponse = await response.json();
      await this.saveAuthData(data);
      logger.info('Token refrescado exitosamente');
      return true;
    } catch (error) {
      logger.error('Error al refrescar token', error as Error);
      return false;
    }
  }

  /**
   * Obtiene el perfil completo del usuario desde el API
   * @returns Promise con los datos del perfil o error
   */
  static async getUserProfile(): Promise<UserProfileResponse | AuthError> {
    try {
      logger.info('Obteniendo perfil del usuario');
      
      const authHeader = await this.getAuthorizationHeader();
      if (!authHeader) {
        return {
          message: 'No hay sesión activa. Inicia sesión para obtener tu perfil.',
        };
      }

      // Construir la URL del endpoint de perfil
      const profileUrl = `${API_CONFIG.WATCH_SERVER_URL}/api/auth/me`;
      logger.debug('Enviando petición de perfil', { url: profileUrl });

      // Crear un AbortController para manejar el timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos

      // Realizar la petición de perfil
      const response = await fetch(profileUrl, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      // Limpiar el timeout si la respuesta es exitosa
      clearTimeout(timeoutId);

      logger.debug('Respuesta del servidor recibida', { status: response.status, statusText: response.statusText });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        let errorMessage = 'Error al obtener el perfil';
        
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (e) {
          // Si no se puede parsear el error, usar el mensaje por defecto
          if (response.status === 401) {
            errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
          } else if (response.status === 404) {
            errorMessage = 'Perfil no encontrado';
          } else if (response.status >= 500) {
            errorMessage = 'Error del servidor';
          }
        }

        return {
          message: errorMessage,
          status: response.status,
        };
      }

      // Parsear la respuesta exitosa
      const profileData: UserProfileResponse = await response.json();
      logger.info('Perfil obtenido exitosamente', {
        id: profileData.id,
        username: profileData.username,
        email: profileData.email,
        hasProfile: !!profileData.profile,
        profileId: profileData.profile?.id,
      });

      return profileData;

    } catch (error) {
      logger.error('Error durante la obtención del perfil', error as Error);
      
      let errorMessage = 'Error de conexión al servidor';
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Timeout: El servidor tardó demasiado en responder';
        } else if (error.message.includes('Network request failed')) {
          errorMessage = 'Error de red: Verifica tu conexión a internet';
        } else if (error.message.includes('fetch')) {
          errorMessage = 'Error de conexión al servidor';
        }
      }

      return {
        message: errorMessage,
      };
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  static async updateProfile(updates: {
    full_name?: string;
    phone?: string;
    profile_image_url?: string;
    date_of_birth?: string;
    height_cm?: number;
    weight_kg?: number;
    blood_type?: string;
    medical_conditions?: string[];
    medications?: string[];
  }): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Actualizando perfil del usuario');

      const authHeader = await this.getAuthorizationHeader();
      if (!authHeader) {
        return { success: false, message: 'No hay sesión activa' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${API_CONFIG.WATCH_SERVER_URL}/api/auth/me`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: JSON.stringify(updates),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'Error al actualizar perfil';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (_e) {
          if (response.status === 401) {
            errorMessage = 'Sesión expirada. Inicia sesión nuevamente';
          }
        }
        return { success: false, message: errorMessage };
      }

      logger.info('Perfil actualizado exitosamente');
      return { success: true, message: 'Perfil actualizado correctamente' };
    } catch (error) {
      logger.error('Error al actualizar perfil', error as Error);
      return {
        success: false,
        message: error instanceof Error && error.name === 'AbortError'
          ? 'Timeout: El servidor tardó demasiado en responder'
          : 'Error de conexión al servidor',
      };
    }
  }

  /**
   * Elimina la cuenta del usuario permanentemente
   */
  static async deleteAccount(): Promise<{ success: boolean; message: string }> {
    try {
      logger.info('Iniciando eliminación de cuenta');

      const authHeader = await this.getAuthorizationHeader();
      if (!authHeader) {
        return { success: false, message: 'No hay sesión activa' };
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(
        `${API_CONFIG.WATCH_SERVER_URL}/api/auth/me`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json',
          },
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'No se pudo eliminar la cuenta';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch (_e) {
          // use default message
        }
        return { success: false, message: errorMessage };
      }

      await this.logout();
      logger.info('Cuenta eliminada exitosamente');
      return { success: true, message: 'Cuenta eliminada exitosamente' };
    } catch (error) {
      logger.error('Error al eliminar cuenta', error as Error);
      return {
        success: false,
        message: error instanceof Error && error.name === 'AbortError'
          ? 'Timeout: El servidor tardó demasiado en responder'
          : 'Error de conexión al servidor',
      };
    }
  }

  /**
   * Upload avatar by getting a Cloudinary signature from the VPS, posting the
   * image directly to Cloudinary (no CORS drama), then saving the resulting URL.
   * Returns the Cloudinary secure_url, or throws on failure.
   */
  static async uploadAvatarFile(
    imageUri: string,
    base64: string | null,
  ): Promise<string> {
    const authHeader = await this.getAuthorizationHeader();
    if (!authHeader) throw new Error('No hay sesión activa');

    // Step 1: get upload signature from our backend (simple JSON GET, no CORS issues)
    const signRes = await fetch(`${API_CONFIG.WATCH_SERVER_URL}/api/auth/avatar/sign`, {
      headers: { Authorization: authHeader },
    });
    if (signRes.status === 401 || signRes.status === 403) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) throw new Error('Sesión expirada. Inicia sesión de nuevo.');
      return this.uploadAvatarFile(imageUri, base64); // retry once after refresh
    }
    if (!signRes.ok) throw new Error('Error al preparar la subida');
    const { cloud_name, api_key, timestamp, public_id, signature } = await signRes.json();

    // Step 2: build the file blob
    let blob: Blob;
    if (Platform.OS === 'web') {
      if (!base64) throw new Error('No se pudo leer la imagen seleccionada');
      const bytes = atob(base64);
      const arr = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
      const mimeType = imageUri.startsWith('data:') ? imageUri.split(';')[0].slice(5) : 'image/jpeg';
      blob = new Blob([arr], { type: mimeType });
    } else {
      // Native: fetch the local file URI
      const r = await fetch(imageUri);
      blob = await r.blob();
    }

    // Step 3: upload directly to Cloudinary (fully CORS-safe, no VPS involved)
    const form = new FormData();
    form.append('file', blob, 'avatar.jpg');
    form.append('api_key', api_key);
    form.append('timestamp', String(timestamp));
    form.append('public_id', public_id);
    form.append('signature', signature);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      { method: 'POST', body: form },
    );
    if (!cloudRes.ok) {
      const err = await cloudRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Error al subir imagen');
    }
    const { secure_url } = await cloudRes.json();

    // Step 4: save the Cloudinary URL to our database
    const saveRes = await fetch(`${API_CONFIG.WATCH_SERVER_URL}/api/auth/avatar/url`, {
      method: 'POST',
      headers: { Authorization: (await this.getAuthorizationHeader()) || authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: secure_url }),
    });
    if (!saveRes.ok) throw new Error('Error al guardar la foto');

    return secure_url;
  }

  /**
   * Register an Expo push notification token with the backend.
   */
  static async registerPushToken(expoPushToken: string): Promise<boolean> {
    try {
      const authHeader = await this.getAuthorizationHeader();
      if (!authHeader) return false;

      const response = await fetch(
        `${API_CONFIG.WATCH_SERVER_URL}/api/auth/push-token`,
        {
          method: 'PUT',
          headers: {
            'Authorization': authHeader,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ expo_push_token: expoPushToken }),
        },
      );

      if (response.ok) {
        logger.info('Push token registered successfully');
        return true;
      }

      logger.warn('Failed to register push token', { status: response.status });
      return false;
    } catch (error) {
      logger.error('Error registering push token', error as Error);
      return false;
    }
  }
}
