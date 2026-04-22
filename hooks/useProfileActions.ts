import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { AuthService } from '@/services/authService';
import { logger } from '@/utils/logger/logger';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { useAuth } from './useAuth';

interface UseProfileActionsOptions {
  onOpenSettings?: () => void;
}

export function useProfileActions(options?: UseProfileActionsOptions) {
  const { logout } = useAuth();
  const { unlinkWatch } = useWatchConfig();
  const onOpenSettings = options?.onOpenSettings;

  const handleEditProfile = useCallback((setShowEditModal: (show: boolean) => void) => {
    setShowEditModal(true);
  }, []);

  const handleSettings = useCallback(() => {
    if (onOpenSettings) {
      onOpenSettings();
      return;
    }
    Alert.alert('Configuración', 'No hay opciones de configuración disponibles en este momento.');
  }, [onOpenSettings]);

  const handleUnlinkWatch = useCallback(async (imei: string) => {
    Alert.alert(
      'Desvincular Dispositivo',
      '¿Estás seguro de que quieres desvincular este dispositivo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Desvincular',
          style: 'destructive',
          onPress: async () => {
            try {
              await unlinkWatch(imei);
              Alert.alert('Éxito', 'Dispositivo desvinculado correctamente');
            } catch (error) {
              Alert.alert('Error', 'No se pudo desvincular el dispositivo');
            }
          },
        },
      ]
    );
  }, [unlinkWatch]);

  const handleMedicalHistory = useCallback(() => {
    Alert.alert('Historial Médico', 'Historial médico próximamente disponible');
  }, []);

  const handleLogout = useCallback(() => {
    const doLogout = async () => {
      try {
        await logout();
        router.replace('/login');
      } catch (error) {
        logger.error('Error al cerrar sesión:', error);
      }
    };

    if (Platform.OS === 'web') {
      doLogout();
      return;
    }

    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: doLogout },
      ]
    );
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es permanente y no se puede deshacer. Todos tus datos serán eliminados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Cuenta',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirmar Eliminación',
              'Esta es tu última oportunidad. ¿Realmente deseas eliminar tu cuenta permanentemente?',
              [
                { text: 'No, conservar mi cuenta', style: 'cancel' },
                {
                  text: 'Sí, eliminar permanentemente',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const result = await AuthService.deleteAccount();
                      if (result.success) {
                        Alert.alert('Cuenta Eliminada', 'Tu cuenta ha sido eliminada exitosamente.', [
                          { text: 'OK', onPress: () => router.replace('/login') },
                        ]);
                      } else {
                        Alert.alert('Error', result.message);
                      }
                    } catch (error) {
                      logger.error('Error al eliminar cuenta:', error);
                      Alert.alert('Error', 'No se pudo eliminar la cuenta. Inténtalo de nuevo.');
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }, []);

  return {
    handleEditProfile,
    handleSettings,
    handleUnlinkWatch,
    handleMedicalHistory,
    handleLogout,
    handleDeleteAccount,
  };
}
