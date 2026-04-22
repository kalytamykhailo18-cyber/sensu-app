import { router } from 'expo-router';
import Header from '@/components/header';
import { Button, DeviceSelector, SectionHeader } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useDeviceStatus } from '@/contexts/DeviceStatusContext';
import { useBatteryConfig, useGeofences } from '@/hooks/useDeviceConfig';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DeviceService } from '@/services/deviceService';
import React, { useMemo, useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
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

// ── Animated stepper with spring press on buttons ─────────────────────────────
function ValueStepper({
  value, min, max, step, suffix, onValueChange, disabled,
  primaryColor, borderColor, textColor,
}: {
  value: number; min: number; max: number; step: number; suffix?: string;
  onValueChange: (v: number) => void; disabled?: boolean;
  primaryColor: string; borderColor: string; textColor: string;
}) {
  const canDecrement = value > min;
  const canIncrement = value < max;
  const decS = useSharedValue(1);
  const incS = useSharedValue(1);

  const decAnim = useAnimatedStyle(() => ({ transform: [{ scale: decS.value }] }));
  const incAnim = useAnimatedStyle(() => ({ transform: [{ scale: incS.value }] }));

  const btnBase = {
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1, justifyContent: 'center' as const, alignItems: 'center' as const,
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Animated.View style={decAnim}>
        <Pressable
          onPress={() => canDecrement && !disabled && onValueChange(value - step)}
          onPressIn={() =>  { decS.value = withSpring(0.88, SPRING); }}
          onPressOut={() => { decS.value = withSpring(1.00, SPRING); }}
          style={[btnBase, {
            borderColor: canDecrement && !disabled ? primaryColor : borderColor,
            opacity: canDecrement && !disabled ? 1 : 0.4,
          }]}
        >
          <Text style={{ fontSize: 18, color: primaryColor, fontWeight: '600' }}>−</Text>
        </Pressable>
      </Animated.View>

      <Text style={{ fontSize: 18, fontWeight: '700', color: textColor, minWidth: 48, textAlign: 'center' }}>
        {value}{suffix || ''}
      </Text>

      <Animated.View style={incAnim}>
        <Pressable
          onPress={() => canIncrement && !disabled && onValueChange(value + step)}
          onPressIn={() =>  { incS.value = withSpring(0.88, SPRING); }}
          onPressOut={() => { incS.value = withSpring(1.00, SPRING); }}
          style={[btnBase, {
            borderColor: canIncrement && !disabled ? primaryColor : borderColor,
            opacity: canIncrement && !disabled ? 1 : 0.4,
          }]}
        >
          <Text style={{ fontSize: 18, color: primaryColor, fontWeight: '600' }}>+</Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

// ── Animated geofence row ──────────────────────────────────────────────────────
function AnimatedGeofenceItem({
  geo, index, isFirst, onDelete, styles, getDirectionLabel, theme,
}: {
  geo: any; index: number; isFirst: boolean;
  onDelete: (zoneNumber: number, name: string) => void;
  styles: any; getDirectionLabel: (d: string) => string; theme: any;
}) {
  const op  = useSharedValue(0);
  const tx  = useSharedValue(-18);
  const delS = useSharedValue(1);

  useEffect(() => {
    op.value = withDelay(index * 65, withTiming(1, EASE));
    tx.value = withDelay(index * 65, withTiming(0, EASE));
  }, []);

  const anim    = useAnimatedStyle(() => ({ opacity: op.value, transform: [{ translateX: tx.value }] }));
  const delAnim = useAnimatedStyle(() => ({ transform: [{ scale: delS.value }] }));

  return (
    <>
      {!isFirst && <View style={styles.divider} />}
      <Animated.View style={[styles.geofenceItem, anim]}>
        <View style={styles.geofenceInfo}>
          <Text style={styles.geofenceName}>{geo.name}</Text>
          <Text style={styles.geofenceDetails}>
            Radio: {geo.radius_meters}m · {getDirectionLabel(geo.direction)}
          </Text>
        </View>
        <View style={[styles.geofenceBadge, {
          backgroundColor: geo.synced_to_device ? 'rgba(72, 187, 120, 0.15)' : 'rgba(214, 158, 46, 0.15)',
        }]}>
          <Text style={[styles.geofenceBadgeText, {
            color: geo.synced_to_device ? '#48BB78' : '#D69E2E',
          }]}>
            {geo.synced_to_device ? 'Sync' : 'Pendiente'}
          </Text>
        </View>
        <Animated.View style={delAnim}>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onDelete(geo.zone_number, geo.name)}
            onPressIn={() =>  { delS.value = withSpring(0.85, SPRING); }}
            onPressOut={() => { delS.value = withSpring(1.00, SPRING); }}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </>
  );
}

export default function DispositivoScreen() {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { watchImei: deviceId, watches, selectDevice } = useWatchConfig();
  const { statuses } = useDeviceStatus();

  const { geofences, loading: geofencesLoading, deleteGeofence, syncGeofences } = useGeofences(deviceId || null);
  const { config: batteryConfig, loading: batteryLoading, saving: batterySaving, updateThreshold } = useBatteryConfig(deviceId || null);
  const [findingDevice, setFindingDevice] = useState(false);

  // ── Entrance shared values ─────────────────────────────────────────────────
  const headerOp  = useSharedValue(0); const headerY  = useSharedValue(-16);
  const secHOp    = useSharedValue(0); const secHY    = useSharedValue(18);
  const devSelOp  = useSharedValue(0); const devSelY  = useSharedValue(14);
  const sec1Op    = useSharedValue(0); const sec1Y    = useSharedValue(20);
  const sec2Op    = useSharedValue(0); const sec2Y    = useSharedValue(20);
  const sec3Op    = useSharedValue(0); const sec3Y    = useSharedValue(20);

  useEffect(() => {
    headerOp.value = withDelay(0,   withTiming(1, EASE));
    headerY.value  = withDelay(0,   withTiming(0, EASE));
    secHOp.value   = withDelay(80,  withTiming(1, EASE));
    secHY.value    = withDelay(80,  withTiming(0, EASE));
    devSelOp.value = withDelay(150, withTiming(1, EASE));
    devSelY.value  = withDelay(150, withTiming(0, EASE));
    sec1Op.value   = withDelay(230, withTiming(1, EASE));
    sec1Y.value    = withDelay(230, withTiming(0, EASE));
    sec2Op.value   = withDelay(320, withTiming(1, EASE));
    sec2Y.value    = withDelay(320, withTiming(0, EASE));
    sec3Op.value   = withDelay(410, withTiming(1, EASE));
    sec3Y.value    = withDelay(410, withTiming(0, EASE));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value, transform: [{ translateY: headerY.value }] }));
  const secHStyle   = useAnimatedStyle(() => ({ opacity: secHOp.value,   transform: [{ translateY: secHY.value }] }));
  const devSelStyle = useAnimatedStyle(() => ({ opacity: devSelOp.value, transform: [{ translateY: devSelY.value }] }));
  const sec1Style   = useAnimatedStyle(() => ({ opacity: sec1Op.value,   transform: [{ translateY: sec1Y.value }] }));
  const sec2Style   = useAnimatedStyle(() => ({ opacity: sec2Op.value,   transform: [{ translateY: sec2Y.value }] }));
  const sec3Style   = useAnimatedStyle(() => ({ opacity: sec3Op.value,   transform: [{ translateY: sec3Y.value }] }));

  const handleDeleteGeofence = (zoneNumber: number, name: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`¿Estás seguro de eliminar "${name}"?`)) {
        deleteGeofence(zoneNumber);
      }
      return;
    }
    Alert.alert(
      'Eliminar geocerca',
      `¿Estás seguro de eliminar "${name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => deleteGeofence(zoneNumber) },
      ]
    );
  };

  const handleSyncGeofences = async () => {
    const success = await syncGeofences();
    const msg = success
      ? 'Geocercas sincronizadas con el dispositivo'
      : 'Las geocercas se guardaron pero el dispositivo no respondió. Se sincronizarán cuando esté en línea.';
    if (Platform.OS === 'web') {
      window.alert(msg);
      return;
    }
    Alert.alert(success ? 'Sincronizado' : 'Pendiente', msg);
  };

  const handleFindDevice = async () => {
    if (!deviceId) return;
    setFindingDevice(true);
    try {
      await DeviceService.findDevice(deviceId);
      Alert.alert('Buscar dispositivo', 'Se envió la señal de localización al dispositivo');
    } catch {
      Alert.alert('Error', 'No se pudo enviar la señal');
    } finally {
      setFindingDevice(false);
    }
  };

  const getDirectionLabel = (direction: string) => {
    switch (direction?.toLowerCase()) {
      case 'in':
      case 'enter': return 'Entrada';
      case 'out':
      case 'leave': return 'Salida';
      case 'both': return 'Ambos';
      default: return direction;
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1, backgroundColor: theme.colors.background,
      borderLeftWidth: 4, borderLeftColor: theme.colors.secondary,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingBottom: Platform.OS === 'ios' ? insets.bottom + 80 : 80,
    },
    section: { marginBottom: 24 },
    sectionTitle: {
      fontSize: 15, fontWeight: '700', color: theme.colors.text,
      marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5,
    },
    card: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12, padding: 16,
      borderWidth: 1, borderColor: theme.colors.border,
      borderTopWidth: 3, borderTopColor: theme.colors.secondary,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
    rowLabel: { fontSize: 14, color: theme.colors.text, flex: 1 },
    rowSublabel: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    divider: { height: 1, backgroundColor: theme.colors.border, marginVertical: 8 },
    stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    stepperLabel: { flex: 1 },
    geofenceItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
    geofenceInfo: { flex: 1 },
    geofenceName: { fontSize: 14, fontWeight: '600', color: theme.colors.text },
    geofenceDetails: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 2 },
    geofenceBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginRight: 10 },
    geofenceBadgeText: { fontSize: 10, fontWeight: '600' },
    deleteButton: { padding: 8 },
    deleteButtonText: { fontSize: 18, color: theme.colors.error },
    emptyText: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: 16 },
    actionsRow: { flexDirection: 'row', gap: 12, marginTop: 8 },
    savingOverlay: { position: 'absolute', right: 16, top: 16 },
  }), [theme, insets.bottom]);

  if (!deviceId) {
    return (
      <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
        <Animated.View style={headerStyle}><Header /></Animated.View>
        <Animated.View style={[{ paddingHorizontal: 16, paddingTop: 12 }, secHStyle]}>
          <SectionHeader title="Dispositivo" icon="gearshape.fill" iconColor={theme.colors.primary} />
        </Animated.View>
        <Animated.View style={devSelStyle}>
          <DeviceSelector
            activeDeviceId={deviceId}
            devices={watches}
            statuses={statuses}
            onSelectDevice={selectDevice}
            onLinkDevice={() => router.push('/eview-setup')}
          />
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>

      {/* Header — slides down */}
      <Animated.View style={headerStyle}>
        <Header />
      </Animated.View>

      {/* Section header */}
      <Animated.View style={[{ paddingHorizontal: 16, paddingTop: 12 }, secHStyle]}>
        <SectionHeader title="Dispositivo" icon="gearshape.fill" iconColor={theme.colors.primary} />
      </Animated.View>

      {/* Device selector */}
      <Animated.View style={devSelStyle}>
        <DeviceSelector
          activeDeviceId={deviceId}
          devices={watches}
          statuses={statuses}
          onSelectDevice={selectDevice}
          onLinkDevice={() => router.push('/eview-setup')}
        />
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Geocercas section */}
        <Animated.View style={[styles.section, sec1Style]}>
          <Text style={styles.sectionTitle}>Geocercas</Text>
          <View style={styles.card}>
            {geofencesLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : geofences.length > 0 ? (
              <>
                {geofences.map((geo, index) => (
                  <AnimatedGeofenceItem
                    key={geo.zone_number}
                    geo={geo}
                    index={index}
                    isFirst={index === 0}
                    onDelete={handleDeleteGeofence}
                    styles={styles}
                    getDirectionLabel={getDirectionLabel}
                    theme={theme}
                  />
                ))}
                <View style={styles.divider} />
                <View style={styles.actionsRow}>
                  <Button title="Sincronizar" onPress={handleSyncGeofences} variant="secondary" size="small" />
                </View>
              </>
            ) : (
              <Text style={styles.emptyText}>
                No hay geocercas configuradas. Crea una desde la pantalla de ubicación.
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Battery alert section */}
        <Animated.View style={[styles.section, sec2Style]}>
          <Text style={styles.sectionTitle}>Alerta de batería</Text>
          <View style={styles.card}>
            {batteryLoading ? (
              <ActivityIndicator size="small" color={theme.colors.primary} />
            ) : (
              <>
                {batterySaving && (
                  <View style={styles.savingOverlay}>
                    <ActivityIndicator size="small" color={theme.colors.primary} />
                  </View>
                )}
                <View style={styles.stepperRow}>
                  <View style={styles.stepperLabel}>
                    <Text style={styles.rowLabel}>Umbral de alerta</Text>
                    <Text style={styles.rowSublabel}>Alerta cuando la batería baje de este nivel</Text>
                  </View>
                  <ValueStepper
                    value={batteryConfig?.threshold ?? 20}
                    min={5}
                    max={50}
                    step={5}
                    suffix="%"
                    onValueChange={updateThreshold}
                    disabled={batterySaving}
                    primaryColor={theme.colors.primary}
                    borderColor={theme.colors.border}
                    textColor={theme.colors.text}
                  />
                </View>
              </>
            )}
          </View>
        </Animated.View>

        {/* Actions section */}
        <Animated.View style={[styles.section, sec3Style]}>
          <Text style={styles.sectionTitle}>Acciones</Text>
          <View style={styles.card}>
            <View style={styles.actionsRow}>
              <Button
                title={findingDevice ? 'Buscando...' : 'Buscar dispositivo'}
                onPress={handleFindDevice}
                variant="primary"
                size="small"
                disabled={findingDevice}
              />
            </View>
            <Text style={[styles.rowSublabel, { marginTop: 8 }]}>
              El dispositivo emitirá un sonido para localizarlo
            </Text>
          </View>
        </Animated.View>

      </ScrollView>
    </SafeAreaView>
  );
}
