import { CommonColors } from '@/components/CommonStyles';
import { Card } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface MedicalInfoCardProps {
  profile: {
    dateOfBirth?: string;
    height?: number;
    weight?: number;
    bloodType?: string;
  };
}

export default function MedicalInfoCard({ profile }: MedicalInfoCardProps) {
  const { getResponsivePadding, getResponsiveSize, getResponsiveFontSize } = useScreenData();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    infoCard: {
      backgroundColor: CommonColors.profileInfoCardBackground,
      borderRadius: getResponsiveSize(10, 12, 14),
      padding: getResponsivePadding(12, 16, 20),
      borderWidth: 1,
      borderColor: CommonColors.profileInfoCardBorder,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(8, 12, 16),
      gap: getResponsivePadding(8, 12, 16),
    },
    infoLabel: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      opacity: 0.8,
      flex: 1,
      color: theme.isDark ? CommonColors.gray666 : CommonColors.gray666,
    },
    infoValue: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      fontWeight: '500',
      color: theme.isDark ? CommonColors.white : CommonColors.gray333,
    },
  });

  return (
    <Card variant="elevated" padding="medium" style={styles.infoCard}>
      <View style={styles.infoRow}>
        <IconSymbol name="calendar" size={20} color="#000000" />
        <ThemedText style={styles.infoLabel}>Fecha de Nacimiento:</ThemedText>
        <ThemedText style={styles.infoValue}>
          {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'No especificada'}
        </ThemedText>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="ruler" size={20} color="#000000" />
        <ThemedText style={styles.infoLabel}>Altura:</ThemedText>
        <ThemedText style={styles.infoValue}>                  
          {profile.height ? `${profile.height} cm` : 'No especificada'}
        </ThemedText>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="scalemass" size={20} color="#000000" />
        <ThemedText style={styles.infoLabel}>Peso:</ThemedText>
        <ThemedText style={styles.infoValue}>                  
          {profile.weight ? `${profile.weight} kg` : 'No especificado'}
        </ThemedText>
      </View>
      
      <View style={styles.infoRow}>
        <IconSymbol name="drop.fill" size={20} color="#000000" />
        <ThemedText style={styles.infoLabel}>Tipo de Sangre:</ThemedText>
        <ThemedText style={styles.infoValue}>                   
          {profile.bloodType || 'No especificado'}
        </ThemedText>
      </View>
    </Card>
  );
}
