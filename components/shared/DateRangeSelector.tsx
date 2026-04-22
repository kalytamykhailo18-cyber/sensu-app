import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native";

export interface DateRange {
  startDate: Date | null;
  endDate: Date | null;
}

interface DateRangeSelectorProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  disabled?: boolean;
}

export function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  disabled = false,
}: DateRangeSelectorProps) {
  const theme = useAppTheme();
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [showQuickOptions, setShowQuickOptions] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date>(dateRange.startDate || new Date());
  const [tempEndDate, setTempEndDate] = useState<Date>(dateRange.endDate || new Date());

  const formatDate = (date: Date | null): string => {
    if (!date) return "Seleccionar";
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };


  const handleStartDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowStartPicker(false);
      if (selectedDate) {
        const newRange = { ...dateRange, startDate: selectedDate };
        // If end date is before start date, reset end date
        if (dateRange.endDate && selectedDate > dateRange.endDate) {
          newRange.endDate = selectedDate;
        }
        onDateRangeChange(newRange);
      }
    } else {
      // iOS: Update temp date
      if (selectedDate) {
        setTempStartDate(selectedDate);
      }
    }
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowEndPicker(false);
      if (selectedDate) {
        const newRange = { ...dateRange, endDate: selectedDate };
        // If start date is after end date, reset start date
        if (dateRange.startDate && selectedDate < dateRange.startDate) {
          newRange.startDate = selectedDate;
        }
        onDateRangeChange(newRange);
      }
    } else {
      // iOS: Update temp date
      if (selectedDate) {
        setTempEndDate(selectedDate);
      }
    }
  };

  const confirmStartDate = () => {
    const newRange = { ...dateRange, startDate: tempStartDate };
    // If end date is before start date, reset end date
    if (dateRange.endDate && tempStartDate > dateRange.endDate) {
      newRange.endDate = tempStartDate;
    }
    onDateRangeChange(newRange);
    setShowStartPicker(false);
  };

  const confirmEndDate = () => {
    const newRange = { ...dateRange, endDate: tempEndDate };
    // If start date is after end date, reset start date
    if (dateRange.startDate && tempEndDate < dateRange.startDate) {
      newRange.startDate = tempEndDate;
    }
    onDateRangeChange(newRange);
    setShowEndPicker(false);
  };

  const applyQuickOption = (option: string) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setDate(today.getDate() - 30);

    switch (option) {
      case "today":
        onDateRangeChange({ startDate: today, endDate: today });
        break;
      case "yesterday":
        onDateRangeChange({ startDate: yesterday, endDate: yesterday });
        break;
      case "last7days":
        onDateRangeChange({ startDate: lastWeek, endDate: today });
        break;
      case "last30days":
        onDateRangeChange({ startDate: lastMonth, endDate: today });
        break;
      case "clear":
        onDateRangeChange({ startDate: null, endDate: null });
        break;
    }
    setShowQuickOptions(false);
  };

  const getDateRangeStatus = (): string => {
    if (!dateRange.startDate && !dateRange.endDate) {
      return "Mostrando todas las fechas";
    }
    if (dateRange.startDate && dateRange.endDate) {
      const start = formatDate(dateRange.startDate);
      const end = formatDate(dateRange.endDate);
      if (start === end) {
        return `Mostrando alertas del ${start}`;
      }
      return `Mostrando alertas del ${start} al ${end}`;
    }
    if (dateRange.startDate) {
      return `Mostrando alertas desde ${formatDate(dateRange.startDate)}`;
    }
    if (dateRange.endDate) {
      return `Mostrando alertas hasta ${formatDate(dateRange.endDate)}`;
    }
    return "Mostrando todas las fechas";
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.secondaryBackground,
      borderRadius: 12,
      padding: 16,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      shadowColor: theme.colors.black,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: theme.isDark ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    headerText: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
    },
    quickOptionsButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    dateRangeContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    dateButton: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      borderWidth: 1,
      borderColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    },
    dateButtonPressed: {
      backgroundColor: theme.colors.primary + '20',
      borderColor: theme.colors.primary,
    },
    dateButtonText: {
      flex: 1,
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: "500",
    },
    dateButtonTextSelected: {
      color: theme.colors.primary,
      fontWeight: "600",
    },
    dateButtonLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    clearButton: {
      padding: 8,
      borderRadius: 6,
      backgroundColor: theme.colors.error + '20',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: "center",
      alignItems: "center",
    },
    quickOptionsModal: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 20,
      margin: 20,
      maxWidth: 300,
      width: "90%",
    },
    quickOptionsTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    quickOption: {
      padding: 16,
      borderRadius: 8,
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
      marginBottom: 8,
    },
    quickOptionText: {
      fontSize: 16,
      color: theme.colors.text,
      textAlign: "center",
    },
    quickOptionClear: {
      backgroundColor: theme.colors.error + '20',
    },
    quickOptionClearText: {
      color: theme.colors.error,
    },
    cancelButton: {
      padding: 16,
      marginTop: 8,
    },
    cancelButtonText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
    },
    iosPickerModal: {
      backgroundColor: theme.colors.background,
      borderRadius: 16,
      padding: 20,
      margin: 20,
      maxWidth: 350,
      width: "90%",
    },
    iosPickerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 16,
      textAlign: "center",
    },
    iosPickerButtons: {
      flexDirection: "row",
      justifyContent: "space-around",
      marginTop: 16,
      gap: 12,
    },
    iosPickerButton: {
      flex: 1,
      padding: 14,
      borderRadius: 8,
      alignItems: "center",
    },
    iosCancelButton: {
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    },
    iosConfirmButton: {
      backgroundColor: theme.colors.primary,
    },
    iosButtonText: {
      fontSize: 16,
      fontWeight: "600",
    },
    iosCancelText: {
      color: theme.colors.textSecondary,
    },
    iosConfirmText: {
      color: theme.colors.white,
    },
    statusText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      fontStyle: "italic",
      textAlign: "center",
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    },
    statusTextActive: {
      color: theme.colors.primary,
      fontWeight: "500",
    },
  });

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.headerText}>Rango de fechas</ThemedText>
        <TouchableOpacity
          style={styles.quickOptionsButton}
          onPress={() => setShowQuickOptions(true)}
          disabled={disabled}
        >
          <Ionicons
            name="options"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.dateRangeContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.dateButton,
            pressed && styles.dateButtonPressed,
            dateRange.startDate && { borderColor: theme.colors.primary + '40' },
          ]}
          onPress={() => {
            setTempStartDate(dateRange.startDate || new Date());
            setShowStartPicker(true);
          }}
          disabled={disabled}
        >
          <View>
            <ThemedText style={styles.dateButtonLabel}>Desde</ThemedText>
            <ThemedText style={[
              styles.dateButtonText,
              dateRange.startDate && styles.dateButtonTextSelected
            ]}>
              {formatDate(dateRange.startDate)}
            </ThemedText>
          </View>
          <Ionicons
            name="calendar"
            size={20}
            color={dateRange.startDate ? theme.colors.primary : theme.colors.textSecondary}
          />
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.dateButton,
            pressed && styles.dateButtonPressed,
            dateRange.endDate && { borderColor: theme.colors.primary + '40' },
          ]}
          onPress={() => {
            setTempEndDate(dateRange.endDate || new Date());
            setShowEndPicker(true);
          }}
          disabled={disabled}
        >
          <View>
            <ThemedText style={styles.dateButtonLabel}>Hasta</ThemedText>
            <ThemedText style={[
              styles.dateButtonText,
              dateRange.endDate && styles.dateButtonTextSelected
            ]}>
              {formatDate(dateRange.endDate)}
            </ThemedText>
          </View>
          <Ionicons
            name="calendar"
            size={20}
            color={dateRange.endDate ? theme.colors.primary : theme.colors.textSecondary}
          />
        </Pressable>

        {(dateRange.startDate || dateRange.endDate) && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => applyQuickOption("clear")}
            disabled={disabled}
          >
            <Ionicons
              name="close"
              size={20}
              color={theme.colors.error}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Text */}
      <ThemedText style={[
        styles.statusText,
        (dateRange.startDate || dateRange.endDate) && styles.statusTextActive
      ]}>
        {getDateRangeStatus()}
      </ThemedText>

      {/* Start Date Picker */}
      {showStartPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={dateRange.startDate || new Date()}
          mode="date"
          display="default"
          onChange={handleStartDateChange}
          maximumDate={dateRange.endDate || new Date()}
        />
      )}

      {/* End Date Picker */}
      {showEndPicker && Platform.OS === "android" && (
        <DateTimePicker
          value={dateRange.endDate || new Date()}
          mode="date"
          display="default"
          onChange={handleEndDateChange}
          minimumDate={dateRange.startDate || undefined}
          maximumDate={new Date()}
        />
      )}

      {/* iOS Date Picker Modal for Start Date */}
      {showStartPicker && Platform.OS === "ios" && (
        <Modal
          visible={showStartPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowStartPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowStartPicker(false)}
          >
            <View style={styles.iosPickerModal}>
              <ThemedText style={styles.iosPickerTitle}>
                Seleccionar fecha de inicio
              </ThemedText>

              <DateTimePicker
                value={tempStartDate}
                mode="date"
                display="spinner"
                onChange={handleStartDateChange}
                maximumDate={dateRange.endDate || new Date()}
              />

              <View style={styles.iosPickerButtons}>
                <TouchableOpacity
                  style={[styles.iosPickerButton, styles.iosCancelButton]}
                  onPress={() => setShowStartPicker(false)}
                >
                  <ThemedText style={[styles.iosButtonText, styles.iosCancelText]}>
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iosPickerButton, styles.iosConfirmButton]}
                  onPress={confirmStartDate}
                >
                  <ThemedText style={[styles.iosButtonText, styles.iosConfirmText]}>
                    Confirmar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* iOS Date Picker Modal for End Date */}
      {showEndPicker && Platform.OS === "ios" && (
        <Modal
          visible={showEndPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowEndPicker(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setShowEndPicker(false)}
          >
            <View style={styles.iosPickerModal}>
              <ThemedText style={styles.iosPickerTitle}>
                Seleccionar fecha de fin
              </ThemedText>

              <DateTimePicker
                value={tempEndDate}
                mode="date"
                display="spinner"
                onChange={handleEndDateChange}
                minimumDate={dateRange.startDate || undefined}
                maximumDate={new Date()}
              />

              <View style={styles.iosPickerButtons}>
                <TouchableOpacity
                  style={[styles.iosPickerButton, styles.iosCancelButton]}
                  onPress={() => setShowEndPicker(false)}
                >
                  <ThemedText style={[styles.iosButtonText, styles.iosCancelText]}>
                    Cancelar
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.iosPickerButton, styles.iosConfirmButton]}
                  onPress={confirmEndDate}
                >
                  <ThemedText style={[styles.iosButtonText, styles.iosConfirmText]}>
                    Confirmar
                  </ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Quick Options Modal */}
      <Modal
        visible={showQuickOptions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickOptions(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowQuickOptions(false)}
        >
          <View style={styles.quickOptionsModal}>
            <ThemedText style={styles.quickOptionsTitle}>
              Opciones rápidas
            </ThemedText>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => applyQuickOption("today")}
            >
              <ThemedText style={styles.quickOptionText}>Hoy</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => applyQuickOption("yesterday")}
            >
              <ThemedText style={styles.quickOptionText}>Ayer</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => applyQuickOption("last7days")}
            >
              <ThemedText style={styles.quickOptionText}>Últimos 7 días</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() => applyQuickOption("last30days")}
            >
              <ThemedText style={styles.quickOptionText}>Últimos 30 días</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickOption, styles.quickOptionClear]}
              onPress={() => applyQuickOption("clear")}
            >
              <ThemedText style={[styles.quickOptionText, styles.quickOptionClearText]}>
                Limpiar filtros
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowQuickOptions(false)}
            >
              <ThemedText style={styles.cancelButtonText}>Cancelar</ThemedText>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </ThemedView>
  );
}