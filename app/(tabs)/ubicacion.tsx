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
import { useAppTheme } from '@/hooks/useAppTheme';
import { DeviceLocation, useMaps } from '@/hooks/useMaps';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useRef, useCallback, useState, useEffect } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import MapView, { Circle, Marker, Region } from 'react-native-maps';
import { WebView } from 'react-native-webview';
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
const SAT_STYLE = JSON.stringify({
  version: 8,
  sources: { sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } },
  layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
});

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
          mapRef.current?.animateToRegion({
            latitude: lat, longitude: lng,
            latitudeDelta: 0.005, longitudeDelta: 0.005,
          }, 600);
        }
      } else {
        setAlertMarker(null);
      }
    }, [refreshGeofences, params.alertLat, params.alertLng, params.alertType])
  );

  const mapRef = useRef<MapView>(null);
  const [mapRegion, setMapRegion] = useState<Region | undefined>(currentRegion);
  const [isSatellite, setIsSatellite] = useState(false);
  const hasConfiguredDevice = !!deviceId || hasAnyDevice;

  useEffect(() => {
    if (currentRegion) {
      setMapRegion(currentRegion);
      mapRef.current?.animateToRegion(currentRegion, 500);
    }
  }, [currentRegion]);

  // ── Entrance animations ────────────────────────────────────────────────────
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
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOp.value, transform: [{ translateY: headerY.value }] }));
  const secHStyle   = useAnimatedStyle(() => ({ opacity: secHOp.value,   transform: [{ translateY: secHY.value }] }));
  const listStyle   = useAnimatedStyle(() => ({ opacity: listOp.value,   transform: [{ translateY: listY.value }] }));
  const btnStyle    = useAnimatedStyle(() => ({ opacity: btnOp.value,    transform: [{ scale: btnS.value }] }));
  const mapStyle    = useAnimatedStyle(() => ({ opacity: mapOp.value,    transform: [{ scale: mapS.value }] }));

  const btnPs       = useSharedValue(1);
  const btnPressStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnPs.value }] }));

  const handleZoom = useCallback((zoomIn: boolean) => {
    if (!mapRef.current || !mapRegion) return;
    const factor = zoomIn ? 0.5 : 2;
    const newRegion: Region = {
      latitude: mapRegion.latitude,
      longitude: mapRegion.longitude,
      latitudeDelta: Math.min(100, Math.max(0.001, mapRegion.latitudeDelta * factor)),
      longitudeDelta: Math.min(100, Math.max(0.001, mapRegion.longitudeDelta * factor)),
    };
    setMapRegion(newRegion);
    mapRef.current.animateToRegion(newRegion, 300);
  }, [mapRegion]);

  const handleCenterOnDevice = useCallback(() => {
    if (!currentRegion || !mapRef.current) return;
    mapRef.current.animateToRegion(currentRegion, 600);
  }, [currentRegion]);

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      width: '100%',
      borderLeftWidth: 4,
      borderLeftColor: theme.colors.secondary,
    },
    // ── Above-map content ──────────────────────────────────────────────────
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
    // ── Map ────────────────────────────────────────────────────────────────
    mapWrapper: {
      flex: 1,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: CommonColors.mapContainerBg,
    },
    map: { flex: 1 },
    loadingOverlay: {
      position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: CommonColors.mapLoadingOverlay,
      justifyContent: 'center', alignItems: 'center',
    },
    zoomControls: {
      position: 'absolute', right: 12, top: 12,
      backgroundColor: 'white', borderRadius: 8,
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
    },
    zoomButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
    zoomButtonTop: { borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomWidth: 1, borderBottomColor: '#E5E5E5' },
    zoomButtonBottom: { borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
    zoomButtonText: { fontSize: 22, fontWeight: '600', color: '#374151' },
    locateButton: {
      position: 'absolute', right: 12, top: 108,
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: 'white', justifyContent: 'center', alignItems: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 4, elevation: 4,
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

  const getMarkerColor = (device: DeviceLocation) => device.online ? '#10B981' : '#9CA3AF';

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>

      {/* Header */}
      <Animated.View style={headerStyle}>
        <Header />
      </Animated.View>

      {/* ── All text/buttons ABOVE the map ── */}
      <View style={styles.topContent}>

        {/* Section header */}
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

        {/* No device configured */}
        {!hasConfiguredDevice && (
          <Card variant="filled" padding="medium" style={{ marginHorizontal: 20, marginBottom: 8 }}>
            <ThemedText type="subtitle" style={CommonStyles.subtitle}>
              Sin Dispositivos Configurados
            </ThemedText>
            <ThemedText style={CommonStyles.infoText}>
              Para ver la ubicación en tiempo real, configura un botón de emergencia.
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

        {/* Device list */}
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

        {/* Geofence button */}
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
      </View>

      {/* ── Satellite toggle — above the map ── */}
      <Animated.View style={[btnStyle, { marginHorizontal: 20, marginBottom: 8 }]}>
        <Pressable style={styles.satToggleRow} onPress={() => setIsSatellite(v => !v)}>
          <Ionicons name="layers-outline" size={18} color={theme.colors.text} />
          <ThemedText style={styles.satToggleLabel}>Vista satélite</ThemedText>
          <View style={[styles.satPill, isSatellite && styles.satPillActive]}>
            <ThemedText style={[styles.satPillText, isSatellite && styles.satPillTextActive]}>
              {isSatellite ? 'ON' : 'OFF'}
            </ThemedText>
          </View>
        </Pressable>
      </Animated.View>

      {/* ── Map fills remaining screen — gestures are map-only ── */}
      <Animated.View style={[styles.mapWrapper, mapStyle]}>
        {Platform.OS === 'android' ? (
          (() => {
            const center = mapRegion || initialRegion;
            const markersJson = JSON.stringify([
              ...deviceLocations.map(d => ({
                lng: d.longitude, lat: d.latitude,
                color: d.online ? '#10B981' : '#9CA3AF',
                label: `${d.name}<br/>${d.online ? '🟢 En línea' : '🔴 Desconectado'} · 🔋${d.battery ?? '?'}%`,
              })),
              ...(alertMarker ? [{ lng: alertMarker.longitude, lat: alertMarker.latitude, color: '#EF4444', label: '⚠️ Alerta' }] : []),
            ]);
            const styleVal = isSatellite ? SAT_STYLE : `'${STREET_STYLE_URL}'`;
            const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet"/>
<script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
<style>body,html,#map{margin:0;padding:0;width:100%;height:100%}</style></head>
<body><div id="map"></div><script>
var map=new maplibregl.Map({container:'map',style:${styleVal},center:[${center.longitude},${center.latitude}],zoom:14});
map.addControl(new maplibregl.NavigationControl({showCompass:false}),'top-right');
var markers=${markersJson};
markers.forEach(function(m){
  var el=document.createElement('div');
  el.style.cssText='width:36px;height:36px;border-radius:50%;background:'+m.color+';border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;font-size:16px;';
  el.textContent='🆘';
  new maplibregl.Marker({element:el}).setLngLat([m.lng,m.lat]).setPopup(new maplibregl.Popup({offset:28,closeButton:false}).setHTML('<div style="font-size:13px;padding:4px">'+m.label+'</div>')).addTo(map);
});
</script></body></html>`;
            return <WebView key={isSatellite ? 'sat' : 'street'} source={{ html }} style={{ flex: 1 }} />;
          })()
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={mapProvider}
              initialRegion={mapRegion || initialRegion}
              mapType={isSatellite ? 'hybrid' : 'standard'}
              showsUserLocation
              showsMyLocationButton
              loadingEnabled={isLoading}
              onRegionChangeComplete={setMapRegion}
            >
              {deviceLocations.map((device) => (
                <Marker
                  key={device.id}
                  coordinate={{ latitude: device.latitude, longitude: device.longitude }}
                  title={device.name}
                  description={`${device.online ? 'En línea' : 'Desconectado'} • ${device.battery ?? '?'}% batería`}
                  pinColor={getMarkerColor(device)}
                />
              ))}
              {alertMarker && (
                <Marker
                  coordinate={{ latitude: alertMarker.latitude, longitude: alertMarker.longitude }}
                  title={
                    alertMarker.type === 'geofence_exit'   ? 'Salida de geocerca' :
                    alertMarker.type === 'geofence_enter'  ? 'Entrada a geocerca' :
                    alertMarker.type === 'sos'             ? 'Alerta SOS' :
                    alertMarker.type === 'fall_detection'  ? 'Caída detectada' : 'Alerta'
                  }
                  pinColor="#FF0000"
                />
              )}
              {geofences.filter(g => g.enabled).map((geo) => (
                <Circle
                  key={`geo-${geo.zone_number}`}
                  center={{ latitude: geo.center_lat, longitude: geo.center_lng }}
                  radius={geo.radius_meters}
                  strokeColor={geo.synced_to_device ? 'rgba(59,130,246,0.8)' : 'rgba(214,158,46,0.8)'}
                  fillColor={geo.synced_to_device ? 'rgba(59,130,246,0.12)' : 'rgba(214,158,46,0.12)'}
                  strokeWidth={2}
                />
              ))}
            </MapView>

            <View style={styles.zoomControls}>
              <Pressable style={[styles.zoomButton, styles.zoomButtonTop]} onPress={() => handleZoom(true)}>
                <ThemedText style={styles.zoomButtonText}>+</ThemedText>
              </Pressable>
              <Pressable style={[styles.zoomButton, styles.zoomButtonBottom]} onPress={() => handleZoom(false)}>
                <ThemedText style={styles.zoomButtonText}>−</ThemedText>
              </Pressable>
            </View>

            {currentRegion && (
              <Pressable style={styles.locateButton} onPress={handleCenterOnDevice}>
                <Ionicons name="locate" size={22} color={theme.colors.primary} />
              </Pressable>
            )}

            {isLoading && (
              <View style={styles.loadingOverlay}>
                <LoadingState
                  message="Cargando ubicación..."
                  icon="location.fill"
                  iconColor={CommonColors.locationIcon}
                  variant="compact"
                />
              </View>
            )}
          </>
        )}
      </Animated.View>

    </SafeAreaView>
  );
}
