import { Button } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useContacts } from '@/hooks/useDeviceConfig';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { DeviceContact } from '@/types/device';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ContactFormModal from './ContactFormModal';

export function ContactNumbersSection() {
  const theme = useAppTheme();
  const { watchImei, watches } = useWatchConfig();
  const { contacts, loading, saving, error, refresh, setContact, deleteContact, getEmptySlot } = useContacts(watchImei);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState<DeviceContact | null>(null);
  const [editingSlot, setEditingSlot] = useState(0);

  const activeDevice = watches.find(d => d.device_id === watchImei);
  const activeContacts = contacts.filter(c => c.number && c.number.length > 0);
  const hasContacts = activeContacts.length > 0;
  const emptySlot = getEmptySlot();

  const handleAdd = useCallback(() => {
    const slot = getEmptySlot();
    if (slot === null) {
      Alert.alert('Limite alcanzado', 'Todas las posiciones de contacto (0-9) estan ocupadas.');
      return;
    }
    setEditingContact(null);
    setEditingSlot(slot);
    setModalVisible(true);
  }, [getEmptySlot]);

  const handleEdit = useCallback((contact: DeviceContact) => {
    setEditingContact(contact);
    setEditingSlot(contact.index);
    setModalVisible(true);
  }, []);

  const handleDelete = useCallback((contact: DeviceContact) => {
    const slotLabel = contact.index <= 1 ? ` (SOS)` : '';
    Alert.alert(
      'Eliminar Contacto',
      `Eliminar ${contact.number}${slotLabel} de la posicion ${contact.index}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const success = await deleteContact(contact.index);
            if (!success) {
              Alert.alert('Error', 'No se pudo eliminar el contacto. Verifica que el dispositivo este disponible.');
            }
          },
        },
      ]
    );
  }, [deleteContact]);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
    },
    deviceLabel: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginBottom: 12,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: 20,
    },
    errorContainer: {
      padding: 12,
      backgroundColor: theme.colors.error + '15',
      borderRadius: 10,
      marginBottom: 12,
    },
    errorText: {
      color: theme.colors.error,
      textAlign: 'center',
      fontSize: 14,
    },
    emptyContainer: {
      alignItems: 'center',
      padding: 24,
    },
    emptyIcon: {
      fontSize: 40,
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
      lineHeight: 20,
    },
    contactCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: 12,
      marginBottom: 10,
    },
    contactCardSos: {
      borderLeftWidth: 3,
      borderLeftColor: '#E87A2F',
    },
    slotBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(61,35,20,0.08)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    slotBadgeSos: {
      backgroundColor: 'rgba(232,122,47,0.15)',
    },
    slotText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.colors.textSecondary,
    },
    slotTextSos: {
      color: '#E87A2F',
    },
    contactInfo: {
      flex: 1,
    },
    contactNumber: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      letterSpacing: 0.5,
    },
    contactMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 3,
      gap: 8,
    },
    sosBadge: {
      backgroundColor: 'rgba(217,68,68,0.1)',
      borderRadius: 4,
      paddingHorizontal: 5,
      paddingVertical: 1,
    },
    sosBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#D94444',
    },
    flagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    flagText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    actionButton: {
      padding: 8,
      borderRadius: 8,
    },
    contactsContainer: {
      marginBottom: 8,
    },
    addButtonContainer: {
      marginTop: 4,
    },
    savingOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.6)',
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10,
    },
    savingText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    refreshButton: {
      padding: 6,
    },
  });

  if (loading && !hasContacts) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={{ marginTop: 12, color: theme.colors.textSecondary }}>
            Cargando contactos del dispositivo...
          </ThemedText>
        </View>
      </View>
    );
  }

  const renderContact = (contact: DeviceContact) => {
    const isSos = contact.index <= 1;
    return (
      <View
        key={contact.index}
        style={[styles.contactCard, isSos && styles.contactCardSos]}
      >
        {/* Slot badge */}
        <View style={[styles.slotBadge, isSos && styles.slotBadgeSos]}>
          <ThemedText style={[styles.slotText, isSos && styles.slotTextSos]}>
            {contact.index}
          </ThemedText>
        </View>

        {/* Contact info */}
        <View style={styles.contactInfo}>
          <ThemedText style={styles.contactNumber}>{contact.number}</ThemedText>
          <View style={styles.contactMeta}>
            {isSos && (
              <View style={styles.sosBadge}>
                <ThemedText style={styles.sosBadgeText}>SOS</ThemedText>
              </View>
            )}
            <View style={styles.flagRow}>
              {contact.call && (
                <>
                  <Ionicons name="call-outline" size={12} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.flagText}>Llamada</ThemedText>
                </>
              )}
              {contact.sms && (
                <>
                  <Ionicons name="chatbubble-outline" size={12} color={theme.colors.textSecondary} />
                  <ThemedText style={styles.flagText}>SMS</ThemedText>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleEdit(contact)}
            disabled={saving}
          >
            <Ionicons name="create-outline" size={20} color={theme.colors.textSecondary} />
          </Pressable>
          <Pressable
            style={styles.actionButton}
            onPress={() => handleDelete(contact)}
            disabled={saving}
          >
            <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Saving overlay */}
      {saving && (
        <View style={styles.savingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <ThemedText style={styles.savingText}>Enviando al dispositivo...</ThemedText>
        </View>
      )}

      {/* Device label */}
      {activeDevice && (
        <ThemedText style={styles.deviceLabel}>
          Dispositivo: {activeDevice.label || activeDevice.device_id}
        </ThemedText>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        </View>
      )}

      {/* Empty state */}
      {!hasContacts && !loading ? (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyIcon}>📱</ThemedText>
          <ThemedText style={styles.emptyTitle}>
            Sin contactos configurados
          </ThemedText>
          <ThemedText style={styles.emptySubtitle}>
            Agrega numeros de telefono autorizados para que el dispositivo pueda realizar llamadas de emergencia.
          </ThemedText>
          <Button
            title="Agregar Contacto"
            onPress={handleAdd}
            icon="plus.circle"
            variant="primary"
          />
        </View>
      ) : (
        <>
          {/* Contact list */}
          <View style={styles.contactsContainer}>
            {activeContacts
              .sort((a, b) => a.index - b.index)
              .map(renderContact)}
          </View>

          {/* Add button */}
          <View style={styles.addButtonContainer}>
            <Button
              title="Agregar Contacto"
              onPress={handleAdd}
              icon="plus.circle"
              variant="outline"
              disabled={emptySlot === null || saving}
            />
          </View>
        </>
      )}

      {/* Contact form modal */}
      <ContactFormModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={setContact}
        initialData={editingContact}
        slotIndex={editingSlot}
        saving={saving}
      />
    </View>
  );
}
