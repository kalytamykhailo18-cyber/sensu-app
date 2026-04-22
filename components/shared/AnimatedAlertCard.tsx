import { ThemedText } from "@/components/ThemedText";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

// Componente de alerta animada
export function AnimatedAlertCard({
    alert,
    onMarkAsRead,
    onDelete,
  }: {
    alert: any;
    onMarkAsRead?: (id: string) => void;
    onDelete?: (id: string) => void;
  }) {
  const theme = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  // Obtener título dinámico basado en el tipo de alarma
  const getAlertTitle = (type: string, priority: string) => {
    switch (type) {
      case 'sos': return 'Alerta SOS';
      case 'fall': return 'Detección de Caída';
      case 'geofence': return 'Alerta de Geocerca';
      case 'low_battery': return 'Batería Baja';
      case 'no_signal': return 'Reloj Sin Señal';
      case 'heart_rate': return 'Alerta de Frecuencia Cardíaca';
      case 'temperature': return 'Alerta de Temperatura';
      case 'emergency': return 'Emergencia';
      case 'medication': return 'Recordatorio de Medicamento';
      case 'appointment': return 'Cita Médica';
      case 'activity': return 'Alerta de Actividad';
      default: return 'Notificación del Reloj';
    }
  };

  // Obtener color basado en el tipo de alarma y prioridad
  const getAlertColor = (type: string, priority: string) => {
    switch (type) {
      case 'sos':
      case 'fall':
        return '#FF3B30'; // Rojo crítico
      case 'geofence':
        return '#FF9500'; // Naranja
      case 'heart_rate':
      case 'temperature':
        return '#FFCC02'; // Amarillo
      case 'low_battery':
      case 'no_signal':
        return '#007AFF'; // Azul
      default:
        switch (priority) {
          case "critical":
            return '#FF3B30';
          case "high":
            return '#FF9500';
          case "medium":
            return '#FFCC02';
          case "low":
            return '#007AFF';
          default:
            return '#FF3B30';
        }
    }
  };

  const styles = StyleSheet.create({
    alertCard: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      marginHorizontal: 0,
      marginBottom: 6,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: theme.colors.black,
      shadowOpacity: theme.isDark ? 0.2 : 0.05,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      overflow: "hidden",
      width: "100%",
    },
    unreadAlert: {
      borderLeftWidth: 4,
    },
    alertContent: {
      flexDirection: "row",
      alignItems: "flex-start",
      padding: 16,
    },
    alertLeft: {
      flexDirection: "row",
      flex: 1,
      alignItems: "flex-start",
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 12,
      marginTop: 0,
    },
    alertTextContainer: {
      flex: 1,
      paddingRight: 8,
    },
    alertTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
      lineHeight: 20,
    },
    alertMessage: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 18,
      marginBottom: 8,
    },
    alertMeta: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: 12,
    },
    timeText: {
      fontSize: 12,
      color: theme.colors.textTertiary,
      fontWeight: "500",
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
      minWidth: 45,
      alignItems: "center",
    },
    priorityText: {
      color: theme.colors.white,
      fontSize: 10,
      fontWeight: "700",
      letterSpacing: 0.3,
    },
    scheduledInfo: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: theme.isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: 6,
    },
    scheduledText: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      fontWeight: "500",
    },
  });
  
    const getTypeIcon = (type: string) => {
      switch (type) {
        case "sos":
          return "warning";
        case "fall":
          return "alert-circle";
        case "geofence":
          return "location";
        case "low_battery":
          return "battery-dead";
        case "no_signal":
          return "wifi";
        case "heart_rate":
          return "heart";
        case "temperature":
          return "thermometer";
        case "medication":
          return "medical";
        case "appointment":
          return "calendar";
        case "emergency":
          return "warning";
        case "activity":
          return "walk";
        default:
          return "notifications";
      }
    };
  
    return (
      <Animated.View
        style={[
          styles.alertCard,
          !alert.isRead && {
            ...styles.unreadAlert,
            borderLeftColor: getAlertColor(alert.type, alert.priority),
            backgroundColor: theme.isDark
              ? `${getAlertColor(alert.type, alert.priority)}15`
              : `${getAlertColor(alert.type, alert.priority)}08`,
          },
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.alertContent}>
          <View style={styles.alertLeft}>
            <View
              style={[
                styles.iconContainer,
                { backgroundColor: `${getAlertColor(alert.type, alert.priority)}20` },
              ]}
            >
              <Ionicons
                name={getTypeIcon(alert.type)}
                size={18}
                color={getAlertColor(alert.type, alert.priority)}
              />
            </View>
            <View style={styles.alertTextContainer}>
              <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
                {getAlertTitle(alert.type, alert.priority)}
              </ThemedText>
              <ThemedText style={styles.alertMessage} numberOfLines={2}>
                {alert.message}
              </ThemedText>
              <View style={styles.alertMeta}>
                <ThemedText style={styles.timeText}>
                  {new Date(alert.createdAt).toLocaleString()}
                </ThemedText>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getAlertColor(alert.type, alert.priority) },
                  ]}
                >
                  <ThemedText style={styles.priorityText}>
                    {alert.priority.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        </View>
        {alert.scheduledFor && (
          <View style={styles.scheduledInfo}>
            <Ionicons name="time" size={12} color={theme.colors.textTertiary} />
            <ThemedText style={styles.scheduledText}>
              Programado: {new Date(alert.scheduledFor).toLocaleString()}
            </ThemedText>
          </View>
        )}
      </Animated.View>
    );
  }