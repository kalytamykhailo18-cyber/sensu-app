import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export function useProfileData() {
  const { 
    profile, 
    settings, 
    loading, 
    error, 
    refresh,
    updateProfile, 
    updateSettings 
  } = useProfile();
  
  const { user } = useAuth();
  const { watchImei, watches, isWatchConfigured } = useWatchConfig();

  // Memoizar datos computados del perfil
  const profileData = useMemo(() => {
    if (!profile) return null;

    return {
      personalInfo: {
        name: user?.username || profile?.name || 'Usuario',
        email: profile?.email || '',
        phone: profile?.phone || '',
      },
      hasEmergencyContact: Boolean(profile.emergencyContact),
      hasMedicalConditions: Boolean(profile.medicalConditions?.length),
      hasMedications: Boolean(profile.medications?.length),
      watchCount: watches.length,
      isWatchConfigured,
    };
  }, [profile, user, watches.length, isWatchConfigured]);

  return {
    profile,
    settings,
    loading,
    error,
    refresh,
    updateProfile,
    updateSettings,
    profileData,
    user,
    watchImei,
    watches,
    isWatchConfigured,
  };
}
