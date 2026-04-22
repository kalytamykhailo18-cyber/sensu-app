import { CommonColors } from '@/components/CommonStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger/logger';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    useColorScheme,
    View,
} from 'react-native';
import Animated, {
    Easing,
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const SPRING = { damping: 18, stiffness: 220 };
const EASE = { duration: 420, easing: Easing.out(Easing.cubic) };

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login, isLoading: authLoading } = useAuth();

  const C = useMemo(
    () => ({
      bg: isDark ? '#0B0B0F' : '#F8F9FA',
      fg: isDark ? '#F3F4F6' : '#111827',
      muted: isDark ? '#9CA3AF' : '#6B7280',
      inputBg: isDark ? '#121319' : '#FFFFFF',
      inputBorderIdle: isDark ? '#1F2430' : '#E5E7EB',
      inputBorderFocus: '#3B82F6',
      buttonBg: '#111111',
      buttonFg: '#FFFFFF',
      placeholder: isDark ? '#6B7280' : '#9CA3AF',
      shadow: '#000000',
    }),
    [isDark]
  );

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [secure, setSecure] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ── Entrance shared values ──────────────────────────────────────────────
  const logoOpacity  = useSharedValue(0);
  const logoScale    = useSharedValue(0.7);
  const titleOpacity = useSharedValue(0);
  const titleY       = useSharedValue(22);
  const subOpacity   = useSharedValue(0);
  const subY         = useSharedValue(16);
  const emailOpacity = useSharedValue(0);
  const emailY       = useSharedValue(16);
  const passOpacity  = useSharedValue(0);
  const passY        = useSharedValue(16);
  const btnOpacity   = useSharedValue(0);
  const btnScale     = useSharedValue(0.93);
  const footerOpacity = useSharedValue(0);

  // ── Interaction shared values ───────────────────────────────────────────
  const pressScale   = useSharedValue(1);
  const eyeScale     = useSharedValue(1);
  const emailFocus   = useSharedValue(0);
  const passFocus    = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value  = withDelay(0,   withTiming(1, { duration: 500 }));
    logoScale.value    = withDelay(0,   withSpring(1, SPRING));
    titleOpacity.value = withDelay(120, withTiming(1, EASE));
    titleY.value       = withDelay(120, withTiming(0, EASE));
    subOpacity.value   = withDelay(210, withTiming(1, EASE));
    subY.value         = withDelay(210, withTiming(0, EASE));
    emailOpacity.value = withDelay(310, withTiming(1, EASE));
    emailY.value       = withDelay(310, withTiming(0, EASE));
    passOpacity.value  = withDelay(390, withTiming(1, EASE));
    passY.value        = withDelay(390, withTiming(0, EASE));
    btnOpacity.value   = withDelay(470, withTiming(1, EASE));
    btnScale.value     = withDelay(470, withSpring(1, SPRING));
    footerOpacity.value = withDelay(560, withTiming(1, EASE));
  }, []);

  // ── Animated styles ─────────────────────────────────────────────────────
  const logoStyle    = useAnimatedStyle(() => ({ opacity: logoOpacity.value, transform: [{ scale: logoScale.value }] }));
  const titleStyle   = useAnimatedStyle(() => ({ opacity: titleOpacity.value, transform: [{ translateY: titleY.value }] }));
  const subStyle     = useAnimatedStyle(() => ({ opacity: subOpacity.value,   transform: [{ translateY: subY.value }] }));
  const emailStyle   = useAnimatedStyle(() => ({ opacity: emailOpacity.value, transform: [{ translateY: emailY.value }] }));
  const passStyle    = useAnimatedStyle(() => ({ opacity: passOpacity.value,  transform: [{ translateY: passY.value }] }));
  const btnStyle     = useAnimatedStyle(() => ({ opacity: btnOpacity.value,   transform: [{ scale: btnScale.value * pressScale.value }] }));
  const footerStyle  = useAnimatedStyle(() => ({ opacity: footerOpacity.value }));
  const eyeStyle     = useAnimatedStyle(() => ({ transform: [{ scale: eyeScale.value }] }));

  const emailBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(emailFocus.value, [0, 1], [isDark ? '#1F2430' : '#E5E7EB', '#3B82F6']),
  }));
  const passBorderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(passFocus.value, [0, 1], [isDark ? '#1F2430' : '#E5E7EB', '#3B82F6']),
  }));

  const onPressIn  = () => { pressScale.value = withSpring(0.96, SPRING); };
  const onPressOut = () => { pressScale.value = withSpring(1.00, SPRING); };

  const showError = (msg: string) => setErrorMsg(msg);

  const onSubmit = async () => {
    setErrorMsg('');
    try {
      setIsLoading(true);
      if (!email.trim() || !pass.trim()) {
        showError('Por favor completa todos los campos');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        showError('Por favor ingresa un correo electrónico válido');
        return;
      }
      const result = await login({ email: email.trim(), password: pass.trim() });
      if (result.success) {
        router.replace('/(tabs)/home');
      } else {
        showError(result.error || 'Correo o contraseña incorrectos');
      }
    } catch (error) {
      showError('No se pudo conectar al servidor. Verifica tu conexión.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
          contentInsetAdjustmentBehavior="automatic"
        >
          {/* Logo */}
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <Pressable onPress={() => router.push('/landing' as any)} hitSlop={12}>
              <IconSymbol name="square.stack.3d.up.fill" size={60} color={CommonColors.lightIcon} />
            </Pressable>
          </Animated.View>

          {/* Title */}
          <Animated.Text style={[styles.title, { color: C.fg }, titleStyle]}>
            Bienvenido a Sensu
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text style={[styles.subtitle, { color: C.muted }, subStyle]}>
            Inicia sesión para cuidar de los tuyos.
          </Animated.Text>

          {/* Email field */}
          <Animated.View style={[styles.field, emailStyle]}>
            <Text style={[styles.label, { color: C.fg }]}>Correo electrónico</Text>
            <Animated.View
              style={[
                styles.input,
                { backgroundColor: C.inputBg },
                emailBorderStyle,
              ]}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="nombre@ejemplo.com"
                placeholderTextColor={C.placeholder}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                onFocus={() => { emailFocus.value = withTiming(1, { duration: 200 }); }}
                onBlur={() =>  { emailFocus.value = withTiming(0, { duration: 200 }); }}
                style={[styles.inputText, { color: C.fg }]}
              />
            </Animated.View>
          </Animated.View>

          {/* Password field */}
          <Animated.View style={[styles.field, passStyle]}>
            <Text style={[styles.label, { color: C.fg }]}>Contraseña</Text>
            <Animated.View
              style={[
                styles.inputRow,
                { backgroundColor: C.inputBg },
                passBorderStyle,
              ]}
            >
              <TextInput
                value={pass}
                onChangeText={setPass}
                placeholder="••••••••"
                placeholderTextColor={C.placeholder}
                secureTextEntry={secure}
                autoCapitalize="none"
                textContentType="password"
                onFocus={() => { passFocus.value = withTiming(1, { duration: 200 }); }}
                onBlur={() =>  { passFocus.value = withTiming(0, { duration: 200 }); }}
                style={[styles.inputInner, { color: C.fg }]}
              />
              <Pressable
                onPress={() => setSecure(s => !s)}
                onPressIn={() =>  { eyeScale.value = withSpring(0.85, SPRING); }}
                onPressOut={() => { eyeScale.value = withSpring(1.00, SPRING); }}
                hitSlop={10}
              >
                <Animated.Text style={[{ color: C.muted }, eyeStyle]}>
                  {secure ? 'Mostrar' : 'Ocultar'}
                </Animated.Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          {/* Error banner */}
          {!!errorMsg && (
            <View style={styles.errorBanner}>
              <IconSymbol name="exclamationmark.circle.fill" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Submit button */}
          <Animated.View style={btnStyle}>
            <AnimatedPressable
              onPress={onSubmit}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={isLoading || authLoading}
              style={[
                styles.button,
                {
                  backgroundColor: C.buttonBg,
                  opacity: isLoading || authLoading ? 0.7 : 1,
                  shadowColor: C.shadow,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: C.buttonFg }]}>
                {isLoading || authLoading ? 'Ingresando…' : 'Iniciar Sesión'}
              </Text>
            </AnimatedPressable>
          </Animated.View>

          {/* Register link */}
          <Animated.View style={[styles.footerRow, footerStyle]}>
            <Text style={{ color: C.muted }}>¿No tienes cuenta? </Text>
            <Pressable onPress={() => router.push('/register' as any)}>
              <Text style={[styles.link, { color: C.fg }]}>Regístrate</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 24,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 28,
  },
  field: { marginBottom: 16 },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputText: {
    flex: 1,
    height: '100%',
  },
  inputRow: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputInner: {
    flex: 1,
    height: '100%',
  },
  button: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    shadowOpacity: Platform.select({ ios: 0.08, android: 0 }),
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 0,
  },
  buttonText: { fontSize: 16, fontWeight: '700' },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  link: { fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', lineHeight: 18 },
});
