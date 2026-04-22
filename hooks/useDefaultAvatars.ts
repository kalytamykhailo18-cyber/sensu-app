import { useMemo } from 'react';

// URLs de imágenes por defecto para avatares
const DEFAULT_AVATARS = {
  gradient: 'https://img.freepik.com/free-vector/abstract-watercolor-pastel-background_87374-139.jpg',
  geometric: 'https://img.freepik.com/free-vector/geometric-gradient-background_23-2148997208.jpg',
  nature: 'https://img.freepik.com/free-vector/nature-background-with-mountains-sunset_23-2148997209.jpg',
  abstract: 'https://img.freepik.com/free-vector/abstract-background-with-watercolor_23-2148997210.jpg',
  modern: 'https://img.freepik.com/free-vector/modern-gradient-background_23-2148997211.jpg',
} as const;

export type DefaultAvatarType = keyof typeof DEFAULT_AVATARS;

export function useDefaultAvatars() {
  const avatars = useMemo(() => DEFAULT_AVATARS, []);

  const getDefaultAvatar = (type: DefaultAvatarType = 'gradient') => {
    return avatars[type];
  };

  const getAllAvatars = () => {
    return Object.entries(avatars).map(([key, url]) => ({
      type: key as DefaultAvatarType,
      url,
    }));
  };

  return {
    avatars,
    getDefaultAvatar,
    getAllAvatars,
  };
}
