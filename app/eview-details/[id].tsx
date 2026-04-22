import { CommonStyles } from '@/components/CommonStyles';
import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useEviewEvents, useEviewStatus } from '@/hooks/useEviewData';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const SPRING = { damping: 18, stiffness: 200 };
const EASE   = { duration: 380 };

// ── Animated status row ────────────────────────────────────────────────────────
function AnimatedRow({
  label, children, isLast, index, styles,
}: {
  label: string; children: React.ReactNode; isLast?: boolean; index: number;
  styles: { row: object; lastRow: object; label: object };
}) {
  const op = useSharedValue(0);
  const tx = useSharedValue(-12);

  useEffect(() => {
    op.value = withDelay(index * 60, withTiming(1, EASE));
    tx.value = withDelay(index * 60, withTiming(0, EASE));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateX: tx.value }],
  }));

  return (
    <Animated.View style={[styles.row, isLast && styles.lastRow, anim]}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </Animated.View>
  );
}

// ── Animated event card ────────────────────────────────────────────────────────
function AnimatedEventCard({
  event, index, styles, getEventTypeLabel, formatDate,
}: {
  event: any; index: number;
  styles: { eventCard: object; eventSOS: object; eventType: object; eventTime: object };
  getEventTypeLabel: (t: string) => string;
  formatDate: (d: string) => string;
}) {
  const op = useSharedValue(0);
  const ty = useSharedValue(14);

  useEffect(() => {
    op.value = withDelay(index * 45, withTiming(1, EASE));
    ty.value = withDelay(index * 45, withTiming(0, EASE));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }],
  }));

  return (
    <Animated.View style={[styles.eventCard, event.event_type === 'sos' && styles.eventSOS, anim]}>
      <ThemedText style={styles.eventType}>{getEventTypeLabel(event.event_type)}</ThemedText>
      <ThemedText style={styles.eventTime}>{formatDate(event.timestamp)}</ThemedText>
    </Animated.View>
  );
}

export default function EviewDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();

  const { status, loading: statusLoading, refresh: refreshStatus } = useEviewStatus(id || '');
  const { events, loading: eventsLoading, refresh: refreshEvents } = useEviewEvents(id || '', 20);

  useEffect(() => {
    if (!id) router.back();
  }, [id]);

  // ── Entrance shared values ─────────────────────────────────────────────────
  const sec1Op = useSharedValue(0); const sec1S = useSharedValue(0.96);
  const sec2Op = useSharedValue(0); const sec2Y = useSharedValue(20);
  const btnOp  = useSharedValue(0); const btnS  = useSharedValue(0.94);
  const btnPs  = useSharedValue(1);

  useEffect(() => {
    sec1Op.value = withDelay(0,   withTiming(1, EASE));
    sec1S.value  = withDelay(0,   withSpring(1, SPRING));
    sec2Op.value = withDelay(160, withTiming(1, EASE));
    sec2Y.value  = withDelay(160, withTiming(0, EASE));
    btnOp.value  = withDelay(300, withTiming(1, EASE));
    btnS.value   = withDelay(300, withSpring(1, SPRING));
  }, []);

  const sec1Style = useAnimatedStyle(() => ({ opacity: sec1Op.value, transform: [{ scale: sec1S.value }] }));
  const sec2Style = useAnimatedStyle(() => ({ opacity: sec2Op.value, transform: [{ translateY: sec2Y.value }] }));
  const btnStyle  = useAnimatedStyle(() => ({
    opacity: btnOp.value,
    transform: [{ scale: btnS.value * btnPs.value }],
  }));

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    section: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12, padding: 16,
      marginHorizontal: 16, marginBottom: 16,
    },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: theme.colors.text, marginBottom: 12 },
    row: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    lastRow: { borderBottomWidth: 0 },
    label: { fontSize: 14, color: theme.colors.textSecondary },
    value: { fontSize: 14, fontWeight: '500', color: theme.colors.text },
    statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusOnline: { backgroundColor: theme.colors.success + '20' },
    statusOffline: { backgroundColor: theme.colors.error + '20' },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusDotOnline: { backgroundColor: theme.colors.success },
    statusDotOffline: { backgroundColor: theme.colors.error },
    statusText: { fontSize: 12, fontWeight: '500' },
    statusTextOnline: { color: theme.colors.success },
    statusTextOffline: { color: theme.colors.error },
    eventCard: {
      backgroundColor: theme.colors.background, borderRadius: 8,
      padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.colors.border,
    },
    eventType: { fontSize: 14, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    eventTime: { fontSize: 12, color: theme.colors.textSecondary },
    eventSOS: { borderColor: theme.colors.error, backgroundColor: theme.colors.error + '10' },
    loadingContainer: { alignItems: 'center', padding: 20 },
    emptyEvents: { textAlign: 'center', color: theme.colors.textSecondary, padding: 20 },
    refreshButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 24, paddingVertical: 14,
      borderRadius: 12, alignItems: 'center', marginHorizontal: 16,
    },
    refreshButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
    bottomContainer: {
      backgroundColor: theme.colors.background,
      borderTopWidth: 1, borderTopColor: theme.colors.border,
      paddingTop: 16,
      paddingBottom: Platform.OS === 'ios' ? insets.bottom : 24,
    },
  });

  const isOnline = status?.online ?? false;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('es-ES', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch { return dateString; }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'sos':
      case 'trackerAlarm':      return '🚨 Alerta SOS';
      case 'location':
      case 'trackerRealTime':   return '📍 Ubicación actualizada';
      case 'heartbeat':         return '💓 Latido';
      case 'low_battery':       return '🔋 Batería baja';
      case 'online':            return '🟢 Dispositivo conectado';
      case 'offline':           return '🔴 Dispositivo desconectado';
      case 'iccid':             return '📱 Cambio de SIM';
      default:                  return eventType;
    }
  };

  const handleRefresh = async () => {
    await Promise.all([refreshStatus(), refreshEvents()]);
  };

  if (!id) return null;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{ headerShown: true, headerBackTitle: 'Atrás', title: 'Detalles del Botón' }}
      />

      <ScrollView
        style={CommonStyles.tabScrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ ...CommonStyles.tabScrollViewContent, paddingBottom: 20 }}
      >
        {/* Status section — scales in */}
        <Animated.View style={[styles.section, sec1Style]}>
          <ThemedText style={styles.sectionTitle}>Estado del Dispositivo</ThemedText>
          {statusLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : (
            <>
              <AnimatedRow label="IMEI" index={0} styles={styles}>
                <ThemedText style={styles.value}>{id}</ThemedText>
              </AnimatedRow>

              <AnimatedRow label="Estado" index={1} styles={styles}>
                <View style={[styles.statusBadge, isOnline ? styles.statusOnline : styles.statusOffline]}>
                  <View style={[styles.statusDot, isOnline ? styles.statusDotOnline : styles.statusDotOffline]} />
                  <ThemedText style={[styles.statusText, isOnline ? styles.statusTextOnline : styles.statusTextOffline]}>
                    {isOnline ? 'En línea' : 'Desconectado'}
                  </ThemedText>
                </View>
              </AnimatedRow>

              {status?.battery !== undefined && (
                <AnimatedRow label="Batería" index={2} styles={styles}>
                  <ThemedText style={styles.value}>
                    {status.battery}%{status.is_charging ? ' (Cargando)' : ''}
                  </ThemedText>
                </AnimatedRow>
              )}

              {status?.signal_strength !== undefined && (
                <AnimatedRow label="Señal" index={3} styles={styles}>
                  <ThemedText style={styles.value}>{status.signal_strength}/31</ThemedText>
                </AnimatedRow>
              )}

              {status?.latitude && status?.longitude && (
                <AnimatedRow label="Ubicación" index={4} isLast styles={styles}>
                  <ThemedText style={styles.value}>
                    {status.latitude.toFixed(4)}, {status.longitude.toFixed(4)}
                  </ThemedText>
                </AnimatedRow>
              )}
            </>
          )}
        </Animated.View>

        {/* Events section — slides up, cards stagger */}
        <Animated.View style={[styles.section, sec2Style]}>
          <ThemedText style={styles.sectionTitle}>Eventos Recientes</ThemedText>
          {eventsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          ) : events.length === 0 ? (
            <ThemedText style={styles.emptyEvents}>No hay eventos registrados</ThemedText>
          ) : (
            events.map((event, i) => (
              <AnimatedEventCard
                key={event.id}
                event={event}
                index={i}
                styles={styles}
                getEventTypeLabel={getEventTypeLabel}
                formatDate={formatDate}
              />
            ))
          )}
        </Animated.View>
      </ScrollView>

      {/* Refresh button — spring entrance + press squish */}
      <View style={styles.bottomContainer}>
        <Animated.View style={btnStyle}>
          <Pressable
            style={styles.refreshButton}
            onPress={handleRefresh}
            onPressIn={() =>  { btnPs.value = withSpring(0.96, SPRING); }}
            onPressOut={() => { btnPs.value = withSpring(1.00, SPRING); }}
          >
            <ThemedText style={styles.refreshButtonText}>Actualizar</ThemedText>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
