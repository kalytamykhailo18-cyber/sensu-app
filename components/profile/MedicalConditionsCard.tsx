import { CommonColors } from '@/components/CommonStyles';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MedicalConditionsCardProps {
  conditions: string[];
}

export default function MedicalConditionsCard({ conditions }: MedicalConditionsCardProps) {
  const { getResponsivePadding, getResponsiveSize, getResponsiveFontSize } = useScreenData();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    conditionsCard: {
      backgroundColor: CommonColors.profileConditionsBackground,
      borderRadius: getResponsiveSize(10, 12, 14),
      padding: getResponsivePadding(12, 16, 20),
      borderWidth: 1,
      borderColor: CommonColors.profileConditionsBorder,
    },
    conditionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(6, 8, 10),
      gap: getResponsivePadding(6, 8, 10),
    },
    conditionText: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      color: theme.isDark ? CommonColors.white : CommonColors.gray333,
    },
  });

  return (
    <View style={styles.conditionsCard}>
      {conditions.map((condition, index) => (
        <View key={index} style={styles.conditionItem}>
          <IconSymbol name="cross.fill" size={16} color={CommonColors.profileConditionsIcon} />
          <ThemedText style={styles.conditionText}>{condition}</ThemedText>
        </View>
      ))}
    </View>
  );
}
