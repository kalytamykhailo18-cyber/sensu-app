import { useAvatarSync } from "@/hooks";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useProfileActions } from "@/hooks/useProfileActions";
import { useRouter } from "expo-router";
import { Image, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ProfileImage from "./ProfileImage";
import { IconSymbol } from "./ui/IconSymbol";
// Estilos base (sin colores específicos)
const baseStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    width: 24,
    height: 18,
    justifyContent: 'space-between',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  logoutButton: {
    padding: 4,
  },
});

export default function Header() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useAppTheme();
  const { avatarUrl } = useAvatarSync();
  const { handleLogout } = useProfileActions();
  
  const handleProfilePress = () => {
    router.push('/(tabs)/perfil');
  };
  
  return (
    <View style={[
      baseStyles.header, 
      { 
        paddingTop: insets.top + (Platform.OS === 'ios' ? -90 : 0),
        paddingBottom: Platform.OS === 'ios' ? 20 : 16,
        backgroundColor: theme.colors.background,
      }
    ]}>
      <Pressable
        style={baseStyles.logoContainer}
        onPress={() => router.push('/landing' as any)}
        hitSlop={8}
      >
        <Image
          source={require('@/assets/images/sensulogo.jpeg')}
          style={{ width: 36, height: 36, borderRadius: 6 }}
          resizeMode="contain"
        />
        <Text style={[baseStyles.logoText, { fontSize: 28, color: theme.colors.text }]}>Sensu</Text>
      </Pressable>
      <View style={baseStyles.headerRight}>
        <ProfileImage 
          size={44} 
          showEditButton={false} 
          defaultAvatarUrl={avatarUrl}
          onPress={handleProfilePress}
        />
        <Pressable 
          style={[baseStyles.logoutButton, { marginTop: 4 }]}
          onPress={handleLogout}
        >
          <IconSymbol name="exit-outline" size={25} color={theme.colors.iconSecondary} />
        </Pressable>
      </View>
    </View>
  );
}