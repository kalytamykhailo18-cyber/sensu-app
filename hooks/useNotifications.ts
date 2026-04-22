import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { router } from 'expo-router';
import { AuthService } from '@/services/authService';
import { createLogger, LogContext } from '@/utils/logger';

const logger = createLogger(LogContext.AUTH);

// Configure how notifications are displayed when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Navigate to the relevant screen based on notification type.
 */
function handleNotificationNavigation(data: Record<string, unknown>) {
  const type = data?.type as string | undefined;
  if (!type) return;

  switch (type) {
    case 'sos':
    case 'fall_detection':
    case 'battery_low':
      router.push('/(tabs)/alerta');
      break;
    case 'geofence_exit':
    case 'geofence_enter':
    case 'geofence_synced':
      router.push('/(tabs)/ubicacion');
      break;
    default:
      router.push('/(tabs)/home');
  }
}

async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (Platform.OS === 'web') return null;
  if (!Device.isDevice) {
    logger.info('Push notifications require a physical device');
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    logger.info('Push notification permission not granted');
    return null;
  }

  // Android notification channels
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alerts', {
      name: 'Alertas',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF0000',
      sound: 'default',
    });
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Sensu',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#3B82F6',
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    logger.warn('No EAS project ID found, cannot register push token');
    return null;
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
  logger.info('Expo push token obtained', { token: token.substring(0, 30) + '...' });
  return token;
}

/**
 * Hook to register push notifications when the user is authenticated.
 * Handles token registration and notification tap navigation.
 */
export function useNotifications(isAuthenticated: boolean) {
  const registered = useRef(false);

  // Register push token
  useEffect(() => {
    if (!isAuthenticated || registered.current) return;

    (async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        const success = await AuthService.registerPushToken(token);
        if (success) {
          registered.current = true;
        }
      }
    })();
  }, [isAuthenticated]);

  // Reset when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      registered.current = false;
    }
  }, [isAuthenticated]);

  // Handle notification tap — navigate to relevant screen
  useEffect(() => {
    if (!isAuthenticated) return;

    // Handle tap when app is already open
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data as Record<string, unknown>;
        logger.info('Notification tapped', { type: data?.type });
        handleNotificationNavigation(data);
      }
    );

    // Handle notification that launched the app (cold start)
    if (Platform.OS !== 'web') {
      Notifications.getLastNotificationResponseAsync().then((response) => {
        if (response) {
          const data = response.notification.request.content.data as Record<string, unknown>;
          logger.info('App launched from notification', { type: data?.type });
          handleNotificationNavigation(data);
        }
      });
    }

    return () => {
      responseSubscription.remove();
    };
  }, [isAuthenticated]);
}
