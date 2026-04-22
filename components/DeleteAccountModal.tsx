import { ThemedText } from '@/components/ThemedText';
import { AuthService } from '@/services/authService';
import { logger } from '@/utils/logger/logger';
import { useAppTheme } from '@/hooks/useAppTheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SPRING = { damping: 18, stiffness: 220 };

interface DeleteAccountModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DeleteAccountModal({ visible, onClose }: DeleteAccountModalProps) {
  const theme = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const backdropOp = useSharedValue(0);
  const cardS      = useSharedValue(0.88);
  const cardOp     = useSharedValue(0);
  const cancelS    = useSharedValue(1);
  const deleteS    = useSharedValue(1);
  const iconS      = useSharedValue(0);

  const open = () => {
    backdropOp.value = withTiming(1, { duration: 220 });
    cardOp.value     = withTiming(1, { duration: 220 });
    cardS.value      = withSpring(1, SPRING);
    iconS.value      = withSpring(1, { damping: 14, stiffness: 260 });
  };

  const close = (callback: () => void) => {
    backdropOp.value = withTiming(0, { duration: 180 });
    cardOp.value     = withTiming(0, { duration: 180 });
    cardS.value      = withTiming(0.92, { duration: 180 }, () => { runOnJS(callback)(); });
    iconS.value      = withTiming(0.8, { duration: 180 });
  };

  useEffect(() => {
    if (visible) {
      setError(null);
      open();
    }
  }, [visible]);

  const handleClose = () => {
    if (loading) return;
    close(onClose);
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await AuthService.deleteAccount();
      if (result.success) {
        close(() => router.replace('/login'));
      } else {
        setError(result.message || 'No se pudo eliminar la cuenta.');
        setLoading(false);
      }
    } catch (err) {
      logger.error('Error al eliminar cuenta:', err);
      setError('Ocurrió un error. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  const backdropStyle  = useAnimatedStyle(() => ({ opacity: backdropOp.value }));
  const cardStyle      = useAnimatedStyle(() => ({ opacity: cardOp.value, transform: [{ scale: cardS.value }] }));
  const iconStyle      = useAnimatedStyle(() => ({ transform: [{ scale: iconS.value }] }));
  const cancelStyle    = useAnimatedStyle(() => ({ transform: [{ scale: cancelS.value }] }));
  const deleteStyle    = useAnimatedStyle(() => ({ transform: [{ scale: deleteS.value }] }));

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.55)',
    },
    card: {
      width: '88%',
      maxWidth: 380,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 20,
      padding: 28,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    iconWrap: {
      width: 68,
      height: 68,
      borderRadius: 34,
      backgroundColor: (theme.colors.error as string) + '18',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      borderWidth: 1,
      borderColor: (theme.colors.error as string) + '30',
    },
    iconText: { fontSize: 32 },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 12,
    },
    body: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 21,
      marginBottom: 8,
    },
    warningBox: {
      backgroundColor: (theme.colors.error as string) + '12',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 14,
      marginTop: 8,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: (theme.colors.error as string) + '25',
      width: '100%',
    },
    warningText: {
      fontSize: 13,
      color: theme.colors.error,
      textAlign: 'center',
      fontWeight: '600',
    },
    errorText: {
      fontSize: 13,
      color: theme.colors.error,
      textAlign: 'center',
      marginBottom: 12,
    },
    buttons: { flexDirection: 'row', gap: 12, width: '100%' },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    deleteBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      alignItems: 'center',
      backgroundColor: theme.colors.error,
      opacity: loading ? 0.6 : 1,
    },
    deleteText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFF',
    },
  });

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible} onRequestClose={handleClose}>
      <View style={styles.overlay}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={StyleSheet.absoluteFillObject} onPress={handleClose} />
        </Animated.View>

        {/* Card */}
        <Animated.View style={[styles.card, cardStyle]}>
          {/* Danger icon */}
          <Animated.View style={[styles.iconWrap, iconStyle]}>
            <ThemedText style={styles.iconText}>⚠️</ThemedText>
          </Animated.View>

          <ThemedText style={styles.title}>Eliminar Cuenta</ThemedText>

          <ThemedText style={styles.body}>
            Esta acción es permanente e irreversible. Se eliminarán todos tus datos, dispositivos vinculados y configuraciones.
          </ThemedText>

          <View style={styles.warningBox}>
            <ThemedText style={styles.warningText}>No podrás recuperar tu cuenta después de esto.</ThemedText>
          </View>

          {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

          <View style={styles.buttons}>
            {/* Cancel */}
            <Animated.View style={[{ flex: 1 }, cancelStyle]}>
              <Pressable
                style={styles.cancelBtn}
                onPress={handleClose}
                disabled={loading}
                onPressIn={() =>  { cancelS.value = withSpring(0.95, SPRING); }}
                onPressOut={() => { cancelS.value = withSpring(1.00, SPRING); }}
              >
                <ThemedText style={styles.cancelText}>Cancelar</ThemedText>
              </Pressable>
            </Animated.View>

            {/* Delete */}
            <Animated.View style={[{ flex: 1 }, deleteStyle]}>
              <Pressable
                style={styles.deleteBtn}
                onPress={handleDelete}
                disabled={loading}
                onPressIn={() =>  { deleteS.value = withSpring(0.95, SPRING); }}
                onPressOut={() => { deleteS.value = withSpring(1.00, SPRING); }}
              >
                <ThemedText style={styles.deleteText}>
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </ThemedText>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
