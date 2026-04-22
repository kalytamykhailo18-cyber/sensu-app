import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CommonStyles } from '@/components/CommonStyles';
import Header from '@/components/header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LocationSection } from '@/components/LocationSection';
import { Button, DeviceSelector } from '@/components/shared';
import { BatteryGauge } from '@/components/shared/BatterGauge';
import { useDeviceStatus } from '@/contexts/DeviceStatusContext';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useDeviceAlerts } from '@/hooks/useDeviceConfig';
import { useScreenData } from '@/hooks/shared';
import useSOS from '@/hooks/shared/useSOS';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMaps } from '@/hooks/useMaps';
import { useProfile } from '@/hooks/useProfile';
import type { DeviceAlert } from '@/types/device';

const SPRING = { damping: 18, stiffness: 200 };
const EASE   = { duration: 400 };

// ── Animated alert card — each has its own entrance ──────────────────────────
function AnimatedAlertCard({
  alert, index, getColor, formatTime, cardStyle, typeStyle, timeStyle,
}: {
  alert: DeviceAlert; index: number;
  getColor: (p: string) => string;
  formatTime: (t: string) => string;
  cardStyle: object; typeStyle: object; timeStyle: object;
}) {
  const op = useSharedValue(0);
  const ty = useSharedValue(14);

  useEffect(() => {
    op.value = withDelay(index * 65, withTiming(1, EASE));
    ty.value = withDelay(index * 65, withTiming(0, EASE));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View style={[cardStyle, { borderLeftColor: getColor(alert.priority) }, anim]}>
      <Text style={typeStyle}>{alert.message}</Text>
      <Text style={timeStyle}>{formatTime(alert.timestamp)}</Text>
    </Animated.View>
  );
}

export default function HomeScreen() {
  const tb     = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme  = useAppTheme();
  const mapsData = useMaps();
  const { profile } = useProfile();
  const { callSOS } = useSOS();
  const { watchImei, watches, selectDevice } = useWatchConfig();
  const { dimensions, getResponsivePadding, getPercentWidth } = useScreenData();

  const bottomGap = Platform.OS === 'ios'
    ? 16
    : Math.max(Math.ceil(tb || 0), 64 + insets.bottom) + 24;

  const deviceId = watchImei;
  const { activeStatus: deviceStatus, loading: statusLoading, statuses } = useDeviceStatus();
  const { alerts: recentAlerts } = useDeviceAlerts({
    deviceId, limit: 5, pollInterval: 30000, enabled: !!deviceId,
  });

  const { mapProvider, initialRegion, currentRegion, isLoading } = mapsData;
  const batteryLevel = deviceStatus?.battery ?? null;
  const isCharging   = Boolean(deviceStatus?.is_charging);
  const isOnline     = Boolean(deviceStatus?.online);

  // ── Entrance shared values ─────────────────────────────────────────────────
  const headerOp   = useSharedValue(0); const headerY  = useSharedValue(-18);
  const secHOp     = useSharedValue(0); const secHY    = useSharedValue(20);
  const devSelOp   = useSharedValue(0); const devSelY  = useSharedValue(20);
  const statusOp   = useSharedValue(0); const statusS  = useSharedValue(0.96);
  const mapOp      = useSharedValue(0); const mapS     = useSharedValue(0.97);
  const alertsOp   = useSharedValue(0); const alertsY  = useSharedValue(16);

  // ── Interaction shared values ──────────────────────────────────────────────
  const pulse      = useSharedValue(1); // status dot
  const sosGlow    = useSharedValue(1); // SOS button attention

  useEffect(() => {
    // Entrance cascade
    headerOp.value = withDelay(0,   withTiming(1, EASE));
    headerY.value  = withDelay(0,   withTiming(0, EASE));
    secHOp.value   = withDelay(100, withTiming(1, EASE));
    secHY.value    = withDelay(100, withTiming(0, EASE));
    devSelOp.value = withDelay(190, withTiming(1, EASE));
    devSelY.value  = withDelay(190, withTiming(0, EASE));
    statusOp.value = withDelay(270, withTiming(1, EASE));
    statusS.value  = withDelay(270, withSpring(1, SPRING));
    mapOp.value    = withDelay(360, withTiming(1, EASE));
    mapS.value     = withDelay(360, withSpring(1, SPRING));
    alertsOp.value = withDelay(460, withTiming(1, EASE));
    alertsY.value  = withDelay(460, withTiming(0, EASE));

    // SOS gentle attention pulse
    sosGlow.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 900 }), withTiming(1.00, { duration: 900 })),
      -1, false
    );
  }, []);

  // Online dot pulse — restarts when isOnline changes
  useEffect(() => {
    if (isOnline) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.7, { duration: 700 }), withTiming(1.0, { duration: 700 })),
        -1, false
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [isOnline]);

  // ── Animated styles ────────────────────────────────────────────────────────
  const headerStyle  = useAnimatedStyle(() => ({ opacity: headerOp.value, transform: [{ translateY: headerY.value }] }));
  const secHStyle    = useAnimatedStyle(() => ({ opacity: secHOp.value,   transform: [{ translateY: secHY.value }] }));
  const devSelStyle  = useAnimatedStyle(() => ({ opacity: devSelOp.value, transform: [{ translateY: devSelY.value }] }));
  const statusStyle  = useAnimatedStyle(() => ({ opacity: statusOp.value, transform: [{ scale: statusS.value }] }));
  const mapStyle     = useAnimatedStyle(() => ({ opacity: mapOp.value,    transform: [{ scale: mapS.value }] }));
  const alertsStyle  = useAnimatedStyle(() => ({ opacity: alertsOp.value, transform: [{ translateY: alertsY.value }] }));
  const dotStyle     = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }], opacity: interpolate(pulse.value, [1, 1.7], [1, 0.3], 'clamp') }));
  const sosStyle     = useAnimatedStyle(() => ({ transform: [{ scale: sosGlow.value }] }));

  const isNarrow = dimensions.width < 480;
  const [batteryContainerWidth, setBatteryContainerWidth] = useState(0);

  // ── Styles ─────────────────────────────────────────────────────────────────
  const styles = useMemo(() => {
    const getPad = (s: number, m: number, l: number) => getResponsivePadding(s, m, l);
    return StyleSheet.create({
      container: { flex: 1, backgroundColor: theme.colors.background, width: '100%', borderLeftWidth: 4, borderLeftColor: theme.colors.secondary },
      scrollView: { flex: 1, width: '100%' },
      // Hero
      hero: {
        paddingHorizontal: getPad(16, 20, 24),
        paddingTop: getPad(16, 20, 24),
        paddingBottom: getPad(12, 16, 20),
      },
      heroRow: { flexDirection: 'row', alignItems: 'center', gap: getPad(8, 10, 12), marginBottom: getPad(10, 12, 14) },
      heroTitle: { fontSize: getPad(22, 26, 30), fontWeight: '700', color: theme.colors.text },
      heroSubtitle: { fontSize: getPad(12, 13, 14), color: theme.colors.textSecondary, marginTop: 2 },
      heroActions: {
        flexDirection: 'row', alignItems: 'center',
        justifyContent: 'space-between',
        gap: getPad(8, 12, 16),
        marginTop: getPad(4, 6, 8),
      },
      actionButtons: {
        flexDirection: 'row', gap: getPad(8, 12, 16), justifyContent: 'center',
      },
      statusCard: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: 12, padding: 16,
        marginHorizontal: 16, marginTop: 16, marginBottom: 12,
        borderWidth: 1, borderColor: theme.colors.border,
        borderTopWidth: 3, borderTopColor: theme.colors.secondary,
      },
      statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
      statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
      statusDotWrap: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
      statusDot: { width: 8, height: 8, borderRadius: 4 },
      statusText: { fontSize: 13, color: theme.colors.textSecondary },
      lastSeenText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 8 },
      alertsSection: { marginHorizontal: 16, marginBottom: 12 },
      alertsSectionTitle: { fontSize: 15, fontWeight: '600', color: theme.colors.text, marginBottom: 8 },
      alertCard: {
        backgroundColor: theme.colors.cardBackground,
        borderRadius: 8, padding: 12, marginBottom: 6,
        borderLeftWidth: 3, borderWidth: 1, borderColor: theme.colors.border,
      },
      alertType: { fontSize: 13, fontWeight: '600', color: theme.colors.text },
      alertTime: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 },
      noAlertsText: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 16 },
    });
  }, [theme, getResponsivePadding]);

  const getAlertColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#E53E3E';
      case 'high':     return '#DD6B20';
      case 'medium':   return '#D69E2E';
      default:         return '#718096';
    }
  };

  const formatAlertTime = (timestamp: string) => {
    try {
      const date    = new Date(timestamp);
      const diffMs  = Date.now() - date.getTime();
      const diffMin = Math.floor(diffMs / 60000);
      if (diffMin < 1)  return 'Ahora';
      if (diffMin < 60) return `Hace ${diffMin}m`;
      const diffH = Math.floor(diffMin / 60);
      if (diffH < 24)   return `Hace ${diffH}h`;
      return `Hace ${Math.floor(diffH / 24)}d`;
    } catch { return timestamp; }
  };

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
        {/* Hero — slides up */}
        <Animated.View style={[styles.hero, secHStyle]}>
          {/* Title row */}
          <View style={styles.heroRow}>
            <IconSymbol name="house.fill" size={isNarrow ? 24 : 30} color={theme.colors.primary} />
            <View>
              <Text style={styles.heroTitle}>Inicio</Text>
              <Text style={styles.heroSubtitle}>Estado de tu dispositivo</Text>
            </View>
          </View>

          {/* Actions row — battery left (flex:1), SOS always right */}
          <View style={styles.heroActions}>
            <View
              style={{ flex: 1 }}
              onLayout={e => setBatteryContainerWidth(e.nativeEvent.layout.width)}
            >
              {deviceId && batteryContainerWidth > 0 && (
                <BatteryGauge
                  level={batteryLevel}
                  charging={isCharging}
                  width={batteryContainerWidth}
                  height={isNarrow ? 32 : 28}
                />
              )}
            </View>
            <Animated.View style={sosStyle}>
              <Button
                title="SOS"
                onPress={() => profile && callSOS(profile)}
                variant="danger"
                size={isNarrow ? 'medium' : 'small'}
              />
            </Animated.View>
          </View>
        </Animated.View>

        {/* Device selector — slides up */}
        <Animated.View style={devSelStyle}>
          <DeviceSelector
            activeDeviceId={watchImei}
            devices={watches}
            statuses={statuses}
            onSelectDevice={selectDevice}
            onLinkDevice={() => router.push('/eview-setup')}
          />
        </Animated.View>

        {/* Status card — scales in */}
        <Animated.View style={statusStyle}>
          {!deviceId ? null : (
            <View style={styles.statusCard}>
              <View style={styles.statusRow}>
                <View style={styles.statusBadge}>
                  {/* Pulsing dot */}
                  <View style={styles.statusDotWrap}>
                    <Animated.View style={[styles.statusDot, { backgroundColor: isOnline ? '#48BB78' : '#A0AEC0' }, dotStyle]} />
                  </View>
                  <Text style={styles.statusText}>
                    {statusLoading ? 'Conectando...' : isOnline ? 'En línea' : 'Desconectado'}
                  </Text>
                </View>
                {deviceStatus?.signal_strength != null && (
                  <Text style={styles.statusText}>Señal: {deviceStatus.signal_strength}%</Text>
                )}
              </View>
              {deviceStatus?.last_event_time && (
                <Text style={styles.lastSeenText}>
                  Última conexión: {formatAlertTime(deviceStatus.last_event_time)}
                </Text>
              )}
            </View>
          )}
        </Animated.View>

        {/* Location map — scales in */}
        <Animated.View style={mapStyle}>
          <LocationSection
            mapProvider={mapProvider}
            initialRegion={initialRegion}
            currentRegion={currentRegion}
            isLoading={isLoading}
            isConnected={mapsData.isConnected}
          />
        </Animated.View>

        {/* Recent alerts — staggered cards */}
        {deviceId && (
          <Animated.View style={[styles.alertsSection, alertsStyle]}>
            <Text style={styles.alertsSectionTitle}>Alertas Recientes</Text>
            {recentAlerts.length > 0 ? (
              recentAlerts.map((alert, i) => (
                <AnimatedAlertCard
                  key={alert.id}
                  alert={alert}
                  index={i}
                  getColor={getAlertColor}
                  formatTime={formatAlertTime}
                  cardStyle={styles.alertCard}
                  typeStyle={styles.alertType}
                  timeStyle={styles.alertTime}
                />
              ))
            ) : (
              <Text style={styles.noAlertsText}>Sin alertas recientes</Text>
            )}
          </Animated.View>
        )}
      </ScrollView>

      {Platform.OS !== 'ios' && <View style={{ height: bottomGap }} />}
    </SafeAreaView>
  );
}
