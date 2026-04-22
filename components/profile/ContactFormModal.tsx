import { CommonColors } from '@/components/CommonStyles';
import { ThemedText } from '@/components/ThemedText';
import { useScreenData } from '@/hooks/shared';
import type { DeviceContact, DeviceContactRequest } from '@/types/device';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContactFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (contact: DeviceContactRequest) => Promise<boolean>;
  initialData?: DeviceContact | null;
  slotIndex: number;
  saving: boolean;
}

const PHONE_REGEX = /^\+?\d{1,20}$/;

export default function ContactFormModal({
  visible,
  onClose,
  onSave,
  initialData,
  slotIndex,
  saving,
}: ContactFormModalProps) {
  const { getResponsiveFontSize, getResponsivePadding, getResponsiveSize } = useScreenData();
  const [number, setNumber] = useState('');
  const [call, setCall] = useState(true);
  const [sms, setSms] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);

  const isEditing = initialData != null && initialData.number.length > 0;
  const isSosSlot = slotIndex <= 1;

  useEffect(() => {
    if (visible) {
      if (initialData && initialData.number) {
        setNumber(initialData.number);
        setCall(initialData.call);
        setSms(initialData.sms);
      } else {
        setNumber('');
        setCall(true);
        setSms(true);
      }
      setValidationError(null);
    }
  }, [visible, initialData]);

  const handleNumberChange = (text: string) => {
    // Allow only digits and optional + prefix
    const cleaned = text.replace(/[^\d+]/g, '');
    // Ensure + only appears at the start
    const sanitized = cleaned.charAt(0) === '+'
      ? '+' + cleaned.slice(1).replace(/\+/g, '')
      : cleaned.replace(/\+/g, '');
    if (sanitized.length <= 20) {
      setNumber(sanitized);
      setValidationError(null);
    }
  };

  const validate = (): boolean => {
    if (!number.trim()) {
      setValidationError('El numero de telefono es requerido');
      return false;
    }
    if (!PHONE_REGEX.test(number)) {
      setValidationError('Numero invalido. Solo digitos y prefijo + opcional, maximo 20 caracteres');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const contact: DeviceContactRequest = {
      index: slotIndex,
      number,
      enabled: true,
      call,
      sms,
    };

    const success = await onSave(contact);
    if (success) {
      onClose();
    } else {
      Alert.alert('Error', 'No se pudo guardar el contacto. Verifica que el dispositivo este disponible.');
    }
  };

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: CommonColors.editProfileModalOverlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: CommonColors.white,
      borderTopLeftRadius: getResponsiveSize(20, 24, 28),
      borderTopRightRadius: getResponsiveSize(20, 24, 28),
      paddingTop: getResponsivePadding(20, 24, 28),
      paddingBottom: getResponsivePadding(24, 28, 32),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: getResponsivePadding(20, 24, 28),
      marginBottom: getResponsivePadding(20, 24, 28),
    },
    headerTitle: {
      fontSize: getResponsiveFontSize(18, 20, 22),
      fontWeight: 'bold',
      color: CommonColors.black,
      flex: 1,
      textAlign: 'center',
    },
    closeButton: {
      padding: getResponsivePadding(8, 10, 12),
    },
    slotBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: getResponsivePadding(8, 10, 12),
      paddingHorizontal: getResponsivePadding(20, 24, 28),
      gap: 8,
    },
    slotLabel: {
      fontSize: getResponsiveFontSize(13, 14, 15),
      color: CommonColors.gray,
      fontWeight: '500',
    },
    sosBadge: {
      backgroundColor: 'rgba(217,68,68,0.1)',
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    sosBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: CommonColors.error,
    },
    formBody: {
      paddingHorizontal: getResponsivePadding(20, 24, 28),
    },
    inputGroup: {
      marginBottom: getResponsivePadding(16, 20, 24),
    },
    label: {
      fontSize: getResponsiveFontSize(14, 16, 18),
      fontWeight: '500',
      color: CommonColors.black,
      marginBottom: getResponsivePadding(6, 8, 10),
    },
    input: {
      borderWidth: 1,
      borderColor: CommonColors.editProfileModalInputBorder,
      borderRadius: getResponsiveSize(8, 10, 12),
      paddingHorizontal: getResponsivePadding(12, 16, 20),
      paddingVertical: getResponsivePadding(12, 14, 16),
      fontSize: getResponsiveFontSize(16, 18, 20),
      color: CommonColors.black,
      backgroundColor: CommonColors.white,
      letterSpacing: 1,
    },
    inputError: {
      borderColor: CommonColors.error,
    },
    errorText: {
      fontSize: getResponsiveFontSize(12, 13, 14),
      color: CommonColors.error,
      marginTop: 4,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: getResponsivePadding(10, 12, 14),
      borderBottomWidth: 1,
      borderBottomColor: CommonColors.editProfileModalPickerItemBorder,
    },
    toggleLabel: {
      fontSize: getResponsiveFontSize(14, 16, 18),
      color: CommonColors.black,
    },
    toggleDescription: {
      fontSize: getResponsiveFontSize(12, 13, 14),
      color: CommonColors.gray,
      marginTop: 2,
    },
    actionsContainer: {
      flexDirection: 'row',
      gap: getResponsivePadding(12, 16, 20),
      paddingHorizontal: getResponsivePadding(20, 24, 28),
      paddingTop: getResponsivePadding(16, 20, 24),
    },
    cancelButton: {
      flex: 1,
      backgroundColor: CommonColors.editProfileModalCancelButtonBg,
      borderRadius: getResponsiveSize(10, 12, 14),
      paddingVertical: getResponsivePadding(12, 14, 16),
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: getResponsiveFontSize(14, 16, 18),
      fontWeight: '500',
      color: CommonColors.black,
    },
    saveButton: {
      flex: 1,
      backgroundColor: CommonColors.editProfileModalSaveButtonBg,
      borderRadius: getResponsiveSize(10, 12, 14),
      paddingVertical: getResponsivePadding(12, 14, 16),
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
    },
    saveButtonText: {
      fontSize: getResponsiveFontSize(14, 16, 18),
      fontWeight: '600',
      color: CommonColors.white,
    },
    disabledButton: {
      backgroundColor: CommonColors.editProfileModalDisabledButtonBg,
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <SafeAreaView edges={['bottom']}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={{ fontSize: 16, color: CommonColors.editProfileModalButtonPrimaryBg }}>
                  Cancelar
                </Text>
              </Pressable>
              <ThemedText style={styles.headerTitle}>
                {isEditing ? 'Editar Contacto' : 'Nuevo Contacto'}
              </ThemedText>
              <View style={{ width: 70 }} />
            </View>

            {/* Slot indicator */}
            <View style={styles.slotBadge}>
              <Text style={styles.slotLabel}>Posicion {slotIndex}</Text>
              {isSosSlot && (
                <View style={styles.sosBadge}>
                  <Text style={styles.sosBadgeText}>SOS</Text>
                </View>
              )}
            </View>

            {/* Form */}
            <View style={styles.formBody}>
              {/* Phone number */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Numero de telefono *</Text>
                <TextInput
                  style={[
                    styles.input,
                    validationError ? styles.inputError : null,
                  ]}
                  value={number}
                  onChangeText={handleNumberChange}
                  placeholder="+525512345678"
                  placeholderTextColor={CommonColors.editProfileModalPlaceholder}
                  keyboardType="phone-pad"
                  maxLength={20}
                  autoFocus={!isEditing}
                  editable={!saving}
                />
                {validationError && (
                  <Text style={styles.errorText}>{validationError}</Text>
                )}
              </View>

              {/* Call toggle */}
              <View style={styles.toggleRow}>
                <View>
                  <Text style={styles.toggleLabel}>Llamada</Text>
                  <Text style={styles.toggleDescription}>
                    El dispositivo puede llamar a este numero
                  </Text>
                </View>
                <Switch
                  value={call}
                  onValueChange={setCall}
                  trackColor={{
                    false: CommonColors.borderGray,
                    true: CommonColors.secondary,
                  }}
                  disabled={saving}
                />
              </View>

              {/* SMS toggle */}
              <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.toggleLabel}>SMS</Text>
                  <Text style={styles.toggleDescription}>
                    El dispositivo acepta SMS de este numero
                  </Text>
                </View>
                <Switch
                  value={sms}
                  onValueChange={setSms}
                  trackColor={{
                    false: CommonColors.borderGray,
                    true: CommonColors.secondary,
                  }}
                  disabled={saving}
                />
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={onClose}
                disabled={saving}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.saveButton, saving && styles.disabledButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving && <ActivityIndicator size="small" color={CommonColors.white} />}
                <Text style={styles.saveButtonText}>
                  {saving ? 'Guardando...' : 'Guardar'}
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
