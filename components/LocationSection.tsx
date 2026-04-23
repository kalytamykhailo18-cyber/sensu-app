import { Button, Card, StatusBadge } from '@/components/shared';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { WebView } from 'react-native-webview';

interface LocationSectionProps {
  mapProvider: any;
  initialRegion: any;
  currentRegion: any;
  isLoading: boolean;
  isConnected: boolean;
}

const STREET_STYLE_URL = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';
const SAT_STYLE = JSON.stringify({
  version: 8,
  sources: { sat: { type: 'raster', tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'], tileSize: 256 } },
  layers: [{ id: 'sat', type: 'raster', source: 'sat' }],
});

function buildMapLibreHtml(
  center: { latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number },
  markerLat?: number,
  markerLng?: number,
  satellite = false,
) {
  const style = satellite ? SAT_STYLE : `'${STREET_STYLE_URL}'`;
  const markerJs = (markerLat != null && markerLng != null)
    ? `new maplibregl.Marker({color:'#10B981'}).setLngLat([${markerLng},${markerLat}]).addTo(map);`
    : '';
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link href="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.css" rel="stylesheet"/>
<script src="https://unpkg.com/maplibre-gl@3.6.2/dist/maplibre-gl.js"></script>
<style>body,html,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden}</style></head>
<body><div id="map"></div><script>
var map=new maplibregl.Map({container:'map',style:${style},center:[${center.longitude},${center.latitude}],zoom:14,attributionControl:false});
${markerJs}
</script></body></html>`;
}

export const LocationSection = React.memo(function LocationSection({
  mapProvider,
  initialRegion,
  currentRegion,
  isLoading,
  isConnected,
}: LocationSectionProps) {
  const theme = useAppTheme();
  const mapRef = useRef<MapView>(null);
  const [isSatellite, setIsSatellite] = useState(false);

  const handleCenterOnDevice = useCallback(() => {
    if (!currentRegion || !mapRef.current) return;
    mapRef.current.animateToRegion(currentRegion as Region, 600);
  }, [currentRegion]);

  const safeCurrentRegion =
    currentRegion &&
    typeof currentRegion === 'object' &&
    typeof currentRegion.latitude === 'number' &&
    typeof currentRegion.longitude === 'number'
      ? currentRegion
      : undefined;

  const mapCenter = safeCurrentRegion || initialRegion;

  return (
    <>
      <SectionHeader
        title="Ubicación Actual"
        icon="location.fill"
        iconColor={theme.colors.info}
        rightElement={
          <Button
            title="Ver mapa completo"
            onPress={() => router.push('/ubicacion')}
            variant="outline"
            size="small"
          />
        }
      />

      <Card variant="elevated" padding="medium" style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderTopWidth: 3,
        borderTopColor: theme.colors.secondary,
        marginHorizontal: 16,
      }}>
        <StatusBadge
          status={isConnected ? 'connected' : 'disconnected'}
          text={isConnected ? 'GPS Conectado' : 'Sin señal GPS'}
          size="small"
        />
      </Card>

      {/* Satellite toggle row — above the map */}
      {Platform.OS !== 'web' && (
        <Pressable
          style={[satRowStyle.row, { marginHorizontal: 16, marginBottom: 8 }]}
          onPress={() => setIsSatellite(v => !v)}
        >
          <Ionicons name="layers-outline" size={16} color={theme.colors.text} />
          <Text style={[satRowStyle.label, { color: theme.colors.text }]}>Vista satélite</Text>
          <View style={[satRowStyle.pill, isSatellite && satRowStyle.pillActive]}>
            <Text style={[satRowStyle.pillText, isSatellite && satRowStyle.pillTextActive]}>
              {isSatellite ? 'ON' : 'OFF'}
            </Text>
          </View>
        </Pressable>
      )}

      <Card variant="elevated" padding="none" style={{
        height: 220,
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: theme.colors.border,
        shadowColor: theme.colors.black,
        shadowOpacity: theme.isDark ? 0.2 : 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        alignSelf: 'center',
        marginHorizontal: 16,
        marginBottom: 20,
      }}>
        {Platform.OS === 'web' ? (
          <View style={{ width: '100%', height: '100%' }}>
            {/* @ts-ignore */}
            <iframe
              src={
                safeCurrentRegion
                  ? `https://www.openstreetmap.org/export/embed.html?bbox=${safeCurrentRegion.longitude - 0.01},${safeCurrentRegion.latitude - 0.01},${safeCurrentRegion.longitude + 0.01},${safeCurrentRegion.latitude + 0.01}&layer=mapnik&marker=${safeCurrentRegion.latitude},${safeCurrentRegion.longitude}`
                  : 'https://www.openstreetmap.org/export/embed.html?bbox=-99.1432,19.4226,-99.1232,19.4426&layer=mapnik'
              }
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="Ubicación del dispositivo"
            />
          </View>
        ) : Platform.OS === 'android' ? (
          <WebView
            key={isSatellite ? 'sat' : 'street'}
            source={{ html: buildMapLibreHtml(mapCenter, safeCurrentRegion?.latitude, safeCurrentRegion?.longitude, isSatellite) }}
            style={{ width: '100%', height: '100%' }}
            scrollEnabled={false}
          />
        ) : (
          <>
            <MapView
              ref={mapRef}
              style={{ width: '100%', height: '100%' }}
              provider={mapProvider}
              initialRegion={initialRegion}
              region={safeCurrentRegion}
              mapType={isSatellite ? 'hybrid' : 'standard'}
              showsUserLocation
              showsMyLocationButton
              loadingEnabled={false}
            >
              {safeCurrentRegion && (
                <Marker
                  coordinate={{ latitude: safeCurrentRegion.latitude, longitude: safeCurrentRegion.longitude }}
                  title="Ubicación del Dispositivo"
                  description="Ubicación actual del dispositivo"
                  pinColor="#10B981"
                />
              )}
            </MapView>
            {safeCurrentRegion && (
              <Pressable style={locateStyles.locateButton} onPress={handleCenterOnDevice}>
                <Ionicons name="locate" size={20} color={theme.colors.primary} />
              </Pressable>
            )}
          </>
        )}

      </Card>
    </>
  );
});

const locateStyles = StyleSheet.create({
  locateButton: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});

const satRowStyle = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 10, paddingVertical: 9, paddingHorizontal: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  label: { flex: 1, fontSize: 13 },
  pill: {
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 12, backgroundColor: '#E5E7EB',
  },
  pillActive: { backgroundColor: '#10B981' },
  pillText: { fontSize: 12, fontWeight: '700', color: '#6B7280' },
  pillTextActive: { color: '#fff' },
});
