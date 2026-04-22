import { CommonColors } from '@/components/CommonStyles';
import { Button } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import ProfileImage from '../ProfileImage';

interface ProfileInfoCardProps {
  profile: {
    name: string;
    email: string;
    phone?: string;
  };
  onEdit: () => void;
  defaultAvatarUrl?: string;
}

export default function ProfileInfoCard({ profile, onEdit, defaultAvatarUrl }: ProfileInfoCardProps) {
  const { getResponsivePadding, getResponsiveSize, getResponsiveFontSize } = useScreenData();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    profileCard: {
      backgroundColor: CommonColors.profileCardBackground,
      borderRadius: getResponsiveSize(10, 12, 14),
      padding: getResponsivePadding(12, 16, 20),
      borderWidth: 1,
      borderColor: CommonColors.profileCardBorder,
      marginBottom: getResponsivePadding(16, 20, 24),
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: getResponsivePadding(12, 16, 20),
      gap: getResponsivePadding(8, 12, 16),
    },
    avatarContainer: {
      marginRight: getResponsivePadding(12, 16, 20),
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: getResponsiveFontSize(16, 18, 20),
      fontWeight: '600',
      marginBottom: getResponsivePadding(3, 4, 5),
      color: theme.isDark ? CommonColors.white : CommonColors.gray333,
    },
    profileEmail: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      opacity: 0.8,
      marginBottom: getResponsivePadding(1, 2, 3),
      color: theme.isDark ? CommonColors.gray666 : CommonColors.gray666,
    },
    profilePhone: {
      fontSize: getResponsiveFontSize(12, 14, 16),
      opacity: 0.8,
      color: theme.isDark ? CommonColors.gray666 : CommonColors.gray666,
    },
  });

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <ProfileImage size={60} showEditButton={true} defaultAvatarUrl={defaultAvatarUrl} />
        </View>
        <View style={styles.profileInfo}>
          <ThemedText style={styles.profileName}>
            {profile.name}
          </ThemedText>
          <ThemedText style={styles.profileEmail}>
            {profile.email}
          </ThemedText>
          <ThemedText style={styles.profilePhone}>
            {profile.phone || 'No especificado'}
          </ThemedText>
        </View>
        <Button
          title="Editar"
          onPress={onEdit}
          variant="primary"
          size="small"
          icon="pencil"
          style={{
            backgroundColor: CommonColors.profileEditButtonBg,
            borderColor: CommonColors.profileEditButtonBg,
            alignSelf: 'flex-start',
            marginTop: getResponsivePadding(4, 6, 8)
          }}
        />
      </View>
    </View>
  );
}
