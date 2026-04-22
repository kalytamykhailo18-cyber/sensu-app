import { CommonColors } from '@/components/CommonStyles';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MedicationsCardProps {
  medications: string[];
}

export default function MedicationsCard({ medications }: MedicationsCardProps) {
  const { getResponsivePadding, getResponsiveSize, getResponsiveFontSize } = useScreenData();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    medicationsCard: {
      backgroundColor: CommonColors.profileMedicationsBackground,
      borderRadius: getResponsiveSize(10, 12, 14),
      padding: getResponsivePadding(12, 16, 20),
      borderWidth: 1,
      borderColor: CommonColors.profileMedicationsBorder,
    },
    medicationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(6, 8, 10),
      gap: getResponsivePadding(6, 8, 10),
    },
    medicationText: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      color: theme.isDark ? CommonColors.white : CommonColors.gray333,
    },
  });

  return (
    <View style={styles.medicationsCard}>
      {medications.map((medication, index) => (
        <View key={index} style={styles.medicationItem}>
          <IconSymbol name="pills.fill" size={16} color={CommonColors.profileMedicationsIcon} />
          <ThemedText style={styles.medicationText}>{medication}</ThemedText>
        </View>
      ))}
    </View>
  );
}
