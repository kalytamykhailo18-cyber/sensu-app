import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { DeviceAssociation, EviewStatus } from '@/types/watch';

interface DeviceSelectorProps {
  activeDeviceId: string | null;
  devices: DeviceAssociation[];
  statuses: Map<string, EviewStatus>;
  onSelectDevice: (deviceId: string) => void;
  onLinkDevice?: () => void;
}

export function DeviceSelector({
  activeDeviceId,
  devices,
  statuses,
  onSelectDevice,
  onLinkDevice,
}: DeviceSelectorProps) {
  const theme = useAppTheme();

  if (devices.length === 0 && onLinkDevice) {
    return (
      <View style={[styles.emptyCard, { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border }]}>
        <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
          No tienes un dispositivo vinculado.
        </Text>
        <Pressable
          onPress={onLinkDevice}
          style={[styles.linkButton, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={styles.linkButtonText}>Vincular dispositivo</Text>
        </Pressable>
      </View>
    );
  }

  if (devices.length <= 1) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {devices.map((device) => {
        const isActive = device.device_id === activeDeviceId;
        const status = statuses.get(device.device_id);
        const isOnline = Boolean(status?.online);
        const label = device.label || device.device_id;

        return (
          <Pressable
            key={device.device_id}
            onPress={() => onSelectDevice(device.device_id)}
            style={[
              styles.chip,
              isActive
                ? { backgroundColor: theme.colors.secondary, borderColor: theme.colors.secondary }
                : { backgroundColor: 'transparent', borderColor: theme.colors.border },
            ]}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: isOnline ? '#48BB78' : '#A0AEC0' },
              ]}
            />
            <Text
              style={[
                styles.chipText,
                { color: isActive ? '#fff' : theme.colors.text },
              ]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },
  linkButton: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 20,
  },
  linkButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
