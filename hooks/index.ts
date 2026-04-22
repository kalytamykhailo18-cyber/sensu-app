export { useProfile } from './useProfile';

// Hooks de dispositivos Eview
export {
  useEviewButtonPressEvents,
  useEviewDevice,
  useEviewDevices,
  useEviewEvents,
  useEviewLocation,
  useEviewMQTT,
  useEviewStatus,
} from './useEviewData';

// Hooks de alertas unificadas
export { useEmergencyAlerts, useUnifiedAlerts } from './useUnifiedAlerts';

// Hooks específicos del perfil
export { useAvatarSync } from './useAvatarSync';
export { useDefaultAvatars } from './useDefaultAvatars';
export { useProfileActions } from './useProfileActions';
export { useProfileData } from './useProfileData';
export { useProfileStyles } from './useProfileStyles';
export { useCommunicationLogs } from './useCommunicationLogs';

// Re-exportar hooks existentes
export { useAppTheme } from './useAppTheme';
export { useColorScheme } from './useColorScheme';
export { useThemeColor } from './useThemeColor';
