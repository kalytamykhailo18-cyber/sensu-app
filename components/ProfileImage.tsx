import { useProfile } from '@/hooks/useProfile';
import { logger } from '@/utils/logger/logger';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import { CommonColors } from './CommonStyles';
import { IconSymbol } from './ui/IconSymbol';

interface ProfileImageProps {
  size?: number;
  showEditButton?: boolean;
  onImageChange?: (imageUri: string) => void;
  defaultAvatarUrl?: string;
  onPress?: () => void;
}

export default function ProfileImage({ 
  size = 60, 
  showEditButton = true,
  onImageChange,
  defaultAvatarUrl,
  onPress
}: ProfileImageProps) {
  const { profile, uploadAvatar } = useProfile();
  const [isUploading, setIsUploading] = useState(false);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
        Alert.alert(
          'Permisos requeridos',
          'Necesitamos acceso a la cámara y galería para cambiar tu foto de perfil.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  };

  const showImagePicker = () => {
    if (Platform.OS === 'web') {
      pickImage('gallery');
      return;
    }
    Alert.alert(
      'Seleccionar foto',
      '¿Cómo quieres cambiar tu foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cámara', onPress: () => pickImage('camera') },
        { text: 'Galería', onPress: () => pickImage('gallery') },
        ...(profile?.avatar ? [{ text: 'Eliminar foto', onPress: removeImage, style: 'destructive' as const }] : [])
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setIsUploading(true);

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      };

      let result;
      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        await uploadAvatar(asset.uri, asset.base64 ?? null);
        onImageChange?.(asset.uri);
      }
    } catch (error) {
      logger.error('Error picking image:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen. Inténtalo de nuevo.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar tu foto de perfil?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            setIsUploading(true);
            try {
              await uploadAvatar('');
              onImageChange?.('');
            } catch (error) {
              logger.error('Error removing image:', error);
              Alert.alert('Error', 'No se pudo eliminar la imagen. Inténtalo de nuevo.');
            } finally {
              setIsUploading(false);
            }
          }
        }
      ]
    );
  };

  const containerSize = size + 8; // Add padding for border
  const imageSize = size;

  return (
    <View style={[styles.container, { width: containerSize, height: containerSize }]}>
      <Pressable 
        style={[styles.imageContainer, { width: imageSize, height: imageSize }]}
        onPress={showEditButton ? showImagePicker : onPress}
        disabled={isUploading}
      >
        {profile?.avatar ? (
          <Image
            source={{ uri: profile.avatar }}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            contentFit="cover"
            transition={200}
          />
        ) : defaultAvatarUrl ? (
          <Image
            source={{ uri: defaultAvatarUrl }}
            style={[styles.image, { width: imageSize, height: imageSize }]}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.placeholder, { width: imageSize, height: imageSize }]}>
            <IconSymbol 
              name="person.circle.fill" 
              size={imageSize * 0.8} 
              color={CommonColors.profileIcon} 
            />
          </View>
        )}
        
        {isUploading && (
          <View style={[styles.loadingOverlay, { width: imageSize, height: imageSize }]}>
            <ActivityIndicator size="small" color={CommonColors.profileIcon} />
          </View>
        )}
        
        {showEditButton && !isUploading && (
          <View style={styles.editButton}>
            <IconSymbol name="camera.fill" size={12} color="white" />
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: CommonColors.profileBackground,
    borderWidth: 2,
    borderColor: CommonColors.profileBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    borderRadius: 50,
  },
  placeholder: {
    backgroundColor: CommonColors.profilePlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  loadingOverlay: {
    position: 'absolute',
    backgroundColor: CommonColors.profileLoadingOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: CommonColors.profileEditButton,
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: CommonColors.profileEditBorder,
  },
});
