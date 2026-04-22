import { CommonColors, CommonStyles } from '@/components/CommonStyles';
import Header from '@/components/header';
import {
  Card,
  LoadingState,
  SectionHeader,
  StatusBadge
} from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useGeofences } from '@/hooks/useDeviceConfig';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import { DeviceLocation, useMaps } from '@/hooks/useMaps';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
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
    mapProvider,
    initialRegion,
    currentRegion,
    isLoading,
    deviceLocations,
    hasAnyDevice,
  } = useMaps();
  const { watchImei: deviceId } = useWatchConfig();
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const { dimensions } = useScreenData();
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

  const hasConfiguredDevice = !!deviceId || hasAnyDevice;

  useEffect(() => {
    if (currentRegion) setMapRegion(currentRegion);
  }, [currentRegion]);

  // Load MapLibre GL JS from CDN once
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

  // Initialize the map once MapLibre is ready
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

  // Fly to new center when device location updates
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const center = mapRegion || initialRegion;
    map.setCenter([center.longitude, center.latitude]);
  }, [mapRegion]);

  // Rebuild markers whenever device list or alert changes
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

  const headerOp = useSharedValue(0); const headerY = useSharedValue(-16);
  const secHOp   = useSharedValue(0); const secHY   = useSharedValue(18);
  const mapOp    = useSharedValue(0); const mapS    = useSharedValue(0.96);
  const listOp   = useSharedValue(0); const listY   = useSharedValue(16);
  const btnOp    = useSharedValue(0); const btnS    = useSharedValue(0.94);

  useEffect(() => {
    headerOp.value = withDelay(0,   withTiming(1, EASE));
    headerY.value  = withDelay(0,   withTiming(0, EASE));
    secHOp.value   = withDelay(80,  withTiming(1, EASE));
    secHY.value    = withDelay(80,  withTiming(0, EASE));
    mapOp.value    = withDelay(180, withTiming(1, EASE));
    mapS.value     = withDelay(180, withSpring(1, SPRING));
    listOp.value   = withDelay(320, withTiming(1, EASE));
    listY.value    = withDelay(320, withTiming(0, EASE));
    btnOp.value    = withDelay(420, withTiming(1, EASE));
    btnS.value     = withDelay(420, withSpring(1, SPRING));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value, transform: [{ translateY: headerY.value }] }));
  const secHStyle   = useAnimatedStyle(() => ({ opacity: secHOp.value,   transform: [{ translateY: secHY.value }] }));
  const mapStyle    = useAnimatedStyle(() => ({ opacity: mapOp.value,    transform: [{ scale: mapS.value }] }));
  const listStyle   = useAnimatedStyle(() => ({ opacity: listOp.value,   transform: [{ translateY: listY.value }] }));
  const btnStyle    = useAnimatedStyle(() => ({ opacity: btnOp.value,    transform: [{ scale: btnS.value }] }));
  const btnPs       = useSharedValue(1);
  const btnPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnPs.value }] }));

  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, width: '100%', borderLeftWidth: 4, borderLeftColor: theme.colors.secondary },
    mapContainer: {
      height: 500,
      marginHorizontal: 16,
      marginTop: 12,
      borderRadius: 12,
      overflow: 'hidden',
      position: 'relative',
      backgroundColor: CommonColors.mapContainerBg,
    },
    deviceCard: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
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
      marginHorizontal: 20, marginTop: 12,
      backgroundColor: theme.colors.primary,
      borderRadius: 10, paddingVertical: 14, alignItems: 'center',
    },
  }), [theme]);


  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <Animated.View style={headerStyle}>
        <Header />
      </Animated.View>

      <ScrollView
        style={[CommonStyles.tabScrollView, { height: dimensions.height - 200 }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={CommonStyles.tabScrollViewContentAndroid}
      >
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
          <Card variant="filled" padding="medium" style={{ marginHorizontal: 20, marginBottom: 16 }}>
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
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 16,
                alignItems: 'center',
              }}
            >
              <ThemedText style={{ color: theme.colors.white, fontWeight: '600' }}>
                Configurar Botón SOS
              </ThemedText>
            </Pressable>
          </Card>
        )}

        {hasConfiguredDevice && (
          <>
            <Animated.View style={[styles.mapContainer, mapStyle]}>
              {/* @ts-ignore */}
              <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
            </Animated.View>

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

            {deviceId && geofences.length < 4 && (
              <Animated.View style={[btnStyle, btnPressStyle]}>
                <Pressable
                  style={styles.geofenceBtn}
                  onPress={() => router.push('/geofence-editor')}
                  onPressIn={() =>  { btnPs.value = withSpring(0.96, SPRING); }}
                  onPressOut={() => { btnPs.value = withSpring(1.00, SPRING); }}
                >
                  <ThemedText style={{ color: '#FFF', fontWeight: '700', fontSize: 15 }}>
                    + Crear Geocerca
                  </ThemedText>
                </Pressable>
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
