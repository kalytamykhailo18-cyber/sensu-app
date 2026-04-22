import { useMemo } from 'react';
import { useDefaultAvatars } from './useDefaultAvatars';
import { useProfile } from './useProfile';

export function useAvatarSync() {
  const { profile } = useProfile();
  const { getDefaultAvatar } = useDefaultAvatars();

  // Avatar sincronizado que se actualiza automáticamente
  const syncedAvatar = useMemo(() => {
    // Prioridad: avatar del usuario → avatar por defecto → null
    if (profile?.avatar) {
      return profile.avatar;
    }
    return getDefaultAvatar('gradient');
  }, [profile?.avatar, getDefaultAvatar]);

  // Información adicional del avatar
  const avatarInfo = useMemo(() => ({
    hasCustomAvatar: Boolean(profile?.avatar),
    avatarUrl: syncedAvatar,
    lastUpdated: profile?.updatedAt,
  }), [profile?.avatar, syncedAvatar, profile?.updatedAt]);

  return {
    avatarUrl: syncedAvatar,
    hasCustomAvatar: avatarInfo.hasCustomAvatar,
    lastUpdated: avatarInfo.lastUpdated,
  };
}
