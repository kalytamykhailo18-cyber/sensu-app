import { CommonColors } from '@/components/CommonStyles';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface EmergencyContactCardProps {
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export default function EmergencyContactCard({ emergencyContact }: EmergencyContactCardProps) {
  const { getResponsivePadding, getResponsiveSize, getResponsiveFontSize } = useScreenData();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    emergencyCard: {
      backgroundColor: CommonColors.profileEmergencyBackground,
      borderRadius: getResponsiveSize(10, 12, 14),
      padding: getResponsivePadding(12, 16, 20),
      borderWidth: 1,
      borderColor: CommonColors.profileEmergencyBorder,
      flexDirection: 'row',
      alignItems: 'center',
      gap: getResponsivePadding(8, 12, 16),
    },
    emergencyInfo: {
      flex: 1,
    },
    emergencyName: {
      fontSize: getResponsiveFontSize(14, 16, 18),
      marginBottom: getResponsivePadding(3, 4, 5),
      color: theme.isDark ? CommonColors.white : CommonColors.gray333,
    },
    emergencyPhone: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      opacity: 0.8,
      marginBottom: getResponsivePadding(1, 2, 3),
      color: theme.isDark ? CommonColors.gray666 : CommonColors.gray666,
    },
    emergencyRelation: {
      fontSize: getResponsiveFontSize(10, 12, 14),
      opacity: 0.7,
      color: theme.isDark ? CommonColors.gray666 : CommonColors.gray666,
    },
  });

  return (
    <View style={styles.emergencyCard}>
      <IconSymbol name="phone.fill" size={24} color={CommonColors.profileEmergencyIcon} />
      <View style={styles.emergencyInfo}>
        <ThemedText style={styles.emergencyName}>
          {emergencyContact.name}
        </ThemedText>
        <ThemedText style={styles.emergencyPhone}>
          {emergencyContact.phone}
        </ThemedText>
        <ThemedText style={styles.emergencyRelation}>
          {emergencyContact.relationship}
        </ThemedText>
      </View>
    </View>
  );
}
