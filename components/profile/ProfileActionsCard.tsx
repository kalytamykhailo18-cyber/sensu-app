import { Button } from '@/components/shared';
import { useScreenData } from '@/hooks/shared';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileActionsCardProps {
  onMedicalHistory: () => void;
  onSettings: () => void;
  settingsEnabled?: boolean;
}

export default function ProfileActionsCard({ onMedicalHistory, onSettings, settingsEnabled = true }: ProfileActionsCardProps) {
  const { getResponsivePadding } = useScreenData();

  const styles = StyleSheet.create({
    actionsContainer: {
      flexDirection: 'row',
      gap: getResponsivePadding(8, 12, 16),
    },
  });

  return (
    <View style={styles.actionsContainer}>
      <Button
        title="Configuración"
        onPress={onSettings}
        variant="secondary"
        size="medium"
        icon="gear"
        disabled={!settingsEnabled}
        fullWidth
      />
    </View>
  );
}
