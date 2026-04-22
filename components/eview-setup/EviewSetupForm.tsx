import { Button } from '@/components/shared';
import { ThemedText } from '@/components/ThemedText';
import { useWatchConfig } from '@/contexts/WatchConfigContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { EviewSetupInstructions } from './EviewSetupInstructions';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const SPRING = { damping: 18, stiffness: 200 };
const EASE   = { duration: 380 };

export function EviewSetupForm() {
  const [deviceId, setDeviceId] = useState('');
  const [label, setLabel]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const theme = useAppTheme();
  const { setWatchImei } = useWatchConfig();

  const isValidImei = /^\d{15}$/.test(deviceId.replace(/\s/g, ''));
  const showError   = deviceId.length > 0 && !isValidImei;

  // ── Entrance shared values ────────────────────────────────────────────────
  const subOp   = useSharedValue(0); const subY   = useSharedValue(18);
  const f1Op    = useSharedValue(0); const f1Y    = useSharedValue(16);
  const f2Op    = useSharedValue(0); const f2Y    = useSharedValue(16);
  const instrOp = useSharedValue(0); const instrY = useSharedValue(16);
  const btnOp   = useSharedValue(0); const btnS   = useSharedValue(0.94);

  // ── Focus / interaction ────────────────────────────────────────────────────
  const fo1  = useSharedValue(0); // IMEI focus
  const fo2  = useSharedValue(0); // label focus
  const ps   = useSharedValue(1); // button press
  const errOp = useSharedValue(0); // error text fade

  useEffect(() => {
    subOp.value   = withDelay(0,   withTiming(1, EASE));
    subY.value    = withDelay(0,   withTiming(0, EASE));
    f1Op.value    = withDelay(80,  withTiming(1, EASE));
    f1Y.value     = withDelay(80,  withTiming(0, EASE));
    f2Op.value    = withDelay(160, withTiming(1, EASE));
    f2Y.value     = withDelay(160, withTiming(0, EASE));
    instrOp.value = withDelay(240, withTiming(1, EASE));
    instrY.value  = withDelay(240, withTiming(0, EASE));
    btnOp.value   = withDelay(320, withTiming(1, EASE));
    btnS.value    = withDelay(320, withSpring(1, SPRING));
  }, []);

  useEffect(() => {
    errOp.value = withTiming(showError ? 1 : 0, { duration: 200 });
  }, [showError]);

  // ── Animated styles ────────────────────────────────────────────────────────
  const subStyle   = useAnimatedStyle(() => ({ opacity: subOp.value,   transform: [{ translateY: subY.value }] }));
  const f1Style    = useAnimatedStyle(() => ({ opacity: f1Op.value,    transform: [{ translateY: f1Y.value }] }));
  const f2Style    = useAnimatedStyle(() => ({ opacity: f2Op.value,    transform: [{ translateY: f2Y.value }] }));
  const instrStyle = useAnimatedStyle(() => ({ opacity: instrOp.value, transform: [{ translateY: instrY.value }] }));
  const btnStyle   = useAnimatedStyle(() => ({ opacity: btnOp.value,   transform: [{ scale: btnS.value * ps.value }] }));
  const errStyle   = useAnimatedStyle(() => ({ opacity: errOp.value }));

  const primary = theme.colors.primary as string;
  const border  = theme.colors.border  as string;

  const brd1 = useAnimatedStyle(() => ({
    borderColor: showError
      ? (theme.colors.error as string)
      : interpolateColor(fo1.value, [0, 1], [border, primary]),
  }));
  const brd2 = useAnimatedStyle(() => ({
    borderColor: interpolateColor(fo2.value, [0, 1], [border, primary]),
  }));

  const handleSubmit = async () => {
    if (!deviceId.trim()) {
      Alert.alert('Error', 'Por favor ingresa el IMEI del botón de emergencia');
      return;
    }
    if (!isValidImei) {
      Alert.alert('Error', 'El IMEI debe tener exactamente 15 dígitos');
      return;
    }
    setIsLoading(true);
    try {
      await setWatchImei(deviceId.trim(), label.trim() || undefined);
      Alert.alert(
        'Botón Vinculado',
        'Tu botón de emergencia ha sido vinculado exitosamente.',
        [{ text: 'Continuar', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo vincular el dispositivo. Verifica el IMEI e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 32,
      textAlign: 'center',
      lineHeight: 22,
    },
    inputContainer: { marginBottom: 16 },
    label: {
      fontSize: 14, fontWeight: '600',
      color: theme.colors.text, marginBottom: 8,
    },
    inputWrap: {
      borderRadius: 12, borderWidth: 1,
      backgroundColor: theme.colors.surface,
    },
    input: {
      paddingHorizontal: 16, paddingVertical: 14,
      fontSize: 16, color: theme.colors.text,
    },
    helperText: { fontSize: 12, color: theme.colors.textSecondary, marginTop: 4 },
    errorText:  { fontSize: 12, color: theme.colors.error, marginTop: 4 },
    buttonContainer: { marginTop: 24 },
  });

  return (
    <>
      {/* Subtitle */}
      <Animated.View style={subStyle}>
        <ThemedText style={styles.subtitle}>
          Vincula un botón de emergencia Eview para recibir alertas cuando sea presionado
        </ThemedText>
      </Animated.View>

      {/* IMEI field */}
      <Animated.View style={[styles.inputContainer, f1Style]}>
        <ThemedText style={styles.label}>IMEI del Dispositivo *</ThemedText>
        <Animated.View style={[styles.inputWrap, brd1]}>
          <TextInput
            style={styles.input}
            value={deviceId}
            onChangeText={setDeviceId}
            placeholder="Ingresa el IMEI de 15 dígitos"
            placeholderTextColor={theme.colors.textSecondary}
            keyboardType="number-pad"
            maxLength={15}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => { fo1.value = withTiming(1, { duration: 180 }); }}
            onBlur={() =>  { fo1.value = withTiming(0, { duration: 180 }); }}
          />
        </Animated.View>
        <Animated.View style={errStyle}>
          <ThemedText style={styles.errorText}>
            El IMEI debe tener exactamente 15 dígitos
          </ThemedText>
        </Animated.View>
        <ThemedText style={styles.helperText}>
          Puedes encontrar el IMEI en la etiqueta del dispositivo o en la caja
        </ThemedText>
      </Animated.View>

      {/* Label field */}
      <Animated.View style={[styles.inputContainer, f2Style]}>
        <ThemedText style={styles.label}>Nombre del Dispositivo (opcional)</ThemedText>
        <Animated.View style={[styles.inputWrap, brd2]}>
          <TextInput
            style={styles.input}
            value={label}
            onChangeText={setLabel}
            placeholder="Ej: Botón de Mamá, Emergencia Casa"
            placeholderTextColor={theme.colors.textSecondary}
            maxLength={50}
            onFocus={() => { fo2.value = withTiming(1, { duration: 180 }); }}
            onBlur={() =>  { fo2.value = withTiming(0, { duration: 180 }); }}
          />
        </Animated.View>
        <ThemedText style={styles.helperText}>
          Un nombre descriptivo para identificar este botón
        </ThemedText>
      </Animated.View>

      {/* Instructions accordion */}
      <Animated.View style={instrStyle}>
        <EviewSetupInstructions />
      </Animated.View>

      {/* Submit button */}
      <Animated.View style={[styles.buttonContainer, btnStyle]}>
        <Button
          title="Vincular Botón"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!deviceId.trim() || !isValidImei}
          icon="bell.badge"
          variant="primary"
        />
      </Animated.View>
    </>
  );
}
