import { CommonColors } from '@/components/CommonStyles';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { UserProfile } from '@/contexts/ProfileContext';
import { useScreenData } from '@/hooks/shared';
import { useAppTheme } from '@/hooks/useAppTheme';
import { logger } from '@/utils/logger/logger';
import CalendarPicker from '@/components/CalendarPicker';
import ProfileImage from '@/components/ProfileImage';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from './shared';

const PRESS_IN  = { duration: 100 };
const PRESS_OUT = { duration: 200 };

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const BLOOD_TYPE_FROM_ENUM: Record<string, string> = {
  A_POSITIVE: 'A+', A_NEGATIVE: 'A-',
  B_POSITIVE: 'B+', B_NEGATIVE: 'B-',
  AB_POSITIVE: 'AB+', AB_NEGATIVE: 'AB-',
  O_POSITIVE: 'O+', O_NEGATIVE: 'O-',
};

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave: (updatedProfile: Partial<UserProfile>) => Promise<void>;
}

interface FormData {
  name: string;
  phone: string;
  dateOfBirth: string;
  height: string;
  weight: string;
  bloodType: string;
  medicalConditions: string;
  medications: string;
}

// ── Spring-press button ───────────────────────────────────────────────────────
function SpringButton({
  onPress, style, children, disabled,
}: {
  onPress: () => void; style?: object; children: React.ReactNode; disabled?: boolean;
}) {
  const sc = useSharedValue(1);
  const op = useSharedValue(1);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }], opacity: op.value }));
  return (
    <Animated.View style={anim}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        onPressIn={() => {
          sc.value = withTiming(0.92, PRESS_IN);
          op.value = withTiming(0.75, PRESS_IN);
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        onPressOut={() => {
          sc.value = withTiming(1, PRESS_OUT);
          op.value = withTiming(1, PRESS_OUT);
        }}
        style={style}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

// ── Animated text input with focus border ─────────────────────────────────────
function AnimatedInput({
  value, onChangeText, placeholder, placeholderTextColor,
  keyboardType, multiline, style, wrapStyle,
  primaryColor, borderColor,
}: {
  value: string; onChangeText: (v: string) => void;
  placeholder?: string; placeholderTextColor?: string;
  keyboardType?: any; multiline?: boolean;
  style?: object; wrapStyle?: object;
  primaryColor: string; borderColor: string;
}) {
  const fo = useSharedValue(0);
  const brd = useAnimatedStyle(() => ({
    borderColor: interpolateColor(fo.value, [0, 1], [borderColor, primaryColor]),
  }));
  return (
    <Animated.View style={[wrapStyle, brd]}>
      <TextInput
        style={style}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        multiline={multiline}
        onFocus={() =>  { fo.value = withTiming(1, { duration: 180 }); }}
        onBlur={() =>   { fo.value = withTiming(0, { duration: 180 }); }}
      />
    </Animated.View>
  );
}

// ── Blood type picker item ─────────────────────────────────────────────────────
function BloodTypeItem({
  type, selected, onPress, styles,
}: {
  type: string; selected: boolean; onPress: () => void; styles: any;
}) {
  const sc = useSharedValue(1);
  const bg = useSharedValue(selected ? 1 : 0);

  useEffect(() => {
    bg.value = withTiming(selected ? 1 : 0, { duration: 160 });
  }, [selected]);

  const anim = useAnimatedStyle(() => ({ transform: [{ scale: sc.value }] }));

  return (
    <Animated.View style={anim}>
      <Pressable
        style={[styles.pickerItem, selected && styles.selectedPickerItem]}
        onPress={onPress}
        onPressIn={() =>  { sc.value = withTiming(0.92, PRESS_IN); }}
        onPressOut={() => { sc.value = withTiming(1,    PRESS_OUT); }}
      >
        <Text style={styles.pickerItemText}>{type}</Text>
        {selected && (
          <IconSymbol name="checkmark" size={16} color={CommonColors.editProfileModalCheckmarkIcon} />
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function EditProfileModal({
  visible, onClose, profile, onSave,
}: EditProfileModalProps) {
  const { getResponsiveFontSize, getResponsivePadding, getResponsiveSize } = useScreenData();
  const theme = useAppTheme();
  const [formData, setFormData] = useState<FormData>({
    name: '', phone: '', dateOfBirth: '', height: '', weight: '',
    bloodType: '', medicalConditions: '', medications: '',
  });
  const [loading, setLoading] = useState(false);
  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (visible && profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth || '',
        height: profile.height?.toString() || '',
        weight: profile.weight?.toString() || '',
        bloodType: BLOOD_TYPE_FROM_ENUM[profile.bloodType || ''] || profile.bloodType || '',
        medicalConditions: profile.medicalConditions?.join(', ') || '',
        medications: profile.medications?.join(', ') || '',
      });
    }
  }, [visible, profile]);

  const primary  = theme.colors.primary as string;
  const border   = CommonColors.editProfileModalInputBorder as string;

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: CommonColors.editProfileModalOverlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: CommonColors.white,
      borderTopLeftRadius: getResponsiveSize(20, 24, 28),
      borderTopRightRadius: getResponsiveSize(20, 24, 28),
      maxHeight: '92%',
      paddingTop: getResponsivePadding(20, 24, 28),
      flex: 1,
    },
    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: getResponsivePadding(20, 24, 28),
      marginBottom: getResponsivePadding(20, 24, 28),
    },
    headerTitle: { fontSize: getResponsiveFontSize(18, 20, 22), fontWeight: 'bold', color: CommonColors.black },
    avatarSection: { alignItems: 'center', paddingVertical: 20, gap: 8 },
    avatarHint: { fontSize: 12, color: '#888' },
    scrollContent: { flex: 1 },
    scrollContentInner: { paddingHorizontal: getResponsivePadding(20, 24, 28), paddingBottom: getResponsivePadding(16, 20, 24) },
    section: { marginBottom: getResponsivePadding(24, 28, 32) },
    sectionTitle: {
      fontSize: getResponsiveFontSize(16, 18, 20), fontWeight: '600',
      color: CommonColors.black, marginBottom: getResponsivePadding(12, 16, 20),
    },
    inputGroup: { marginBottom: getResponsivePadding(16, 20, 24) },
    label: {
      fontSize: getResponsiveFontSize(14, 16, 18), fontWeight: '500',
      color: CommonColors.black, marginBottom: getResponsivePadding(6, 8, 10),
    },
    inputWrap: {
      borderWidth: 1,
      borderRadius: getResponsiveSize(8, 10, 12),
      backgroundColor: CommonColors.white,
    },
    input: {
      paddingHorizontal: getResponsivePadding(12, 16, 20),
      paddingVertical: getResponsivePadding(10, 12, 14),
      fontSize: getResponsiveFontSize(14, 16, 18),
      color: CommonColors.black,
    },
    multilineInput: { minHeight: getResponsiveSize(80, 100, 120), textAlignVertical: 'top' },
    pickerTriggerWrap: {
      borderWidth: 1, borderRadius: getResponsiveSize(8, 10, 12),
      backgroundColor: CommonColors.white,
    },
    pickerContainer: {
      borderWidth: 1, borderColor: CommonColors.editProfileModalPickerBorder,
      borderRadius: getResponsiveSize(8, 10, 12), backgroundColor: CommonColors.white,
    },
    pickerItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: getResponsivePadding(12, 16, 20),
      paddingVertical: getResponsivePadding(12, 16, 20),
      borderBottomWidth: 1, borderBottomColor: CommonColors.editProfileModalPickerItemBorder,
    },
    pickerItemText: { fontSize: getResponsiveFontSize(14, 16, 18), color: CommonColors.black },
    selectedPickerItem: { backgroundColor: CommonColors.editProfileModalSelectedItemBg },
    actionsContainer: {
      flexDirection: 'row', gap: getResponsivePadding(12, 16, 20),
      paddingHorizontal: getResponsivePadding(20, 24, 28),
      paddingBottom: getResponsivePadding(20, 24, 28),
      paddingTop: getResponsivePadding(12, 16, 20),
    },
    cancelHeaderText: { fontSize: 16, color: CommonColors.editProfileModalButtonPrimaryBg },
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isValidDate = (d: string) => { const dt = new Date(d); return dt instanceof Date && !isNaN(dt.getTime()); };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) { alert('El nombre es requerido'); return false; }
    if (formData.height && (isNaN(Number(formData.height)) || Number(formData.height) <= 0)) {
      alert('La altura debe ser un número válido'); return false;
    }
    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) <= 0)) {
      alert('El peso debe ser un número válido'); return false;
    }
    if (formData.dateOfBirth && !isValidDate(formData.dateOfBirth)) {
      alert('La fecha de nacimiento debe ser válida'); return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSave({
        name: formData.name.trim(),
        phone: formData.phone.trim() || undefined,
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.slice(0, 10) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        bloodType: formData.bloodType as any || undefined,
        medicalConditions: formData.medicalConditions.trim()
          ? formData.medicalConditions.split(',').map(c => c.trim()).filter(Boolean)
          : undefined,
        medications: formData.medications.trim()
          ? formData.medications.split(',').map(m => m.trim()).filter(Boolean)
          : undefined,
      });
      onClose();
    } catch (error) {
      logger.error('Error saving profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <SafeAreaView edges={['bottom']} style={{ flex: 1 }}>

            {/* Header */}
            <View style={styles.header}>
              <SpringButton onPress={onClose} style={{ padding: 4 }}>
                <Text style={styles.cancelHeaderText}>Cancelar</Text>
              </SpringButton>

              <ThemedText style={styles.headerTitle}>Editar Perfil</ThemedText>

              <Button
                title="Guardar"
                onPress={handleSave}
                variant="primary"
                style={{ backgroundColor: CommonColors.editProfileModalButtonPrimaryBg, width: 100 }}
              />
            </View>

            <ScrollView
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentInner}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >

              {/* Avatar */}
              <View style={styles.avatarSection}>
                <ProfileImage size={80} showEditButton={true} />
                <Text style={styles.avatarHint}>Toca la foto para cambiarla</Text>
              </View>

              {/* Información Personal */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Información Personal</ThemedText>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nombre *</Text>
                  <AnimatedInput
                    value={formData.name}
                    onChangeText={v => handleInputChange('name', v)}
                    placeholder="Ingresa tu nombre completo"
                    placeholderTextColor={CommonColors.editProfileModalPlaceholder}
                    primaryColor={primary} borderColor={border}
                    wrapStyle={styles.inputWrap} style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Teléfono</Text>
                  <AnimatedInput
                    value={formData.phone}
                    onChangeText={v => handleInputChange('phone', v)}
                    placeholder="+52 55 1234 5678"
                    placeholderTextColor={CommonColors.editProfileModalPlaceholder}
                    keyboardType="phone-pad"
                    primaryColor={primary} borderColor={border}
                    wrapStyle={styles.inputWrap} style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Fecha de Nacimiento</Text>
                  <SpringButton
                    onPress={() => setShowDatePicker(true)}
                    style={[styles.pickerTriggerWrap, { borderColor: border }]}
                  >
                    <View style={styles.pickerItem}>
                      <Text style={[styles.pickerItemText, !formData.dateOfBirth && { color: CommonColors.editProfileModalPlaceholder }]}>
                        {formData.dateOfBirth || 'Seleccionar fecha'}
                      </Text>
                      <IconSymbol name="calendar" size={16} color={CommonColors.black} />
                    </View>
                  </SpringButton>
                  <CalendarPicker
                    visible={showDatePicker}
                    value={formData.dateOfBirth}
                    onConfirm={iso => { handleInputChange('dateOfBirth', iso); setShowDatePicker(false); }}
                    onCancel={() => setShowDatePicker(false)}
                  />
                </View>
              </View>

              {/* Información Médica */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Información Médica</ThemedText>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Altura (cm)</Text>
                  <AnimatedInput
                    value={formData.height}
                    onChangeText={v => handleInputChange('height', v)}
                    placeholder="175"
                    placeholderTextColor={CommonColors.editProfileModalPlaceholder}
                    keyboardType="numeric"
                    primaryColor={primary} borderColor={border}
                    wrapStyle={styles.inputWrap} style={styles.input}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Peso (kg)</Text>
                  <AnimatedInput
                    value={formData.weight}
                    onChangeText={v => handleInputChange('weight', v)}
                    placeholder="70"
                    placeholderTextColor={CommonColors.editProfileModalPlaceholder}
                    keyboardType="numeric"
                    primaryColor={primary} borderColor={border}
                    wrapStyle={styles.inputWrap} style={styles.input}
                  />
                </View>

                {/* Blood type picker */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tipo de Sangre</Text>
                  <SpringButton
                    onPress={() => setShowBloodTypePicker(v => !v)}
                    style={[styles.pickerTriggerWrap, { borderColor: border }]}
                  >
                    <View style={styles.pickerItem}>
                      <Text style={styles.pickerItemText}>
                        {formData.bloodType || 'Seleccionar tipo de sangre'}
                      </Text>
                      <IconSymbol
                        name={showBloodTypePicker ? 'chevron.up' : 'chevron.down'}
                        size={16} color={CommonColors.black}
                      />
                    </View>
                  </SpringButton>

                  {showBloodTypePicker && (
                    <View style={[styles.pickerContainer, { marginTop: 4 }]}>
                      {BLOOD_TYPES.map(type => (
                        <BloodTypeItem
                          key={type}
                          type={type}
                          selected={formData.bloodType === type}
                          onPress={() => { handleInputChange('bloodType', type); setShowBloodTypePicker(false); }}
                          styles={styles}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>

              {/* Condiciones Médicas */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Condiciones Médicas</ThemedText>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Condiciones (separadas por comas)</Text>
                  <AnimatedInput
                    value={formData.medicalConditions}
                    onChangeText={v => handleInputChange('medicalConditions', v)}
                    placeholder="Hipertensión, Diabetes tipo 2, etc."
                    placeholderTextColor={CommonColors.editProfileModalPlaceholder}
                    multiline
                    primaryColor={primary} borderColor={border}
                    wrapStyle={styles.inputWrap}
                    style={[styles.input, styles.multilineInput]}
                  />
                </View>
              </View>

              {/* Medicamentos */}
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Medicamentos</ThemedText>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Medicamentos (separados por comas)</Text>
                  <AnimatedInput
                    value={formData.medications}
                    onChangeText={v => handleInputChange('medications', v)}
                    placeholder="Metformina 500mg, Losartán 50mg, etc."
                    placeholderTextColor={CommonColors.editProfileModalPlaceholder}
                    multiline
                    primaryColor={primary} borderColor={border}
                    wrapStyle={styles.inputWrap}
                    style={[styles.input, styles.multilineInput]}
                  />
                </View>
              </View>

            </ScrollView>

            {/* Bottom actions */}
            <View style={styles.actionsContainer}>
              <Button
                title="Cancelar"
                onPress={onClose}
                variant="outline"
                size="large"
                style={{ flex: 1 }}
              />
              <Button
                title={loading ? 'Guardando...' : 'Guardar'}
                onPress={handleSave}
                variant="primary"
                size="large"
                disabled={loading}
                style={{ flex: 1 }}
              />
            </View>

          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}
