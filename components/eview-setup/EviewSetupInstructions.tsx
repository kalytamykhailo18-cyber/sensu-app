import { ThemedText } from '@/components/ThemedText';
import { useAppTheme } from '@/hooks/useAppTheme';
import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SPRING = { damping: 16, stiffness: 140 };

// ── Single instruction step with staggered entrance ───────────────────────────
interface InstructionStepProps {
  number: number;
  title: string;
  description: string;
  important?: boolean;
  index: number;
  visible: boolean;
}

function InstructionStep({ number, title, description, important, index, visible }: InstructionStepProps) {
  const theme = useAppTheme();
  const op = useSharedValue(0);
  const ty = useSharedValue(12);
  const sc = useSharedValue(0.94);

  useEffect(() => {
    if (visible) {
      op.value = withDelay(index * 70, withTiming(1, { duration: 320 }));
      ty.value = withDelay(index * 70, withTiming(0, { duration: 320 }));
      sc.value = withDelay(index * 70, withSpring(1, { damping: 18, stiffness: 200 }));
    } else {
      op.value = withTiming(0, { duration: 150 });
      ty.value = withTiming(12, { duration: 150 });
      sc.value = withTiming(0.94, { duration: 150 });
    }
  }, [visible]);

  const anim = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: ty.value }, { scale: sc.value }],
  }));

  const styles = StyleSheet.create({
    step: { flexDirection: 'row', marginBottom: 16 },
    stepNumber: {
      width: 28, height: 28, borderRadius: 14,
      backgroundColor: important ? theme.colors.warning : theme.colors.primary,
      justifyContent: 'center', alignItems: 'center', marginRight: 12,
    },
    stepNumberText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    stepContent:    { flex: 1 },
    stepTitle:      { fontSize: 15, fontWeight: '600', color: theme.colors.text, marginBottom: 4 },
    stepDescription:{ fontSize: 13, color: theme.colors.textSecondary, lineHeight: 18 },
  });

  return (
    <Animated.View style={[styles.step, anim]}>
      <View style={styles.stepNumber}>
        <ThemedText style={styles.stepNumberText}>{number}</ThemedText>
      </View>
      <View style={styles.stepContent}>
        <ThemedText style={styles.stepTitle}>{title}</ThemedText>
        <ThemedText style={styles.stepDescription}>{description}</ThemedText>
      </View>
    </Animated.View>
  );
}

// ── Accordion ─────────────────────────────────────────────────────────────────
export function EviewSetupInstructions() {
  const [expanded, setExpanded] = useState(false);
  const theme = useAppTheme();

  const maxH    = useSharedValue(0);
  const chevron = useSharedValue(0);
  const headerS = useSharedValue(1);

  const toggle = () => {
    const opening = !expanded;
    maxH.value    = withSpring(opening ? 680 : 0, SPRING);
    chevron.value = withTiming(opening ? 1 : 0, { duration: 280 });
    setExpanded(v => !v);
  };

  const bodyStyle = useAnimatedStyle(() => ({
    maxHeight: maxH.value,
    overflow: 'hidden',
    opacity: interpolate(maxH.value, [0, 40], [0, 1], 'clamp'),
  }));

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(chevron.value, [0, 1], [0, 180])}deg` }],
  }));

  const headerPressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerS.value }],
  }));

  const instructions = [
    { title: 'Configura el APN',      description: 'Envía un SMS al botón con el comando de APN de tu operador.',                                        important: true  },
    { title: 'Configura el servidor', description: 'Envía el comando: ip1,test-loctube-iot.katchu.cn,38006',                                            important: true  },
    { title: 'Espera la conexión',    description: 'El botón tardará unos minutos en conectarse. Puedes verificar el estado en el portal EVMars.',        important: false },
    { title: 'Obtén el IMEI',         description: 'Busca el IMEI de 15 dígitos en la etiqueta del dispositivo o en la caja.',                           important: false },
    { title: 'Vincula el botón',      description: 'Ingresa el IMEI arriba y presiona "Vincular Botón".',                                                important: false },
  ];

  const styles = StyleSheet.create({
    container: { marginTop: 24, marginBottom: 8 },
    headerWrap: {
      borderRadius: 12, borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingVertical: 12, paddingHorizontal: 16,
      backgroundColor: theme.colors.surface,
    },
    headerText: { fontSize: 15, fontWeight: '600', color: theme.colors.primary },
    content:    { marginTop: 16, paddingHorizontal: 8 },
    warningBox: {
      backgroundColor: (theme.colors.warning as string) + '15',
      borderRadius: 12, padding: 16, marginBottom: 16,
      borderWidth: 1, borderColor: (theme.colors.warning as string) + '30',
    },
    warningTitle: { fontSize: 14, fontWeight: '600', color: theme.colors.warning, marginBottom: 8 },
    warningText:  { fontSize: 13, color: theme.colors.text, lineHeight: 18 },
    smsBox: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8, padding: 12, marginTop: 8,
    },
    smsLabel:   { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 4 },
    smsCommand: { fontSize: 14, fontFamily: 'monospace', color: theme.colors.primary, fontWeight: '600' },
  });

  return (
    <View style={styles.container}>
      {/* Accordion header */}
      <Animated.View style={[styles.headerWrap, headerPressStyle]}>
        <Pressable
          style={styles.header}
          onPress={toggle}
          onPressIn={() =>  { headerS.value = withTiming(0.98, { duration: 100 }); }}
          onPressOut={() => { headerS.value = withSpring(1.00, { damping: 15, stiffness: 300 }); }}
        >
          <ThemedText style={styles.headerText}>Instrucciones de configuración</ThemedText>
          <Animated.View style={chevronStyle}>
            <ThemedText style={{ fontSize: 14, color: theme.colors.primary }}>▼</ThemedText>
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Animated body */}
      <Animated.View style={bodyStyle}>
        <View style={styles.content}>
          {/* Warning box */}
          <View style={styles.warningBox}>
            <ThemedText style={styles.warningTitle}>Importante: Configuración inicial</ThemedText>
            <ThemedText style={styles.warningText}>
              Antes de vincular el botón, debes configurarlo para que se conecte a nuestros servidores.
              Esto solo se hace una vez.
            </ThemedText>
          </View>

          {/* Steps — each animates in staggered when visible */}
          {instructions.map((instr, i) => (
            <InstructionStep
              key={i}
              number={i + 1}
              title={instr.title}
              description={instr.description}
              important={instr.important}
              index={i}
              visible={expanded}
            />
          ))}

          {/* SMS command box */}
          <View style={styles.smsBox}>
            <ThemedText style={styles.smsLabel}>Comando SMS para servidor:</ThemedText>
            <ThemedText style={styles.smsCommand}>ip1,test-loctube-iot.katchu.cn,38006</ThemedText>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
