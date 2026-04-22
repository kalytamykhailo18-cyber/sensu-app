import { CommonColors } from '@/components/CommonStyles';
import { ThemedText } from '@/components/ThemedText';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface ProfileSectionProps {
  title: string;
  children: React.ReactNode;
}

export default function ProfileSection({ title, children }: ProfileSectionProps) {
  const { getResponsivePadding, getResponsiveFontSize } = useScreenData();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    section: {
      marginBottom: getResponsivePadding(20, 24, 28),
      paddingHorizontal: getResponsivePadding(16, 20, 24),
    },
    sectionTitle: {
      fontSize: getResponsiveFontSize(16, 18, 20),
      fontWeight: '600',
      marginBottom: getResponsivePadding(12, 16, 20),
      color: theme.isDark ? CommonColors.white : CommonColors.gray333,
    },
  });

  return (
    <View style={styles.section}>
      <ThemedText type="subtitle" style={styles.sectionTitle}>
        {title}
      </ThemedText>
      {children}
    </View>
  );
}
