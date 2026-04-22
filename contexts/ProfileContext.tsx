import { useAuth } from '@/hooks/useAuth';
import { AuthService, UserProfileResponse } from '@/services/authService';
import { logger } from '@/utils/logger/logger';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';

// Tipos para perfil de usuario
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  height?: number; // en cm
  weight?: number; // en kg
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalConditions?: string[];
  medications?: string[];
  allergies?: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  privacy: {
    shareHealthData: boolean;
    shareLocation: boolean;
    shareWithFamily: boolean;
  };
  preferences: {
    language: 'es' | 'en';
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
  };
}

interface ProfileContextType {
  profile: UserProfile | null;
  settings: ProfileSettings;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  updateSettings: (updates: Partial<ProfileSettings>) => Promise<void>;
  uploadAvatar: (imageUri: string, base64?: string | null) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [settings, setSettings] = useState<ProfileSettings>({
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    privacy: {
      shareHealthData: false,
      shareLocation: false,
      shareWithFamily: true,
    },
    preferences: {
      language: 'es',
      theme: 'auto',
      units: 'metric',
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.info('🔄 Obteniendo perfil del usuario desde el API...');
      
      // Obtener perfil desde el API
      const result = await AuthService.getUserProfile();
      
      // Verificar si es un error
      if ('message' in result) {
        setError(result.message);
        logger.error('❌ Error al obtener perfil:', result.message);
        return;
      }
      
      // Convertir la respuesta del API al formato interno
      const apiProfile: UserProfileResponse = result;
      
      const convertedProfile: UserProfile = {
        id: apiProfile.profile?.id || apiProfile.id.toString(),
        name: apiProfile.profile?.full_name || apiProfile.username || '',
        email: apiProfile.profile?.email || apiProfile.email || '',
        phone: apiProfile.profile?.phone_number || undefined,
        dateOfBirth: apiProfile.profile?.date_of_birth
          ? apiProfile.profile.date_of_birth.slice(0, 10)
          : undefined,
        gender: undefined,
        height: apiProfile.profile?.height_cm || undefined,
        weight: apiProfile.profile?.weight_kg || undefined,
        bloodType: apiProfile.profile?.blood_type as any || undefined,
        emergencyContact: undefined,
        medicalConditions: apiProfile.profile?.medical_conditions?.length > 0
          ? apiProfile.profile.medical_conditions
          : undefined,
        medications: apiProfile.profile?.medications?.length > 0
          ? apiProfile.profile.medications
          : undefined,
        allergies: undefined,
        avatar: apiProfile.profile?.profile_image_url || undefined,
        createdAt: apiProfile.profile?.created_at || apiProfile.created_at,
        updatedAt: apiProfile.profile?.updated_at || apiProfile.updated_at,
      };
      
      logger.info('✅ Perfil convertido exitosamente:', {
        id: convertedProfile.id,
        name: convertedProfile.name,
        email: convertedProfile.email,
        hasEmergencyContact: !!convertedProfile.emergencyContact,
        medicalConditionsCount: convertedProfile.medicalConditions?.length || 0,
        medicationsCount: convertedProfile.medications?.length || 0,
      });
      
      setProfile(convertedProfile);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al obtener perfil';
      setError(errorMessage);
      logger.error('❌ Error en ProfileContext:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const apiUpdates: Parameters<typeof AuthService.updateProfile>[0] = {};
      if (updates.name !== undefined)             apiUpdates.full_name           = updates.name;
      if (updates.phone !== undefined)            apiUpdates.phone               = updates.phone;
      if (updates.avatar !== undefined)           apiUpdates.profile_image_url   = updates.avatar;
      if (updates.dateOfBirth !== undefined)      apiUpdates.date_of_birth       = updates.dateOfBirth;
      if (updates.height !== undefined)           apiUpdates.height_cm           = updates.height;
      if (updates.weight !== undefined)           apiUpdates.weight_kg           = updates.weight;
      if (updates.bloodType !== undefined)        apiUpdates.blood_type          = updates.bloodType;
      if (updates.medicalConditions !== undefined) apiUpdates.medical_conditions = updates.medicalConditions;
      if (updates.medications !== undefined)      apiUpdates.medications         = updates.medications;

      const result = await AuthService.updateProfile(apiUpdates);
      if (!result.success) {
        throw new Error(result.message);
      }

      setProfile(prev => prev ? { ...prev, ...updates, updatedAt: new Date().toISOString() } : null);

      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, []);

  const updateSettings = useCallback(async (updates: Partial<ProfileSettings>) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSettings(prev => ({ ...prev, ...updates }));
      
      Alert.alert('Éxito', 'Configuración actualizada correctamente');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar configuración';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, []);

  const uploadAvatar = useCallback(async (imageUri: string, base64?: string | null) => {
    try {
      if (!imageUri) {
        const result = await AuthService.updateProfile({ profile_image_url: '' });
        if (!result.success) throw new Error(result.message);
        setProfile(prev => prev ? { ...prev, avatar: undefined, updatedAt: new Date().toISOString() } : null);
        Alert.alert('Éxito', 'Foto de perfil eliminada');
        return;
      }

      const publicUrl = await AuthService.uploadAvatarFile(imageUri, base64 ?? null);

      setProfile(prev => prev ? {
        ...prev,
        avatar: publicUrl,
        updatedAt: new Date().toISOString(),
      } : null);

      Alert.alert('Éxito', 'Foto de perfil actualizada correctamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir foto de perfil';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      const result = await AuthService.deleteAccount();
      if (!result.success) {
        throw new Error(result.message);
      }

      setProfile(null);

      Alert.alert('Cuenta Eliminada', 'Tu cuenta ha sido eliminada correctamente');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cuenta';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    } else {
      // Limpiar datos cuando no hay sesión
      setProfile(null);
      setError(null);
      setLoading(false);
    }
  }, [isAuthenticated, fetchProfile]);

  const value: ProfileContextType = {
    profile,
    settings,
    loading,
    error,
    refresh,
    updateProfile,
    updateSettings,
    uploadAvatar,
    deleteAccount,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
