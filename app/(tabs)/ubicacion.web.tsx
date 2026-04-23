import { CommonColors, CommonStyles } from '@/components/CommonStyles';
import Header from '@/components/header';
import {
  Card,
  SectionHeader,
  StatusBadge
} from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useGeofences } from '@/hooks/useDeviceConfig';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DeviceLocation, useMaps } from '@/hooks/useMaps';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const SPRING = { damping: 18, stiffness: 200 };
const EASE   = { duration: 380 };

const STREET_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const SAT_STYLE_OBJ = {
  version: 8 as const,
  sources: { sat: { type: 'raster' as const, tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } },
  layers: [{ id: 'sat', type: 'raster' as const, source: 'sat' }],
};

function AnimatedDeviceRow({
  device, index, isLast, styles,
}: {
  device: DeviceLocation; index: number; isLast: boolean;
  styles: { deviceCard: object; deviceCardLast: object; deviceIcon: object; deviceInfo: object; deviceName: object; deviceDetails: object };
}) {
  const op = useSharedValue(0);
  const tx = useSharedValue(-16);

  useEffect(() => {
    op.value = withDelay(index * 70, withTiming(1, EASE));
    tx.value = withDelay(index * 70, withTiming(0, EASE));
  }, []);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateX: tx.value }],
  }));

  return (
    <Animated.View style={[styles.deviceCard, isLast && styles.deviceCardLast, anim]}>
      <View style={[styles.deviceIcon, { backgroundColor: device.online ? '#D1FAE5' : '#F3F4F6' }]}>
        <ThemedText style={{ fontSize: 20 }}>🆘</ThemedText>
      </View>
      <View style={styles.deviceInfo}>
        <ThemedText style={styles.deviceName}>{device.name}</ThemedText>
        <ThemedText style={styles.deviceDetails}>
          {device.online ? '🟢 En línea' : '🔴 Desconectado'} • 🔋 {device.battery ?? '?'}%
          {device.timestamp && ` • ${new Date(device.timestamp).toLocaleTimeString()}`}
        </ThemedText>
      </View>
    </Animated.View>
  );
}

export default function UbicacionScreen() {
  const {
    initialRegion,
    currentRegion,
    deviceLocations,
    hasAnyDevice,
  } = useMaps();
  const { watchImei: deviceId } = useWatchConfig();
  const theme = useAppTheme();
  const { geofences, refresh: refreshGeofences } = useGeofences(deviceId || null);

  const params = useLocalSearchParams<{ alertLat?: string; alertLng?: string; alertType?: string }>();
  const [alertMarker, setAlertMarker] = useState<{ latitude: number; longitude: number; type: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshGeofences();
      if (params.alertLat && params.alertLng) {
        const lat = parseFloat(params.alertLat);
        const lng = parseFloat(params.alertLng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setAlertMarker({ latitude: lat, longitude: lng, type: params.alertType || 'alert' });
        }
      } else {
        setAlertMarker(null);
      }
    }, [refreshGeofences, params.alertLat, params.alertLng, params.alertType])
  );

  const mapContainerRef = useRef<any>(null);
  const mapInstanceRef  = useRef<any>(null);
  const markersRef      = useRef<any[]>([]);
  const [mapRegion, setMapRegion] = useState(currentRegion);
  const [mapLibreReady, setMapLibreReady] = useState(false);
  const [isSatellite, setIsSatellite] = useState(false);

  const hasConfiguredDevice = !!deviceId || hasAnyDevice;

  useEffect(() => {
    if (currentRegion) setMapRegion(currentRegion);
  }, [currentRegion]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if ((window as any).maplibregl) { setMapLibreReady(true); return; }

    if (!document.getElementById('maplibre-css')) {
      const link = document.createElement('link');
      link.id = 'maplibre-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css';
      document.head.appendChild(link);
    }
    if (!document.getElementById('maplibre-js')) {
      const script = document.createElement('script');
      script.id = 'maplibre-js';
      script.src = 'https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js';
      script.onload = () => setMapLibreReady(true);
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (!mapLibreReady || !mapContainerRef.current || mapInstanceRef.current) return;
    const ml = (window as any).maplibregl;
    const center = mapRegion || initialRegion;

    const map = new ml.Map({
      container: mapContainerRef.current,
      style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
      center: [center.longitude, center.latitude],
      zoom: 14,
      attributionControl: false,
    });
    map.addControl(new ml.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new ml.NavigationControl({ showCompass: false }), 'top-right');
    mapInstanceRef.current = map;

    return () => { map.remove(); mapInstanceRef.current = null; };
  }, [mapLibreReady]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const center = mapRegion || initialRegion;
    map.setCenter([center.longitude, center.latitude]);
  }, [mapRegion]);

  // Swap base map style on satellite toggle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    map.setStyle(isSatellite ? SAT_STYLE_OBJ : STREET_STYLE_URL);
  }, [isSatellite]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    const ml = (window as any).maplibregl;
    if (!map || !ml) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    deviceLocations.forEach(device => {
      const el = document.createElement('div');
      Object.assign(el.style, {
        width: '36px', height: '36px', borderRadius: '50%',
        background: device.online ? '#10B981' : '#9CA3AF',
        border: '3px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', cursor: 'pointer', lineHeight: '1',
      });
      el.textContent = '🆘';

      const popup = new ml.Popup({ offset: 28, closeButton: false }).setHTML(
        `<div style="font-family:sans-serif;font-size:13px;padding:2px 4px">
          <strong>${device.name}</strong><br/>
          ${device.online ? '🟢 En línea' : '🔴 Desconectado'} · 🔋${device.battery ?? '?'}%
          ${device.timestamp ? `<br/><span style="color:#666">${new Date(device.timestamp).toLocaleTimeString()}</span>` : ''}
        </div>`
      );
      const marker = new ml.Marker({ element: el })
        .setLngLat([device.longitude, device.latitude])
        .setPopup(popup)
        .addTo(map);
      markersRef.current.push(marker);
    });

    if (alertMarker) {
      const el = document.createElement('div');
      Object.assign(el.style, {
        width: '36px', height: '36px', borderRadius: '50%',
        background: '#EF4444', border: '3px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', lineHeight: '1',
      });
      el.textContent = '⚠️';
      const marker = new ml.Marker({ element: el })
        .setLngLat([alertMarker.longitude, alertMarker.latitude])
        .addTo(map);
      markersRef.current.push(marker);
      map.flyTo({ center: [alertMarker.longitude, alertMarker.latitude], zoom: 15 });
    }
  }, [deviceLocations, alertMarker, mapLibreReady]);

  // ── Entrance animations ──────────────────────────────────────────────────
  const headerOp = useSharedValue(0); const headerY = useSharedValue(-16);
  const secHOp   = useSharedValue(0); const secHY   = useSharedValue(18);
  const listOp   = useSharedValue(0); const listY   = useSharedValue(16);
  const btnOp    = useSharedValue(0); const btnS    = useSharedValue(0.94);
  const mapOp    = useSharedValue(0); const mapS    = useSharedValue(0.97);

  useEffect(() => {
    headerOp.value = withDelay(0,   withTiming(1, EASE));
    headerY.value  = withDelay(0,   withTiming(0, EASE));
    secHOp.value   = withDelay(80,  withTiming(1, EASE));
    secHY.value    = withDelay(80,  withTiming(0, EASE));
    listOp.value   = withDelay(160, withTiming(1, EASE));
    listY.value    = withDelay(160, withTiming(0, EASE));
    btnOp.value    = withDelay(240, withTiming(1, EASE));
    btnS.value     = withDelay(240, withSpring(1, SPRING));
    mapOp.value    = withDelay(320, withTiming(1, EASE));
    mapS.value     = withDelay(320, withSpring(1, SPRING));

    // On web, snap Y values to avoid interpolation glitch
    if (typeof window !== 'undefined') {
      [headerY, secHY, listY].forEach(v => { v.value = 0; });
    }
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value, transform: [{ translateY: headerY.value }] }));
  const secHStyle   = useAnimatedStyle(() => ({ opacity: secHOp.value,   transform: [{ translateY: secHY.value }] }));
  const listStyle   = useAnimatedStyle(() => ({ opacity: listOp.value,   transform: [{ translateY: listY.value }] }));
  const btnStyle    = useAnimatedStyle(() => ({ opacity: btnOp.value,    transform: [{ scale: btnS.value }] }));
  const mapStyle    = useAnimatedStyle(() => ({ opacity: mapOp.value,    transform: [{ scale: mapS.value }] }));
  const btnPs       = useSharedValue(1);
  const btnPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnPs.value }] }));

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    topContent: { paddingBottom: 4 },
    deviceCard: {
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    deviceCardLast: { borderBottomWidth: 0 },
    deviceIcon: {
      width: 40, height: 40, borderRadius: 20,
      justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    deviceInfo: { flex: 1 },
    deviceName: { fontSize: 15, fontWeight: '600', color: theme.colors.text },
    deviceDetails: { fontSize: 13, color: theme.colors.textSecondary, marginTop: 2 },
    geofenceBtn: {
      marginHorizontal: 20, marginBottom: 8,
      backgroundColor: theme.colors.primary,
      borderRadius: 10, paddingVertical: 13, alignItems: 'center',
    },
    mapWrapper: {
      flex: 1,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: CommonColors.mapContainerBg,
    },
    satToggleRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
      borderWidth: 1, borderColor: theme.colors.border,
    },
    satToggleLabel: {
      flex: 1, fontSize: 14, color: theme.colors.text,
    },
    satPill: {
      paddingHorizontal: 10, paddingVertical: 3,
      borderRadius: 12, backgroundColor: theme.colors.border,
    },
    satPillActive: { backgroundColor: '#10B981' },
    satPillText: { fontSize: 12, fontWeight: '700', color: theme.colors.textSecondary },
    satPillTextActive: { color: '#fff' },
  }), [theme]);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>

      {/* Header */}
      <Animated.View style={headerStyle}>
        <Header />
      </Animated.View>

      {/* ── All text/buttons ABOVE the map ── */}
      <View style={styles.topContent}>

        <Animated.View style={secHStyle}>
          <SectionHeader
            title="Ubicación de Dispositivos"
            icon="location.fill"
            iconColor={CommonColors.locationIcon}
            rightElement={
              hasAnyDevice ? (
                <StatusBadge
                  status={deviceLocations.some(d => d.online) ? 'connected' : 'disconnected'}
                  text={deviceLocations.some(d => d.online) ? "En línea" : "Sin conexión"}
                  size="small"
                />
              ) : undefined
            }
          />
        </Animated.View>

        {!hasConfiguredDevice && (
          <Card variant="filled" padding="medium" style={{ marginHorizontal: 20, marginBottom: 8 }}>
            <ThemedText type="subtitle" style={CommonStyles.subtitle}>
              Sin Dispositivos Configurados
            </ThemedText>
            <ThemedText style={CommonStyles.infoText}>
              Para ver la ubicación, configura un botón de emergencia.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/eview-setup')}
              style={{
                marginTop: 12,
                backgroundColor: theme.colors.primary,
                borderRadius: 8, paddingVertical: 12,
                paddingHorizontal: 16, alignItems: 'center',
              }}
            >
              <ThemedText style={{ color: theme.colors.white, fontWeight: '600' }}>
                Configurar Botón SOS
              </ThemedText>
            </Pressable>
          </Card>
        )}

        {hasAnyDevice && (
          <Animated.View style={listStyle}>
            <Card variant="filled" padding="medium">
              <ThemedText type="subtitle" style={CommonStyles.subtitle}>
                Dispositivos ({deviceLocations.length})
              </ThemedText>
              {deviceLocations.map((device, index) => (
                <AnimatedDeviceRow
                  key={device.id}
                  device={device}
                  index={index}
                  isLast={index === deviceLocations.length - 1}
                  styles={styles}
                />
              ))}
            </Card>
          </Animated.View>
        )}

        {/* Geofence creation is native-only — button intentionally hidden on web */}

        {/* Satellite toggle — above the map */}
        <Animated.View style={[btnStyle, { marginHorizontal: 20, marginBottom: 8 }]}>
          <Pressable style={styles.satToggleRow} onPress={() => setIsSatellite(v => !v)}>
            <Ionicons name="layers-outline" size={18} color="#374151" />
            <ThemedText style={styles.satToggleLabel}>Vista satélite</ThemedText>
            <View style={[styles.satPill, isSatellite && styles.satPillActive]}>
              <ThemedText style={[styles.satPillText, isSatellite && styles.satPillTextActive]}>
                {isSatellite ? 'ON' : 'OFF'}
              </ThemedText>
            </View>
          </Pressable>
        </Animated.View>
      </View>

      {/* ── Map fills remaining screen ── */}
      <Animated.View style={[styles.mapWrapper, mapStyle]}>
        {/* @ts-ignore */}
        <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
      </Animated.View>

    </SafeAreaView>
  );
}
