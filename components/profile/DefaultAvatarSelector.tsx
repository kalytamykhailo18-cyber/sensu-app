import { ThemedText } from '@/components/ThemedText';
import { useDefaultAvatars } from '@/hooks';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

interface DefaultAvatarSelectorProps {
  onSelectAvatar: (avatarUrl: string) => void;
  currentAvatarUrl?: string;
}

export default function DefaultAvatarSelector({ 
  onSelectAvatar, 
  currentAvatarUrl 
}: DefaultAvatarSelectorProps) {
  const { getAllAvatars } = useDefaultAvatars();
  const theme = useAppTheme();

  const styles = StyleSheet.create({
    container: {
      padding: 16,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 12,
      color: theme.colors.text,
    },
    avatarsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    avatarOption: {
      width: 60,
      height: 60,
      borderRadius: 30,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    selectedAvatar: {
      borderColor: theme.colors.primary,
      borderWidth: 3,
    },
  });

  const avatars = getAllAvatars();

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>
        Seleccionar Avatar por Defecto
      </ThemedText>
      <View style={styles.avatarsGrid}>
        {avatars.map((avatar) => (
          <Pressable
            key={avatar.type}
            onPress={() => onSelectAvatar(avatar.url)}
            style={[
              styles.avatarOption,
              currentAvatarUrl === avatar.url && styles.selectedAvatar,
            ]}
          >
            <Image
              source={{ uri: avatar.url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}
