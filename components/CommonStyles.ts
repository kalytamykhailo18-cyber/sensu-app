// components/CommonStyles.ts
import { Dimensions, StyleSheet } from 'react-native';

// Obtener dimensiones completas del dispositivo
const screenData = Dimensions.get('screen');
const { width: screenWidth, height: screenHeight } = screenData;

// Colores base únicos (definidos primero para evitar referencias circulares)
const baseColors = {
  white: '#fff',
  black: '#000',
  gray333: '#2C1A0E',
  gray666: '#6B5545',
  gray999: '#A89485',
  lightGrayBg: '#FAF6F1',
  borderGray: '#E0D5CA',
};

// Colores comunes consolidados
export const CommonColors = {
  // Colores base únicos
  ...baseColors,
  
  // Colores base del tema
  tintColorLight: '#3D2314',
  tintColorDark: '#F5EDE4',

  // Colores del tema claro
  lightText: '#2C1A0E',
  lightBackground: '#FAF6F1',
  lightTint: '#3D2314',
  lightIcon: '#6B5545',
  lightTabIconDefault: '#A89485',
  lightTabIconSelected: '#3D2314',

  // Colores del tema oscuro
  darkText: '#F5EDE4',
  darkBackground: '#1A120C',
  darkTint: '#F5EDE4',
  darkIcon: '#A89485',
  darkTabIconDefault: '#A89485',
  darkTabIconSelected: '#F5EDE4',

  // Colores principales
  primary: '#3D2314',
  secondary: '#E87A2F',
  success: '#44AA44',
  error: '#D94444',
  warning: '#E87A2F',
  info: '#5A3E2B',
  light: baseColors.lightGrayBg,
  dark: baseColors.gray333,
  gray: baseColors.gray666,
  lightGray: baseColors.gray999,
  
  // Tab bar colors
  tabActive: '#3D2314',
  tabInactive: '#A89485',
  tabBackground: '#6B5545',
  tabBorder: '#E0D5CA',
  tabBackgroundInner: baseColors.white,
  
  // Alert colors
  alertIcon: '#D94444',
  alertSuccess: '#44AA44',
  alertRefresh: '#5A3E2B',
  alertEmpty: baseColors.gray999,
  alertCount: baseColors.gray666,
  alertIndicatorBg: 'rgba(0,0,0,0.1)',
  alertButtonBg: 'rgba(0,0,0,0.05)',
  alertButtonBorder: 'rgba(0,0,0,0.1)',
  
  // Home/Index colors
  homeBackground: baseColors.white,
  
  // Location colors
  locationIcon: '#E87A2F',
  mapContainerBg: '#F5EDE4',
  mapLoadingOverlay: 'rgba(250,246,241,0.8)',
  
  // Header colors
  headerBackground: baseColors.white,
  headerText: baseColors.gray333,
  headerIcon: baseColors.gray666,
  
  // Profile colors
  profileBackground: '#F5EDE4',
  profileBorder: '#E0D5CA',
  profilePlaceholder: '#FAF6F1',
  profileIcon: baseColors.gray666,
  profileLoadingOverlay: 'rgba(255, 255, 255, 0.8)',
  profileEditButton: baseColors.gray666,
  profileEditBorder: baseColors.white,
  
  // Button colors
  buttonPrimary: '#3D2314',
  buttonSecondary: 'rgba(232,122,47,0.1)',
  buttonSecondaryBorder: 'rgba(232,122,47,0.3)',
  buttonSecondaryText: '#E87A2F',
  buttonOutline: '#3D2314',
  buttonDanger: '#D94444',
  buttonSuccess: '#44AA44',
  buttonText: baseColors.white,
  
  // Card colors
  cardBackground: baseColors.white,
  cardBorder: '#EDE5DC',
  cardElevatedShadow: baseColors.black,
  cardElevatedShadowOpacity: 0.1,
  cardOutlinedBorder: baseColors.borderGray,
  cardFilledBackground: baseColors.lightGrayBg,
  cardFilledBorder: baseColors.borderGray,
  
  // Metric colors
  metricBackground: baseColors.white,
  metricBorder: '#E0D5CA',
  metricShadow: baseColors.black,
  metricShadowOpacity: 0.05,
  metricIconBackground: 'rgba(iconColor, 0.12)',
  metricLabel: '#6B5545',
  metricValue: '#2C1A0E',
  metricSubtitle: baseColors.gray999,
  metricBadgeBackground: '#FFF1B6',
  metricBadgeBorder: '#FFE58A',
  metricBadgeText: '#7A5B00',
  metricTrendUp: '#22C55E',
  metricTrendDown: '#EF4444',
  metricTrendStable: baseColors.gray666,
  
  // Section header colors
  sectionBackground: baseColors.lightGrayBg,
  sectionBorder: baseColors.borderGray,
  sectionTitle: baseColors.gray333,
  sectionSubtitle: baseColors.gray666,
  
  // Vital signs colors
  vitalHeart: '#FF4444',
  vitalOxygen: '#4488FF',
  vitalTemperature: '#FF8844',
  
  // Monitoring colors
  monitoringVitalLabel: baseColors.gray666,
  monitoringVitalValue: baseColors.gray333,
  
  // Activity colors
  activityIcon: baseColors.black,
  activityText: baseColors.gray333,
  activityValue: baseColors.gray333,
  
  // Network status colors
  networkErrorBackground: 'rgba(255,107,107,0.05)',
  networkErrorBorder: 'rgba(255,107,107,0.2)',
  networkRetryBackground: 'rgba(232,122,47,0.1)',
  networkRetryBorder: 'rgba(232,122,47,0.3)',
  networkRetryDisabledBackground: 'rgba(0,0,0,0.05)',
  networkRetryDisabledBorder: 'rgba(0,0,0,0.1)',
  
  // Watch icon colors
  watchIconDefault: '#E87A2F',
  watchIconBackground: baseColors.white,
  watchIconBorder: '#E87A2F',
  watchIconShadow: baseColors.black,
  watchIconShadowOpacity: 0.25,

  // Profile component colors
  profileCardBackground: 'rgba(61,35,20,0.05)',
  profileCardBorder: 'rgba(61,35,20,0.15)',
  profileCardText: baseColors.gray333,
  profileCardTextSemiBold: baseColors.gray333,
  profileCardTextBold: baseColors.gray333,
  profileEditButtonBg: '#E87A2F',
  profileInfoCardBackground: 'rgba(245,237,228,0.5)',
  profileInfoCardBorder: 'rgba(61,35,20,0.1)',
  profileEmergencyBackground: 'rgba(217,68,68,0.05)',
  profileEmergencyBorder: 'rgba(217,68,68,0.2)',
  profileEmergencyIcon: '#D94444',
  profileConditionsBackground: 'rgba(217,68,68,0.05)',
  profileConditionsBorder: 'rgba(217,68,68,0.2)',
  profileConditionsIcon: '#D94444',
  profileMedicationsBackground: 'rgba(232,122,47,0.05)',
  profileMedicationsBorder: 'rgba(232,122,47,0.2)',
  profileMedicationsIcon: '#E87A2F',
  profileActionsBackground: 'rgba(61,35,20,0.05)',
  profileActionsBorder: 'rgba(61,35,20,0.15)',
  
  // AnimatedAlertCard colors
  alertCardBackground: '#F5EDE4',
  alertCardBorder: '#E0D5CA',
  alertCardShadow: baseColors.black,
  alertCardShadowOpacity: 0.08,
  alertUnreadBorder: '#D94444',
  alertUnreadBackground: 'rgba(217,68,68,0.03)',
  alertUnreadBorderLeft: '#D94444',
  alertTitle: baseColors.gray333,
  alertMessage: baseColors.gray666,
  alertTime: baseColors.gray999,
  alertActionButtonBg: 'rgba(0,0,0,0.05)',
  alertMarkAsReadIcon: '#44AA44',
  alertDeleteIcon: '#D94444',
  alertScheduledBackground: 'rgba(61,35,20,0.02)',
  alertScheduledBorder: '#EDE5DC',
  alertScheduledText: baseColors.gray666,
  alertScheduledIcon: baseColors.gray666,
  
  // Alert priority colors
  alertPriorityCritical: '#CC3333',
  alertPriorityHigh: '#D94444',
  alertPriorityMedium: '#E87A2F',
  alertPriorityLow: '#44AA44',
  
  // EmptyState colors
  emptyStateIconDefault: baseColors.gray999,
  emptyStateTitle: baseColors.gray333,
  emptyStateSubtitle: baseColors.gray666,
  
  // LoadingState colors
  loadingStateIconDefault: '#E87A2F',
  loadingStateText: baseColors.gray666,
  loadingStateSpinner: '#E87A2F',
  
  // StatusBadge colors
  statusBadgeSuccessBg: 'rgba(68,170,68,0.1)',
  statusBadgeSuccessBorder: 'rgba(68,170,68,0.3)',
  statusBadgeSuccessText: '#44AA44',
  statusBadgeSuccessIcon: '#44AA44',
  statusBadgeErrorBg: 'rgba(217,68,68,0.1)',
  statusBadgeErrorBorder: 'rgba(217,68,68,0.3)',
  statusBadgeErrorText: '#D94444',
  statusBadgeErrorIcon: '#D94444',
  statusBadgeLoadingBg: 'rgba(232,122,47,0.1)',
  statusBadgeLoadingBorder: 'rgba(232,122,47,0.3)',
  statusBadgeLoadingText: '#E87A2F',
  statusBadgeLoadingIcon: '#E87A2F',
  statusBadgeWarningBg: 'rgba(255,165,0,0.1)',
  statusBadgeWarningBorder: 'rgba(255,165,0,0.3)',
  statusBadgeWarningText: '#FFA500',
  statusBadgeWarningIcon: '#FFA500',
  statusBadgeDefaultBg: 'rgba(102,102,102,0.1)',
  statusBadgeDefaultBorder: 'rgba(102,102,102,0.3)',
  statusBadgeDefaultText: baseColors.gray666,
  statusBadgeDefaultIcon: baseColors.gray666,
  
  // BatteryGauge colors
  batteryGaugeBorder: '#D1D5DB',
  batteryGaugeBackground: baseColors.white,
  batteryGaugeTrack: '#F3F4F6',
  batteryGaugeCap: '#D1D5DB',
  batteryGaugeText: '#374151',
  batteryGaugeLow: '#FF3B30',
  batteryGaugeMedium: '#FFA500',
  batteryGaugeHigh: '#24C35D',
  
  // TabBarBackground colors
  tabBarBackgroundAndroid: 'rgba(255,255,255,0.95)',
  
  // Header colors (additional)
  headerIconBlack: baseColors.black,
  
  // EditProfileModal colors
  editProfileModalOverlay: 'rgba(0, 0, 0, 0.5)',
  editProfileModalBackground: baseColors.white,
  editProfileModalText: baseColors.gray333,
  editProfileModalCloseButtonBg: 'rgba(61, 35, 20, 0.1)',
  editProfileModalInputBorder: '#E0D5CA',
  editProfileModalInputBackground: baseColors.white,
  editProfileModalPlaceholder: '#A89485',
  editProfileModalPickerBorder: '#E0D5CA',
  editProfileModalPickerBackground: baseColors.white,
  editProfileModalPickerItemBorder: '#EDE5DC',
  editProfileModalSelectedItemBg: 'rgba(232, 122, 47, 0.1)',
  editProfileModalCancelButtonBg: 'rgba(61, 35, 20, 0.1)',
  editProfileModalSaveButtonBg: '#3D2314',
  editProfileModalSaveButtonText: baseColors.white,
  editProfileModalDisabledButtonBg: 'rgba(61, 35, 20, 0.3)',
  editProfileModalButtonPrimaryBg: '#E87A2F',
  editProfileModalCheckmarkIcon: '#E87A2F',
};

// Función para crear estilos dinámicos basados en el tema
export function createThemedStyles(theme: { colors: any; isDark: boolean }) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: screenWidth,
      minHeight: screenHeight,
    },
    scrollView: {
      flex: 1,
      width: '100%',
    },
    // Estilos globales para tabs con scroll consistente
    tabScrollView: {
      flex: 1,
      width: '100%',
    },
    tabScrollViewContent: {
      paddingBottom: 100, // Valor base para iOS
    },
    tabScrollViewContentAndroid: {
      paddingBottom: 100, // Valor específico para Android
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.text,
      marginLeft: 12,
      flex: 1,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    badge: {
      backgroundColor: theme.colors.error,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: 'center',
    },
    badgeText: {
      color: theme.colors.white,
      fontSize: 12,
      fontWeight: '700',
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },
    errorContainer: {
      backgroundColor: theme.colors.isDark ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.isDark ? 'rgba(255,107,107,0.4)' : 'rgba(255,107,107,0.3)',
      marginHorizontal: 20,
      marginVertical: 8,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
    emptyContainer: {
      padding: 40,
      alignItems: 'center',
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    secondaryButton: {
      backgroundColor: theme.colors.buttonSecondary,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.colors.buttonSecondaryBorder,
      alignItems: 'center',
    },
    secondaryButtonText: {
      color: theme.colors.buttonSecondaryText,
      fontSize: 14,
      fontWeight: '600',
    },
    infoContainer: {
      backgroundColor: theme.colors.surface,
      padding: 20,
      marginHorizontal: 20,
      marginVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    subtitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
  });
}

// Estilos estáticos para compatibilidad (modo claro por defecto)
export const CommonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: baseColors.white,
    width: screenWidth,
    minHeight: screenHeight,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  // Estilos globales para tabs con scroll consistente
  tabScrollView: {
    flex: 1,
    width: '100%',
  },
  tabScrollViewContent: {
    paddingBottom: 100, // Valor base para iOS
  },
  tabScrollViewContentAndroid: {
    paddingBottom: 100, // Valor específico para Android
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: baseColors.lightGrayBg,
    borderBottomWidth: 1,
    borderBottomColor: baseColors.borderGray,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: baseColors.gray333,
    marginLeft: 12,
    flex: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#D94444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: baseColors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorContainer: {
    backgroundColor: 'rgba(217,68,68,0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(217,68,68,0.3)',
    marginHorizontal: 20,
    marginVertical: 8,
  },
  errorText: {
    color: '#D94444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: baseColors.gray333,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: baseColors.gray666,
    textAlign: 'center',
    lineHeight: 20,
  },
  secondaryButton: {
    backgroundColor: 'rgba(232,122,47,0.1)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(232,122,47,0.3)',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#E87A2F',
    fontSize: 14,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: baseColors.lightGrayBg,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: baseColors.borderGray,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: baseColors.gray333,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: baseColors.gray666,
    lineHeight: 20,
  },
});

// Utilidades puras: reciben width/height o funciones ya construidas
export function getCardWidth(width: number, percent: number) {
  // Usar el ancho completo menos márgenes mínimos
  const horizontalGutters = 32; // 16px por lado
  const available = Math.max(0, width - horizontalGutters);
  return (available * Math.max(0, Math.min(1, percent / 100)));
}

// Función para obtener padding responsivo basado en el ancho de pantalla
export function getResponsivePadding(small: number, medium: number, large: number) {
  const width = screenWidth;
  if (width < 360) return small;
  if (width < 768) return medium;
  return large;
}

// Función para obtener valores responsivos basados en el ancho de pantalla
export function getResponsiveValue(small: number, medium: number, large: number) {
  const width = screenWidth;
  if (width < 360) return small;
  if (width < 768) return medium;
  return large;
}

// Función para obtener tamaños de fuente responsivos basados en el ancho de pantalla
export function getResponsiveFontSize(small: number, medium: number, large: number) {
  const width = screenWidth;
  if (width < 360) return small;
  if (width < 768) return medium;
  return large;
}

// Si prefieres factorías, puedes montar lo siguiente con helpers del hook
export function createTypography(getFS: (s:number,m:number,l:number)=>number) {
  return StyleSheet.create({
    h1: { fontSize: getFS(24, 28, 32), fontWeight: '700', color: baseColors.gray333 },
    h2: { fontSize: getFS(16, 18, 20), fontWeight: '600', color: baseColors.gray333 },
    p:  { fontSize: getFS(12, 14, 16), color: baseColors.gray666 },
  });
}