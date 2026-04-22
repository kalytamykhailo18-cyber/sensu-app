import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useGeofences } from '@/hooks/useDeviceConfig';
import { useAppTheme } from '@/hooks/useAppTheme';
import { useMaps } from '@/hooks/useMaps';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Circle, MapPressEvent, Marker } from 'react-native-maps';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { GeofenceDirection } from '@/types/device';

const SPRING = { damping: 18, stiffness: 200 };
const EASE   = { duration: 380 };

const DIRECTION_OPTIONS: { key: GeofenceDirection; label: string }[] = [
  { key: 'out', label: 'Salida' },
  { key: 'in', label: 'Entrada' },
  { key: 'both', label: 'Ambos' },
];

const DEFAULT_RADIUS = 200;

// ── Animated direction chip ────────────────────────────────────────────────────
function DirectionChip({
  opt, active, onPress, index, styles,
}: {
  opt: { key: GeofenceDirection; label: string }; active: boolean;
  onPress: () => void; index: number; styles: any;
}) {
  const sc  = useSharedValue(1);
  const op  = useSharedValue(0);
  const ty  = useSharedValue(10);

  useEffect(() => {
    op.value = withDelay(index * 60, withTiming(1, EASE));
    ty.value = withDelay(index * 60, withTiming(0, EASE));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }, { scale: sc.value }],
  }));

  return (
    <Animated.View style={[{ flex: 1 }, anim]}>
      <Pressable
        onPress={onPress}
        onPressIn={() =>  { sc.value = withSpring(0.92, SPRING); }}
        onPressOut={() => { sc.value = withSpring(1.00, SPRING); }}
        style={[
          styles.directionChip,
          active ? styles.directionChipActive : styles.directionChipInactive,
        ]}
      >
        <Text style={[styles.directionChipText, active ? styles.directionChipTextActive : styles.directionChipTextInactive]}>
          {opt.label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function GeofenceEditorScreen() {
  const theme = useAppTheme();
  const { watchImei: deviceId } = useWatchConfig();
  const { initialRegion, currentRegion, primaryDevice, isLoading } = useMaps();
  const params = useLocalSearchParams<{ zoneNumber?: string }>();
  const editingZone = params.zoneNumber ? parseInt(params.zoneNumber, 10) : null;

  const { geofences, createGeofence, updateGeofence } = useGeofences(deviceId || null);
  const mapRef = useRef<MapView>(null);

  const existingGeo = editingZone != null ? geofences.find(g => g.zone_number === editingZone) : null;

  const [name, setName] = useState(existingGeo?.name || '');
  const [center, setCenter] = useState<{ latitude: number; longitude: number } | null>(
    existingGeo
      ? { latitude: existingGeo.center_lat, longitude: existingGeo.center_lng }
      : primaryDevice
        ? { latitude: primaryDevice.latitude, longitude: primaryDevice.longitude }
        : null
  );
  const [radius, setRadius] = useState(String(existingGeo?.radius_meters ?? DEFAULT_RADIUS));
  const [direction, setDirection] = useState<GeofenceDirection>(existingGeo?.direction || 'out');
  const [saving, setSaving] = useState(false);
  const [hasCenteredOnDevice, setHasCenteredOnDevice] = useState(false);

  const radiusValue = Math.max(50, Math.min(65535, parseInt(radius, 10) || DEFAULT_RADIUS));

  useEffect(() => {
    if (hasCenteredOnDevice || editingZone != null) return;
    if (primaryDevice && mapRef.current) {
      setHasCenteredOnDevice(true);
      mapRef.current.animateToRegion({
        latitude: primaryDevice.latitude,
        longitude: primaryDevice.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 600);
    }
  }, [primaryDevice, hasCenteredOnDevice, editingZone]);

  // ── Entrance shared values ─────────────────────────────────────────────────
  const headerOp  = useSharedValue(0); const headerY  = useSharedValue(-14);
  const bannerOp  = useSharedValue(0); const bannerY  = useSharedValue(10);
  const mapOp     = useSharedValue(0); const mapS     = useSharedValue(0.97);
  const f1Op      = useSharedValue(0); const f1Y      = useSharedValue(14);
  const f2Op      = useSharedValue(0); const f2Y      = useSharedValue(14);
  const f3Op      = useSharedValue(0); const f3Y      = useSharedValue(14);
  const saveBtnOp = useSharedValue(0); const saveBtnS = useSharedValue(0.94);

  useEffect(() => {
    headerOp.value  = withDelay(0,   withTiming(1, EASE));
    headerY.value   = withDelay(0,   withTiming(0, EASE));
    bannerOp.value  = withDelay(80,  withTiming(1, EASE));
    bannerY.value   = withDelay(80,  withTiming(0, EASE));
    mapOp.value     = withDelay(150, withTiming(1, EASE));
    mapS.value      = withDelay(150, withSpring(1, SPRING));
    f1Op.value      = withDelay(260, withTiming(1, EASE));
    f1Y.value       = withDelay(260, withTiming(0, EASE));
    f2Op.value      = withDelay(320, withTiming(1, EASE));
    f2Y.value       = withDelay(320, withTiming(0, EASE));
    f3Op.value      = withDelay(380, withTiming(1, EASE));
    f3Y.value       = withDelay(380, withTiming(0, EASE));
    saveBtnOp.value = withDelay(440, withTiming(1, EASE));
    saveBtnS.value  = withDelay(440, withSpring(1, SPRING));
  }, []);

  const headerStyle  = useAnimatedStyle(() => ({ opacity: headerOp.value,  transform: [{ translateY: headerY.value }] }));
  const bannerStyle  = useAnimatedStyle(() => ({ opacity: bannerOp.value,  transform: [{ translateY: bannerY.value }] }));
  const mapStyle     = useAnimatedStyle(() => ({ opacity: mapOp.value,     transform: [{ scale: mapS.value }] }));
  const f1Style      = useAnimatedStyle(() => ({ opacity: f1Op.value,      transform: [{ translateY: f1Y.value }] }));
  const f2Style      = useAnimatedStyle(() => ({ opacity: f2Op.value,      transform: [{ translateY: f2Y.value }] }));
  const f3Style      = useAnimatedStyle(() => ({ opacity: f3Op.value,      transform: [{ translateY: f3Y.value }] }));
  const saveBtnStyle = useAnimatedStyle(() => ({ opacity: saveBtnOp.value, transform: [{ scale: saveBtnS.value }] }));

  // Input focus borders
  const nameF   = useSharedValue(0);
  const radiusF = useSharedValue(0);
  const primary = theme.colors.primary as string;
  const border  = theme.colors.border  as string;
  const nameBrd  = useAnimatedStyle(() => ({ borderColor: interpolateColor(nameF.value,   [0, 1], [border, primary]) }));
  const radiusBrd = useAnimatedStyle(() => ({ borderColor: interpolateColor(radiusF.value, [0, 1], [border, primary]) }));

  // Save button press
  const savePressS = useSharedValue(1);
  const savePressStyle = useAnimatedStyle(() => ({ transform: [{ scale: savePressS.value }] }));

  // Cancel button press
  const cancelS = useSharedValue(1);
  const cancelStyle = useAnimatedStyle(() => ({ transform: [{ scale: cancelS.value }] }));

  const handleCenterOnDevice = useCallback(() => {
    if (!primaryDevice || !mapRef.current) return;
    mapRef.current.animateToRegion({
      latitude: primaryDevice.latitude,
      longitude: primaryDevice.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 600);
  }, [primaryDevice]);

  const handleSetCenterToDevice = useCallback(() => {
    if (!primaryDevice) return;
    setCenter({ latitude: primaryDevice.latitude, longitude: primaryDevice.longitude });
    handleCenterOnDevice();
  }, [primaryDevice, handleCenterOnDevice]);

  const handleMapPress = useCallback((event: MapPressEvent) => {
    setCenter(event.nativeEvent.coordinate);
  }, []);

  const handleSave = async () => {
    if (!deviceId) return;
    if (!name.trim()) { Alert.alert('Error', 'Ingresa un nombre para la geocerca'); return; }
    if (!center) { Alert.alert('Error', 'Toca el mapa para seleccionar el centro de la geocerca'); return; }

    setSaving(true);
    try {
      const geoRequest = {
        name: name.trim(),
        center_lat: center.latitude,
        center_lng: center.longitude,
        radius_meters: radiusValue,
        direction,
        enabled: true,
        detect_interval_seconds: 180,
      };
      const result = editingZone != null
        ? await updateGeofence(editingZone, geoRequest)
        : await createGeofence(geoRequest);

      if (result) {
        Alert.alert(
          editingZone != null ? 'Geocerca actualizada' : 'Geocerca creada',
          `"${name.trim()}" se está sincronizando con tu dispositivo.`,
          [{ text: 'OK', onPress: () => router.back() }],
        );
      } else {
        Alert.alert('Error', 'No se pudo guardar la geocerca. Verifica que no excedas el límite de 4 zonas.');
      }
    } catch {
      Alert.alert('Error', 'Ocurrió un error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: 17, fontWeight: '700', color: theme.colors.text },
    headerButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    headerButtonText: { fontSize: 15, fontWeight: '600' },
    mapContainer: { flex: 1, minHeight: 300 },
    map: { flex: 1 },
    formContainer: {
      paddingHorizontal: 16, paddingVertical: 16, gap: 16,
      borderTopWidth: 1, borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    fieldRow: { gap: 6 },
    fieldLabel: {
      fontSize: 13, fontWeight: '600', color: theme.colors.textSecondary,
      textTransform: 'uppercase', letterSpacing: 0.5,
    },
    textInput: {
      borderWidth: 1, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 15, color: theme.colors.text,
      backgroundColor: theme.colors.cardBackground,
    },
    radiusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    radiusInput: {
      flex: 1, borderWidth: 1, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 10,
      fontSize: 15, color: theme.colors.text,
      backgroundColor: theme.colors.cardBackground,
    },
    radiusSuffix: { fontSize: 14, color: theme.colors.textSecondary },
    directionRow: { flexDirection: 'row', gap: 8 },
    directionChip: {
      flex: 1, paddingVertical: 10, borderRadius: 8,
      borderWidth: 1, alignItems: 'center',
    },
    directionChipActive: { backgroundColor: theme.colors.text, borderColor: theme.colors.text },
    directionChipInactive: { backgroundColor: 'transparent', borderColor: theme.colors.border },
    directionChipText: { fontSize: 13, fontWeight: '600' },
    directionChipTextActive: { color: theme.colors.background },
    directionChipTextInactive: { color: theme.colors.textSecondary },
    statusBanner: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, paddingVertical: 10, gap: 10,
      borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    statusBannerOnline: { backgroundColor: 'rgba(68, 170, 68, 0.08)' },
    statusBannerOffline: { backgroundColor: theme.colors.cardBackground },
    statusDot: { width: 8, height: 8, borderRadius: 4 },
    statusDotOnline: { backgroundColor: theme.colors.success },
    statusDotOffline: { backgroundColor: theme.colors.lightGray },
    statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    statusContent: { flex: 1, gap: 2 },
    statusText: { fontSize: 13, color: theme.colors.text, fontWeight: '500' },
    statusTimestamp: { fontSize: 11, color: theme.colors.textSecondary },
    mapButtonsContainer: { position: 'absolute', right: 12, top: 12, gap: 8 },
    mapButton: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: theme.colors.cardBackground,
      justifyContent: 'center', alignItems: 'center',
      shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 }, elevation: 3,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    hint: {
      fontSize: 12, color: theme.colors.textSecondary,
      textAlign: 'center', paddingVertical: 8,
      backgroundColor: theme.colors.cardBackground,
      borderTopWidth: 1, borderTopColor: theme.colors.border,
    },
    saveButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 10, paddingVertical: 14, alignItems: 'center',
      opacity: saving ? 0.6 : 1,
    },
    saveButtonText: { fontSize: 16, fontWeight: '700', color: '#FFF' },
  }), [theme, saving]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>

      {/* Header — slides down */}
      <Animated.View style={[styles.header, headerStyle]}>
        <Animated.View style={cancelStyle}>
          <Pressable
            style={styles.headerButton}
            onPress={() => router.back()}
            onPressIn={() =>  { cancelS.value = withSpring(0.92, SPRING); }}
            onPressOut={() => { cancelS.value = withSpring(1.00, SPRING); }}
          >
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>Cancelar</Text>
          </Pressable>
        </Animated.View>
        <Text style={styles.headerTitle}>
          {editingZone != null ? 'Editar Geocerca' : 'Nueva Geocerca'}
        </Text>
        <View style={styles.headerButton}>
          <Text style={[styles.headerButtonText, { color: 'transparent' }]}>Cancelar</Text>
        </View>
      </Animated.View>

      {/* Status banner — slides up */}
      <Animated.View style={[
        styles.statusBanner,
        primaryDevice ? styles.statusBannerOnline : styles.statusBannerOffline,
        bannerStyle,
      ]}>
        <View style={[styles.statusDot, primaryDevice ? styles.statusDotOnline : styles.statusDotOffline]} />
        {isLoading ? (
          <View style={styles.statusRow}>
            <ActivityIndicator size="small" color={theme.colors.textSecondary} />
            <Text style={styles.statusText}>Obteniendo ubicación del dispositivo...</Text>
          </View>
        ) : primaryDevice ? (
          <View style={styles.statusContent}>
            <Text style={styles.statusText}>Ubicación disponible — {primaryDevice.name}</Text>
            {primaryDevice.timestamp && (
              <Text style={styles.statusTimestamp}>
                Última actualización: {new Date(primaryDevice.timestamp).toLocaleString('es-MX', {
                  hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short',
                })}
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.statusText}>
            Sin ubicación del dispositivo — Toca el mapa para colocar la geocerca manualmente
          </Text>
        )}
      </Animated.View>

      {/* Map — scales in */}
      <Animated.View style={[styles.mapContainer, mapStyle]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={
            center ? { ...center, latitudeDelta: 0.01, longitudeDelta: 0.01 }
            : currentRegion || initialRegion
          }
          onPress={handleMapPress}
          showsUserLocation
        >
          {primaryDevice && (
            <Marker
              coordinate={{ latitude: primaryDevice.latitude, longitude: primaryDevice.longitude }}
              title={primaryDevice.name}
              description={`${primaryDevice.online ? 'En línea' : 'Desconectado'} • ${primaryDevice.battery ?? '?'}%`}
              pinColor={primaryDevice.online ? '#10B981' : '#9CA3AF'}
            />
          )}
          {center && (
            <>
              <Marker coordinate={center} draggable onDragEnd={(e) => setCenter(e.nativeEvent.coordinate)} pinColor="#3B82F6" />
              <Circle
                center={center}
                radius={radiusValue}
                strokeColor="rgba(59, 130, 246, 0.8)"
                fillColor="rgba(59, 130, 246, 0.15)"
                strokeWidth={2}
              />
            </>
          )}
        </MapView>

        <View style={styles.mapButtonsContainer}>
          {primaryDevice && (
            <>
              <Pressable style={styles.mapButton} onPress={handleCenterOnDevice}>
                <Ionicons name="locate" size={22} color={theme.colors.primary} />
              </Pressable>
              <Pressable style={styles.mapButton} onPress={handleSetCenterToDevice}>
                <Ionicons name="pin" size={22} color={theme.colors.secondary} />
              </Pressable>
            </>
          )}
        </View>

        {!center && !primaryDevice && (
          <Text style={styles.hint}>Toca el mapa para colocar el centro de la geocerca</Text>
        )}
      </Animated.View>

      {/* Form — fields stagger in */}
      <View style={styles.formContainer}>
        {/* Name field */}
        <Animated.View style={[styles.fieldRow, f1Style]}>
          <Text style={styles.fieldLabel}>Nombre</Text>
          <Animated.View style={[{ borderRadius: 8 }, nameBrd]}>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Ej: Casa, Trabajo..."
              placeholderTextColor={theme.colors.textSecondary}
              maxLength={100}
              onFocus={() =>  { nameF.value = withTiming(1, { duration: 180 }); }}
              onBlur={() =>   { nameF.value = withTiming(0, { duration: 180 }); }}
            />
          </Animated.View>
        </Animated.View>

        {/* Radius field */}
        <Animated.View style={[styles.fieldRow, f2Style]}>
          <Text style={styles.fieldLabel}>Radio (metros)</Text>
          <View style={styles.radiusRow}>
            <Animated.View style={[{ flex: 1, borderRadius: 8 }, radiusBrd]}>
              <TextInput
                style={styles.radiusInput}
                value={radius}
                onChangeText={setRadius}
                keyboardType="number-pad"
                placeholder="200"
                placeholderTextColor={theme.colors.textSecondary}
                onFocus={() =>  { radiusF.value = withTiming(1, { duration: 180 }); }}
                onBlur={() =>   { radiusF.value = withTiming(0, { duration: 180 }); }}
              />
            </Animated.View>
            <Text style={styles.radiusSuffix}>m</Text>
          </View>
        </Animated.View>

        {/* Direction chips */}
        <Animated.View style={[styles.fieldRow, f3Style]}>
          <Text style={styles.fieldLabel}>Alertar al</Text>
          <View style={styles.directionRow}>
            {DIRECTION_OPTIONS.map((opt, i) => (
              <DirectionChip
                key={opt.key}
                opt={opt}
                active={direction === opt.key}
                onPress={() => setDirection(opt.key)}
                index={i}
                styles={styles}
              />
            ))}
          </View>
        </Animated.View>

        {/* Save button */}
        <Animated.View style={[saveBtnStyle, savePressStyle]}>
          <Pressable
            style={styles.saveButton}
            onPress={handleSave}
            disabled={saving}
            onPressIn={() =>  { savePressS.value = withSpring(0.96, SPRING); }}
            onPressOut={() => { savePressS.value = withSpring(1.00, SPRING); }}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Guardando...' : editingZone != null ? 'Actualizar' : 'Crear Geocerca'}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
