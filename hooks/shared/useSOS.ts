import { UserProfile } from '@/contexts/ProfileContext';
import { logger } from '@/utils/logger/logger';
import { Alert, Linking, Platform } from 'react-native';

const SOS_PHONE = '+528000570180';

const useSOS = () => {
  const callSOS = async (_profile: UserProfile) => {
    const url = Platform.select({
      ios: `tel://${SOS_PHONE}`,
      android: `tel:${SOS_PHONE}`,
      default: `tel:${SOS_PHONE}`,
    });

    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          'No se puede realizar la llamada',
          'Este dispositivo no admite llamadas telefónicas.'
        );
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      logger.error('Error al realizar la llamada:', error);
      Alert.alert('Error', 'No se pudo realizar la llamada. Inténtalo de nuevo.');
    }
  };

  return { callSOS };
};

export default useSOS;