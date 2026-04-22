// components/BatteryGauge.tsx
import { CommonColors } from '@/components/CommonStyles';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type Props = {
  /** 0 a 100, null when unknown */
  level: number | null;
  /** Ancho total del componente (incluye el cap) */
  width?: number;
  /** Alto del cuerpo de la batería (sin contar el cap) */
  height?: number;
  /** ¿Mostrar el % centrado? */
  showPercent?: boolean;
  /** Si está cargando, animamos un pulso sutil */
  charging?: boolean;
};

export const BatteryGauge: React.FC<Props> = React.memo(function BatteryGauge({
  level,
  width = 140,
  height = 32,
  showPercent = true,
  charging = false,
}) {
  if (level == null) {
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', opacity: 0.5 }}>
        <Text style={{ fontSize: 13, color: CommonColors.batteryGaugeText }}>🔋 --</Text>
      </View>
    );
  }
  const clamped = Math.max(0, Math.min(100, Math.round(level)));

  // Initialize with current level to prevent initial animation
  const animLevel = useRef(new Animated.Value(clamped)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const previousLevel = useRef(clamped);

  // Geometría
  const borderRadius = Math.round(height * 0.28);
  const capWidth = Math.max(6, Math.round(height * 0.18));
  const bodyWidth = width - capWidth;
  const innerPadding = 3;
  const innerMax = bodyWidth - innerPadding * 2;

  // Animate only when level actually changes
  useEffect(() => {
    if (previousLevel.current !== clamped) {
      Animated.timing(animLevel, {
        toValue: clamped,
        duration: 400,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start();
      previousLevel.current = clamped;
    }
  }, [clamped, animLevel]);

  // Subtle pulse for charging or low battery
  useEffect(() => {
    if (charging || clamped <= 15) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 0.92,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
          Animated.timing(pulse, {
            toValue: 1.0,
            duration: 600,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true
          }),
        ]),
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulse.stopAnimation();
      Animated.timing(pulse, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [charging, clamped, pulse]);

  // Ancho animado del relleno
  const fillWidth = animLevel.interpolate({
    inputRange: [0, 100],
    outputRange: [0, innerMax],
  });

  // Color por umbral
  const levelColor =
    clamped <= 15 ? CommonColors.batteryGaugeLow : clamped <= 40 ? CommonColors.batteryGaugeMedium : CommonColors.batteryGaugeHigh;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: pulse }] }]}>
      {/* Cuerpo */}
      <View
        style={[
          styles.body,
          { width: bodyWidth, height, borderRadius },
        ]}
      >
        <View
          style={[
            styles.innerTrack,
            { borderRadius: Math.max(6, borderRadius - 2), padding: innerPadding },
          ]}
        >
          <Animated.View
            style={[
              styles.innerFill,
              {
                width: fillWidth,
                backgroundColor: levelColor,
                borderRadius: Math.max(6, borderRadius - 4),
                height: height - innerPadding * 2,
              },
            ]}
          />
        </View>

        {showPercent && (
          <View style={styles.centerLabel}>
            <Text style={styles.percentText}>{clamped}%</Text>
          </View>
        )}
      </View>

      {/* Cap */}
      <View
        style={[
          styles.cap,
          {
            width: capWidth,
            height: Math.round(height * 0.55),
            borderTopRightRadius: Math.round(borderRadius * 0.6),
            borderBottomRightRadius: Math.round(borderRadius * 0.6),
          },
        ]}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center' },
  body: {
    borderWidth: 2,
    borderColor: CommonColors.batteryGaugeBorder,
    backgroundColor: CommonColors.batteryGaugeBackground,
    position: 'relative',
  },
  innerTrack: {
    flex: 1,
    backgroundColor: CommonColors.batteryGaugeTrack,
    overflow: 'hidden',
  },
  innerFill: { height: '100%' },
  cap: { marginLeft: 4, backgroundColor: CommonColors.batteryGaugeCap },
  centerLabel: {
    position: 'absolute',
    top: 0, bottom: 0, left: 6, right: 6,
    alignItems: 'center', justifyContent: 'center',
    pointerEvents: 'none',
  },
  percentText: { fontSize: 12, fontWeight: '700', color: CommonColors.batteryGaugeText },
});
