import { CommonStyles } from '@/components/CommonStyles';
import Header from '@/components/header';
import { LoadingState, SectionHeader } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useAvatarSync, useProfileActions, useProfileData, useProfileStyles } from '@/hooks';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import { logger } from '@/utils/logger/logger';
import { PROJECT_OPTIONS } from '@/config/projectOptions';
import { useEffect, useState } from 'react';
import { Platform, Pressable, ScrollView, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DeleteAccountModal from '../../components/DeleteAccountModal';
import EditProfileModal from '../../components/EditProfileModal';
import {
  EviewDevicesSection,
  ProfileInfoCard,
  ProfileSection,
} from '../../components/profile';
import { useWatchConfig } from '@/contexts/WatchConfigContext';

const SPRING = { damping: 18, stiffness: 200 };
const EASE   = { duration: 400 };

export default function YoScreen() {
  const { profile, loading, error, refresh, updateProfile, profileData, user } = useProfileData();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const hasProjectConfig = PROJECT_OPTIONS.features.communicationLogs.enabled;
  const { handleLogout, handleSettings, handleEditProfile } = useProfileActions({
    onOpenSettings: hasProjectConfig ? () => {} : undefined,
  });
  const { isWatchConfigured } = useWatchConfig();
  const styles   = useProfileStyles();
  const theme    = useAppTheme();
  const insets   = useSafeAreaInsets();
  const { dimensions } = useScreenData();
  const { avatarUrl } = useAvatarSync();

  useEffect(() => {
    logger.info('🔄 Pantalla de perfil montada, cargando datos del usuario...');
    refresh();
  }, [refresh]);

  const onEditProfile = () => handleEditProfile(setShowEditModal);

  // ── Entrance shared values ─────────────────────────────────────────────────
  const headerOp  = useSharedValue(0); const headerY  = useSharedValue(-16);
  const secHOp    = useSharedValue(0); const secHY    = useSharedValue(20);
  const sec1Op    = useSharedValue(0); const sec1Y    = useSharedValue(20);
  const sec2Op    = useSharedValue(0); const sec2Y    = useSharedValue(20);
  const actionsOp = useSharedValue(0); const actionsY = useSharedValue(20);

  // Button press values
  const logoutS  = useSharedValue(1);
  const deleteS  = useSharedValue(1);

  useEffect(() => {
    headerOp.value  = withDelay(0,   withTiming(1, EASE));
    headerY.value   = withDelay(0,   withTiming(0, EASE));
    secHOp.value    = withDelay(100, withTiming(1, EASE));
    secHY.value     = withDelay(100, withTiming(0, EASE));
    sec1Op.value    = withDelay(200, withTiming(1, EASE));
    sec1Y.value     = withDelay(200, withTiming(0, EASE));
    sec2Op.value    = withDelay(300, withTiming(1, EASE));
    sec2Y.value     = withDelay(300, withTiming(0, EASE));
    actionsOp.value = withDelay(400, withTiming(1, EASE));
    actionsY.value  = withDelay(400, withTiming(0, EASE));
  }, []);

  const headerStyle  = useAnimatedStyle(() => ({ opacity: headerOp.value,  transform: [{ translateY: headerY.value }] }));
  const secHStyle    = useAnimatedStyle(() => ({ opacity: secHOp.value,    transform: [{ translateY: secHY.value }] }));
  const sec1Style    = useAnimatedStyle(() => ({ opacity: sec1Op.value,    transform: [{ translateY: sec1Y.value }] }));
  const sec2Style    = useAnimatedStyle(() => ({ opacity: sec2Op.value,    transform: [{ translateY: sec2Y.value }] }));
  const actionsStyle = useAnimatedStyle(() => ({ opacity: actionsOp.value, transform: [{ translateY: actionsY.value }] }));
  const logoutStyle  = useAnimatedStyle(() => ({ transform: [{ scale: logoutS.value }] }));
  const deleteStyle  = useAnimatedStyle(() => ({ transform: [{ scale: deleteS.value }] }));

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>

      {/* Header — slides down */}
      <Animated.View style={headerStyle}>
        <Header />
      </Animated.View>

      <ScrollView
        style={[CommonStyles.tabScrollView, { height: dimensions.height - 200 }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={Platform.OS === "ios"
          ? { ...CommonStyles.tabScrollViewContent, paddingBottom: insets.bottom + 100 }
          : CommonStyles.tabScrollViewContentAndroid
        }
      >
        {/* Section header */}
        <Animated.View style={secHStyle}>
          <SectionHeader
            title="Mi Perfil"
            icon="person.fill"
            iconColor={theme.colors.secondary}
            variant="large"
          />
        </Animated.View>

        {loading && (
          <Animated.View style={sec1Style}>
            <LoadingState message="Cargando perfil..." icon="person.fill" iconColor={theme.colors.primary} />
          </Animated.View>
        )}

        {error && (
          <Animated.View style={[sec1Style, { padding: 16, backgroundColor: theme.colors.error + '20', borderRadius: 8, margin: 16 }]}>
            <ThemedText style={{ color: theme.colors.error, textAlign: 'center' }}>⚠️ {error}</ThemedText>
          </Animated.View>
        )}

        {profile && (
          <>
            {/* Información Personal */}
            <Animated.View style={sec1Style}>
              <ProfileSection title="Información Personal">
                <ProfileInfoCard
                  profile={profileData?.personalInfo || { name: 'Usuario', email: '', phone: '' }}
                  onEdit={onEditProfile}
                  defaultAvatarUrl={avatarUrl}
                />
              </ProfileSection>
            </Animated.View>

            {/* Botones de Emergencia */}
            <Animated.View style={sec2Style}>
              <ProfileSection title="Botones de Emergencia">
                <EviewDevicesSection />
              </ProfileSection>
            </Animated.View>

            {/* Session actions */}
            {user && (
              <Animated.View style={actionsStyle}>
                <ProfileSection title="">
                  <Animated.View style={logoutStyle}>
                    <Pressable
                      onPress={handleLogout}
                      onPressIn={() =>  { logoutS.value = withSpring(0.96, SPRING); }}
                      onPressOut={() => { logoutS.value = withSpring(1.00, SPRING); }}
                      style={styles.logoutButton}
                    >
                      <ThemedText style={styles.logoutButtonText}>Cerrar Sesión</ThemedText>
                    </Pressable>
                  </Animated.View>

                  <Animated.View style={[deleteStyle, { marginTop: 12 }]}>
                    <Pressable
                      onPress={() => setShowDeleteModal(true)}
                      onPressIn={() =>  { deleteS.value = withSpring(0.96, SPRING); }}
                      onPressOut={() => { deleteS.value = withSpring(1.00, SPRING); }}
                      style={[styles.logoutButton, { backgroundColor: 'transparent' }]}
                    >
                      <ThemedText style={[styles.logoutButtonText, { color: theme.colors.error }]}>
                        Eliminar Cuenta
                      </ThemedText>
                    </Pressable>
                  </Animated.View>
                </ProfileSection>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      {profile && (
        <EditProfileModal
          visible={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
          onSave={updateProfile}
        />
      )}

      <DeleteAccountModal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </SafeAreaView>
  );
}
