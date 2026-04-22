import { CommonColors } from '@/components/CommonStyles';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { API_CONFIG } from '@/config/api';
import { useAuth } from '@/hooks/useAuth';
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
const EASE   = { duration: 380, easing: Easing.out(Easing.cubic) };

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { login } = useAuth();

  const C = useMemo(() => ({
    bg:               isDark ? '#0B0B0F' : '#F8F9FA',
    fg:               isDark ? '#F3F4F6' : '#111827',
    muted:            isDark ? '#9CA3AF' : '#6B7280',
    inputBg:          isDark ? '#121319' : '#FFFFFF',
    inputBorderIdle:  isDark ? '#1F2430' : '#E5E7EB',
    inputBorderFocus: '#3B82F6',
    buttonBg:         '#111111',
    buttonFg:         '#FFFFFF',
    placeholder:      isDark ? '#6B7280' : '#9CA3AF',
    shadow:           '#000000',
  }), [isDark]);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [imei,     setImei]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [pass,     setPass]     = useState('');
  const [pass2,    setPass2]    = useState('');
  const [secure,   setSecure]   = useState(true);
  const [secure2,  setSecure2]  = useState(true);
  const [loading,  setLoading]  = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // entrance
  const logoOp  = useSharedValue(0); const logoS   = useSharedValue(0.7);
  const titleOp = useSharedValue(0); const titleY  = useSharedValue(20);
  const formOp  = useSharedValue(0); const formY   = useSharedValue(16);
  const btnOp   = useSharedValue(0); const btnS    = useSharedValue(0.93);
  const footOp  = useSharedValue(0);
  const pressS  = useSharedValue(1);

  useEffect(() => {
    logoOp.value  = withDelay(0,   withTiming(1, { duration: 500 }));
    logoS.value   = withDelay(0,   withSpring(1, SPRING));
    titleOp.value = withDelay(120, withTiming(1, EASE));
    titleY.value  = withDelay(120, withTiming(0, EASE));
    formOp.value  = withDelay(220, withTiming(1, EASE));
    formY.value   = withDelay(220, withTiming(0, EASE));
    btnOp.value   = withDelay(340, withTiming(1, EASE));
    btnS.value    = withDelay(340, withSpring(1, SPRING));
    footOp.value  = withDelay(440, withTiming(1, EASE));
  }, []);

  // focus animations
  const nameFocus  = useSharedValue(0);
  const emailFocus = useSharedValue(0);
  const imeiFocus  = useSharedValue(0);
  const phoneFocus = useSharedValue(0);
  const passFocus  = useSharedValue(0);
  const pass2Focus = useSharedValue(0);

  const focusBorder = (v: typeof nameFocus) =>
    useAnimatedStyle(() => ({
      borderColor: interpolateColor(v.value, [0, 1], [C.inputBorderIdle, C.inputBorderFocus]),
    }));

  const logoStyle  = useAnimatedStyle(() => ({ opacity: logoOp.value,  transform: [{ scale: logoS.value }] }));
  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOp.value, transform: [{ translateY: titleY.value }] }));
  const formStyle  = useAnimatedStyle(() => ({ opacity: formOp.value,  transform: [{ translateY: formY.value }] }));
  const btnStyle   = useAnimatedStyle(() => ({ opacity: btnOp.value,   transform: [{ scale: btnS.value * pressS.value }] }));
  const footStyle  = useAnimatedStyle(() => ({ opacity: footOp.value }));

  const showError = (msg: string) => setErrorMsg(msg);

  const onSubmit = async () => {
    setErrorMsg('');
    if (!name.trim() || !email.trim() || !imei.trim() || !pass.trim() || !pass2.trim()) {
      showError('Por favor completa nombre, correo, IMEI y contraseña');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      showError('Por favor ingresa un correo válido');
      return;
    }
    if (!/^\d{15}$/.test(imei.trim())) {
      showError('El IMEI debe tener exactamente 15 dígitos');
      return;
    }
    if (pass.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (pass !== pass2) {
      showError('Las contraseñas no coinciden');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_CONFIG.WATCH_SERVER_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username:     email.trim().toLowerCase(),
          email:        email.trim().toLowerCase(),
          password:     pass,
          phone_number: phone.trim() || null,
          device_imei:  imei.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg =
          data?.detail === 'Email already registered' ? 'Este correo ya tiene una cuenta. Inicia sesión.' :
          data?.detail === 'IMEI not registered'      ? 'Este IMEI no está registrado. Verifica el número en tu reloj.' :
          (data?.detail || 'Error al crear la cuenta');
        showError(msg);
        return;
      }

      const loginResult = await login({ email: email.trim().toLowerCase(), password: pass });
      if (loginResult.success) {
        router.replace('/(tabs)/home');
      } else {
        showError('Cuenta creada, pero no se pudo iniciar sesión automáticamente. Inicia sesión manualmente.');
        router.replace('/login');
      }
    } catch {
      showError('No se pudo conectar al servidor. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: C.bg }]}>
      <Pressable onPress={() => router.back()} style={styles.back}>
        <IconSymbol name="chevron.left" size={24} color={C.fg} />
      </Pressable>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.select({ ios: 'padding', android: 'height' })}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.logoWrap, logoStyle]}>
            <IconSymbol name="lock.shield.fill" size={60} color={CommonColors.buttonPrimary} />
          </Animated.View>

          <Animated.Text style={[styles.title, { color: C.fg }, titleStyle]}>
            Crear cuenta
          </Animated.Text>

          <Animated.View style={formStyle}>
            {/* Name */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.fg }]}>Nombre completo</Text>
              <Animated.View style={[styles.input, { backgroundColor: C.inputBg }, focusBorder(nameFocus)]}>
                <TextInput
                  value={name} onChangeText={setName}
                  placeholder="Tu nombre" placeholderTextColor={C.placeholder}
                  autoCapitalize="words" textContentType="name"
                  onFocus={() => { nameFocus.value = withTiming(1, { duration: 200 }); }}
                  onBlur={() =>  { nameFocus.value = withTiming(0, { duration: 200 }); }}
                  style={[styles.inputText, { color: C.fg }]}
                />
              </Animated.View>
            </View>

            {/* Email */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.fg }]}>Correo electrónico</Text>
              <Animated.View style={[styles.input, { backgroundColor: C.inputBg }, focusBorder(emailFocus)]}>
                <TextInput
                  value={email} onChangeText={setEmail}
                  placeholder="nombre@ejemplo.com" placeholderTextColor={C.placeholder}
                  keyboardType="email-address" autoCapitalize="none" textContentType="emailAddress"
                  onFocus={() => { emailFocus.value = withTiming(1, { duration: 200 }); }}
                  onBlur={() =>  { emailFocus.value = withTiming(0, { duration: 200 }); }}
                  style={[styles.inputText, { color: C.fg }]}
                />
              </Animated.View>
            </View>

            {/* IMEI */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.fg }]}>IMEI del reloj</Text>
              <Animated.View style={[styles.input, { backgroundColor: C.inputBg }, focusBorder(imeiFocus)]}>
                <TextInput
                  value={imei} onChangeText={t => setImei(t.replace(/\D/g, ''))}
                  placeholder="15 dígitos" placeholderTextColor={C.placeholder}
                  keyboardType="numeric" maxLength={15}
                  onFocus={() => { imeiFocus.value = withTiming(1, { duration: 200 }); }}
                  onBlur={() =>  { imeiFocus.value = withTiming(0, { duration: 200 }); }}
                  style={[styles.inputText, { color: C.fg }]}
                />
              </Animated.View>
            </View>

            {/* Phone (optional) */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.fg }]}>Teléfono <Text style={{ color: C.muted, fontWeight: '400' }}>(opcional)</Text></Text>
              <Animated.View style={[styles.input, { backgroundColor: C.inputBg }, focusBorder(phoneFocus)]}>
                <TextInput
                  value={phone} onChangeText={setPhone}
                  placeholder="+52 55 0000 0000" placeholderTextColor={C.placeholder}
                  keyboardType="phone-pad" textContentType="telephoneNumber"
                  onFocus={() => { phoneFocus.value = withTiming(1, { duration: 200 }); }}
                  onBlur={() =>  { phoneFocus.value = withTiming(0, { duration: 200 }); }}
                  style={[styles.inputText, { color: C.fg }]}
                />
              </Animated.View>
            </View>

            {/* Password */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.fg }]}>Contraseña</Text>
              <Animated.View style={[styles.inputRow, { backgroundColor: C.inputBg }, focusBorder(passFocus)]}>
                <TextInput
                  value={pass} onChangeText={setPass}
                  placeholder="Mínimo 6 caracteres" placeholderTextColor={C.placeholder}
                  secureTextEntry={secure} autoCapitalize="none" textContentType="newPassword"
                  onFocus={() => { passFocus.value = withTiming(1, { duration: 200 }); }}
                  onBlur={() =>  { passFocus.value = withTiming(0, { duration: 200 }); }}
                  style={[styles.inputInner, { color: C.fg }]}
                />
                <Pressable onPress={() => setSecure(s => !s)} hitSlop={10}>
                  <Text style={{ color: C.muted }}>{secure ? 'Mostrar' : 'Ocultar'}</Text>
                </Pressable>
              </Animated.View>
            </View>

            {/* Confirm password */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: C.fg }]}>Confirmar contraseña</Text>
              <Animated.View style={[styles.inputRow, { backgroundColor: C.inputBg }, focusBorder(pass2Focus)]}>
                <TextInput
                  value={pass2} onChangeText={setPass2}
                  placeholder="Repite tu contraseña" placeholderTextColor={C.placeholder}
                  secureTextEntry={secure2} autoCapitalize="none" textContentType="newPassword"
                  onFocus={() => { pass2Focus.value = withTiming(1, { duration: 200 }); }}
                  onBlur={() =>  { pass2Focus.value = withTiming(0, { duration: 200 }); }}
                  style={[styles.inputInner, { color: C.fg }]}
                />
                <Pressable onPress={() => setSecure2(s => !s)} hitSlop={10}>
                  <Text style={{ color: C.muted }}>{secure2 ? 'Mostrar' : 'Ocultar'}</Text>
                </Pressable>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Error banner */}
          {!!errorMsg && (
            <View style={styles.errorBanner}>
              <IconSymbol name="exclamationmark.circle.fill" size={16} color="#DC2626" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          )}

          {/* Submit */}
          <Animated.View style={btnStyle}>
            <AnimatedPressable
              onPress={onSubmit}
              onPressIn={() => { pressS.value = withSpring(0.96, SPRING); }}
              onPressOut={() => { pressS.value = withSpring(1.00, SPRING); }}
              disabled={loading}
              style={[styles.button, { backgroundColor: C.buttonBg, opacity: loading ? 0.7 : 1, shadowColor: C.shadow }]}
            >
              <Text style={[styles.buttonText, { color: C.buttonFg }]}>
                {loading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Text>
            </AnimatedPressable>
          </Animated.View>

          <Animated.View style={[styles.footerRow, footStyle]}>
            <Text style={{ color: C.muted }}>¿Ya tienes cuenta? </Text>
            <Pressable onPress={() => router.replace('/login')}>
              <Text style={[styles.link, { color: C.fg }]}>Inicia sesión</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex:    { flex: 1 },
  safe:    { flex: 1 },
  back:    { padding: 16, paddingBottom: 0 },
  scroll:  { flexGrow: 1, paddingHorizontal: 24, paddingTop: 16, paddingBottom: 32 },
  logoWrap: { alignItems: 'center', marginBottom: 20 },
  title:   { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 24, letterSpacing: 0.2 },
  field:   { marginBottom: 14 },
  label:   { fontSize: 14, fontWeight: '600', marginBottom: 6 },
  input: {
    height: 48, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, justifyContent: 'center',
  },
  inputText:  { flex: 1, height: '100%' },
  inputRow: {
    height: 48, borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center',
  },
  inputInner: { flex: 1, height: '100%' },
  button: {
    height: 50, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    marginTop: 8,
    shadowOpacity: Platform.select({ ios: 0.08, android: 0 }),
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 0,
  },
  buttonText:  { fontSize: 16, fontWeight: '700' },
  footerRow:   { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  link:        { fontWeight: '700' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    marginBottom: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: '#DC2626', lineHeight: 18 },
});
