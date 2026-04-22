import Header from "@/components/header";
import {
  DeviceSelector,
  EmptyState,
  LoadingState,
  SectionHeader
} from "@/components/shared";
import { ThemedText } from "@/components/ThemedText";
import { useDeviceAlerts } from "@/hooks/useDeviceConfig";
import { useDeviceStatus } from "@/contexts/DeviceStatusContext";
import { useWatchConfig } from "@/contexts/WatchConfigContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { router } from "expo-router";
import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import type { AlertType, DeviceAlert } from "@/types/device";

const SPRING = { damping: 18, stiffness: 200 };
const EASE   = { duration: 380 };

type FilterOption = 'all' | AlertType;

interface FilterChip {
  key: FilterOption;
  label: string;
}

const FILTER_CHIPS: FilterChip[] = [
  { key: 'all', label: 'Todas' },
  { key: 'sos', label: 'SOS' },
  { key: 'fall_detection', label: 'Caída' },
  { key: 'geofence_exit', label: 'Geocerca' },
  { key: 'battery_low', label: 'Batería' },
];

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#E53E3E',
  high: '#DD6B20',
  medium: '#D69E2E',
  low: '#718096',
};

const ALERT_ICONS: Record<string, string> = {
  sos: '🆘',
  fall_detection: '⚠️',
  geofence_exit: '📍',
  geofence_enter: '📍',
  battery_low: '🔋',
  button_press: '🔘',
};

function formatAlertTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  } catch { return timestamp; }
}

function getAlertTypeLabel(eventType: string): string {
  switch (eventType) {
    case 'sos': return 'SOS';
    case 'fall_detection': return 'Detección de caída';
    case 'geofence_exit': return 'Salida de geocerca';
    case 'geofence_enter': return 'Entrada a geocerca';
    case 'battery_low': return 'Batería baja';
    case 'button_press': return 'Botón presionado';
    default: return eventType;
  }
}

// ── Animated chip — spring press + active indicator ───────────────────────────
function AnimatedChip({
  chip, active, onPress, index, styles,
}: {
  chip: FilterChip; active: boolean; onPress: () => void; index: number;
  styles: { filterChip: object; filterChipActive: object; filterChipInactive: object; filterChipText: object; filterChipTextActive: object; filterChipTextInactive: object };
}) {
  const sc  = useSharedValue(1);
  const op  = useSharedValue(0);
  const tx  = useSharedValue(10);

  useEffect(() => {
    op.value = withDelay(index * 55, withTiming(1, EASE));
    tx.value = withDelay(index * 55, withTiming(0, EASE));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateX: tx.value }, { scale: sc.value }],
  }));

  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>  { sc.value = withSpring(0.94, SPRING); }}
        onPressOut={() => { sc.value = withSpring(1.00, SPRING); }}
        style={[styles.filterChip, active ? styles.filterChipActive : styles.filterChipInactive]}
      >
        <Text style={[styles.filterChipText, active ? styles.filterChipTextActive : styles.filterChipTextInactive]}>
          {chip.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// ── Animated alert card ────────────────────────────────────────────────────────
function AnimatedAlertCard({
  alert, index, styles, onLocationPress,
}: {
  alert: DeviceAlert; index: number;
  styles: { alertCard: object; alertHeader: object; alertTypeRow: object; alertIcon: object; alertTypeLabel: object; alertMessage: object; alertFooter: object; alertTime: object; alertLocation: object };
  onLocationPress: (a: DeviceAlert) => void;
}) {
  const op = useSharedValue(0);
  const ty = useSharedValue(16);
  const sc = useSharedValue(0.97);

  useEffect(() => {
    op.value = withDelay(index * 55, withTiming(1, EASE));
    ty.value = withDelay(index * 55, withTiming(0, EASE));
    sc.value = withDelay(index * 55, withSpring(1, SPRING));
  }, []);

  const ps  = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }, { scale: sc.value * ps.value }],
  }));

  const priorityColor = PRIORITY_COLORS[alert.priority] || PRIORITY_COLORS.low;
  const icon = ALERT_ICONS[alert.event_type] || '🔔';
  const hasLocation = alert.latitude != null && alert.longitude != null;

  return (
    <Animated.View style={[styles.alertCard, { borderLeftColor: priorityColor }, anim]}>
      <Pressable
        onPressIn={() =>  { ps.value = withSpring(0.98, SPRING); }}
        onPressOut={() => { ps.value = withSpring(1.00, SPRING); }}
        onPress={hasLocation ? () => onLocationPress(alert) : undefined}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertTypeRow}>
            <Text style={styles.alertIcon}>{icon}</Text>
            <Text style={[styles.alertTypeLabel, { color: priorityColor }]}>
              {getAlertTypeLabel(alert.event_type)}
            </Text>
          </View>
        </View>
        <Text style={styles.alertMessage}>{alert.message}</Text>
        <View style={styles.alertFooter}>
          <Text style={styles.alertTime}>{formatAlertTime(alert.timestamp)}</Text>
          {hasLocation && (
            <Text style={[styles.alertLocation, { textDecorationLine: 'underline' }]}>Ver en mapa</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function AlertaScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all');
  const { watchImei: deviceId, watches, selectDevice } = useWatchConfig();
  const { statuses } = useDeviceStatus();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();

  // ── Entrance shared values ─────────────────────────────────────────────────
  const headerOp  = useSharedValue(0); const headerY  = useSharedValue(-16);
  const secHOp    = useSharedValue(0); const secHY    = useSharedValue(18);
  const devSelOp  = useSharedValue(0); const devSelY  = useSharedValue(14);

  useEffect(() => {
    headerOp.value = withDelay(0,   withTiming(1, EASE));
    headerY.value  = withDelay(0,   withTiming(0, EASE));
    secHOp.value   = withDelay(80,  withTiming(1, EASE));
    secHY.value    = withDelay(80,  withTiming(0, EASE));
    devSelOp.value = withDelay(160, withTiming(1, EASE));
    devSelY.value  = withDelay(160, withTiming(0, EASE));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value, transform: [{ translateY: headerY.value }] }));
  const secHStyle   = useAnimatedStyle(() => ({ opacity: secHOp.value,   transform: [{ translateY: secHY.value }] }));
  const devSelStyle = useAnimatedStyle(() => ({ opacity: devSelOp.value, transform: [{ translateY: devSelY.value }] }));

  const eventTypeFilter = activeFilter === 'all' ? undefined
    : activeFilter === 'geofence_exit' ? undefined
    : activeFilter;

  const { alerts, loading, error, refresh } = useDeviceAlerts({
    deviceId: deviceId || null,
    eventType: eventTypeFilter as AlertType | undefined,
    limit: 100,
    pollInterval: 30000,
    enabled: !!deviceId,
  });

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return alerts;
    if (activeFilter === 'geofence_exit') {
      return alerts.filter(a =>
        a.event_type === 'geofence_exit' || a.event_type === 'geofence_enter'
      );
    }
    return alerts;
  }, [alerts, activeFilter]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    fixedContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      backgroundColor: theme.colors.background,
    },
    headerInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    countIndicator: {
      backgroundColor: theme.isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.1)',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    countText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: "600",
    },
    filtersContainer: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 12,
      marginBottom: 4,
    },
    filterChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1,
    },
    filterChipActive: {
      backgroundColor: theme.colors.text,
      borderColor: theme.colors.text,
    },
    filterChipInactive: {
      backgroundColor: 'transparent',
      borderColor: theme.colors.border,
    },
    filterChipText: {
      fontSize: 13,
      fontWeight: '600',
    },
    filterChipTextActive: {
      color: theme.colors.background,
    },
    filterChipTextInactive: {
      color: theme.colors.textSecondary,
    },
    alertsScrollView: {
      flex: 1,
      marginTop: 12,
    },
    alertsScrollContent: {
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === "ios" ? insets.bottom + 80 : 80,
    },
    alertCard: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10,
      padding: 14,
      marginBottom: 8,
      borderLeftWidth: 3,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    alertHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    alertTypeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      flex: 1,
    },
    alertIcon: { fontSize: 16 },
    alertTypeLabel: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    alertMessage: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
    alertFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    alertTime: { fontSize: 12, color: theme.colors.textSecondary },
    alertLocation: { fontSize: 11, color: theme.colors.textSecondary },
    errorContainer: {
      backgroundColor: theme.isDark ? 'rgba(255,107,107,0.2)' : 'rgba(255,107,107,0.1)',
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255,107,107,0.4)' : 'rgba(255,107,107,0.3)',
      marginTop: 12,
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
  }), [theme, insets.bottom]);

  const handleAlertLocationPress = useCallback((alert: DeviceAlert) => {
    if (alert.latitude != null && alert.longitude != null) {
      router.push({
        pathname: '/(tabs)/ubicacion',
        params: {
          alertLat: String(alert.latitude),
          alertLng: String(alert.longitude),
          alertType: alert.event_type,
        },
      });
    }
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>

      {/* Header — slides down */}
      <Animated.View style={headerStyle}>
        <Header />
      </Animated.View>

      <View style={styles.fixedContent}>
        {/* Section header — slides up */}
        <Animated.View style={secHStyle}>
          <SectionHeader
            title="Alertas"
            icon="bell.fill"
            iconColor={theme.colors.error}
            rightElement={
              <View style={styles.headerInfo}>
                <View style={styles.countIndicator}>
                  <ThemedText style={styles.countText}>
                    {filteredAlerts.length} alertas
                  </ThemedText>
                </View>
              </View>
            }
          />
        </Animated.View>

        {/* Device selector — slides up */}
        <Animated.View style={devSelStyle}>
          <DeviceSelector
            activeDeviceId={deviceId}
            devices={watches}
            statuses={statuses}
            onSelectDevice={selectDevice}
            onLinkDevice={() => router.push('/eview-setup')}
          />
        </Animated.View>

        {/* Filter chips — staggered slide-in from left */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {FILTER_CHIPS.map((chip, i) => (
            <AnimatedChip
              key={chip.key}
              chip={chip}
              active={activeFilter === chip.key}
              onPress={() => setActiveFilter(chip.key)}
              index={i}
              styles={styles}
            />
          ))}
        </ScrollView>

        {loading && (
          <LoadingState
            message="Cargando alertas..."
            icon="bell.fill"
            iconColor={theme.colors.error}
          />
        )}

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
          </View>
        )}
      </View>

      {/* Alert cards — each animates individually */}
      <ScrollView
        style={styles.alertsScrollView}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.alertsScrollContent}
      >
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, i) => (
            <AnimatedAlertCard
              key={alert.id}
              alert={alert}
              index={i}
              styles={styles}
              onLocationPress={handleAlertLocationPress}
            />
          ))
        ) : (
          !loading && (
            <EmptyState
              icon="bell.slash"
              iconColor={theme.colors.textTertiary}
              title="No hay alertas"
              subtitle={activeFilter === 'all'
                ? "No se encontraron alertas para tu dispositivo"
                : `No hay alertas de tipo "${FILTER_CHIPS.find(c => c.key === activeFilter)?.label}" registradas`
              }
              actionText="Actualizar"
              onAction={refresh}
            />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
