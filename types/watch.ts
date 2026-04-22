// Tipos para la respuesta completa del API del reloj
export interface WatchApiResponse {
  // Campos opcionales para compatibilidad con respuestas completas
  session?: {
    imei: string;
    address: [string, number];
    last_seen: string;
    connected: boolean;
  };
  device?: {
    status: string;
    last_seen: string;
    last_location: WatchLocationResponse;
  };
  last_alarm?: WatchAlarmResponse;
  fall_detection_config?: any | null;

  // Métricas directamente en el nivel raíz
  health?: {
    raw: string;
    received_at: string;
    systolic: string;
    diastolic: string;
    spo2: string;
    blood_sugar: string;
    temperature: string;
  };
  blood_pressure?: {
    systolic: string;
    diastolic: string;
    received_at: string;
  };
  blood_oxygen?: {
    spo2: string;
    received_at: string;
  };
  blood_sugar?: {
    mg_dL: string;
    received_at: string;
  };
  temperature?: {
    celsius: string;
    battery: string;
    received_at: string;
  };
  heart_rate?: {
    value: string;
    received_at: string;
  };
  alarm_events?: {
    total_count: number;
    last_event: string;
    last_type: string;
  };
}

// Tipos para la respuesta de ubicación del API
export interface WatchLocationResponse {
  raw: string;
  received_at: string;
  parsed: {
    raw: string;
    valid: boolean;
    date: string;
    time_utc: string;
    timestamp_utc: string | null;
    latitude: number;
    longitude: number;
    lat_ddmm: string;
    lon_ddmm: string;
    speed_kmh: number;
    direction_deg: number;
    status: {
      gsm_signal: number;
      satellites: number;
      battery: number;
      remaining_space: number;
      fortification_state: number;
      working_mode: number;
    };
    lbs: {
      mcc: number;
      mnc: number;
      lac: number;
      cid: number;
    };
    wifi: Array<{
      ssid: string | null;
      mac: string;
      rssi: number;
    }>;
  };
}

// Tipos para la respuesta de alarma del API
export interface WatchAlarmResponse {
  raw: string;
  received_at: string;
  parsed: {
    raw: string;
    alarm_type: string;
    alarm_description: string;
    latitude: number;
    longitude: number;
    speed_kmh: number;
    direction_deg: number;
    gsm_signal: number;
    satellites: number;
    battery_level: number;
    remaining_space: number;
    fortification_state: number;
    working_mode: number;
    mcc: number;
    mnc: number;
    lac: number;
    cid: number;
    language: string;
    reply_flags: string;
    wifi_data: any[];
    location_raw: string;
    device_status: {
      gsm_signal: number;
      satellites: number;
      battery: number;
      remaining_space: number;
      fortification_state: number;
      working_mode: number;
    };
    is_fall_detection: boolean;
    parse_error: boolean;
  };
  is_fall_detection: boolean;
}

// Tipo simplificado para usar en la aplicación
export interface WatchLocation {
  latitude: number;
  longitude: number;
  timestamp: string;
  battery: number;
  satellites: number;
  gsm_signal: number;
  speed_kmh: number;
  direction_deg: number;
}

// Tipo para los parámetros de la solicitud
export interface WatchLocationParams {
  imeiCode: string;
  serverUrl: string;
}

// Tipo para los parámetros de alertas con paginación
export interface WatchAlertsParams extends Partial<WatchLocationParams> {
  limit?: number;
  offset?: number;
  start_date?: string; // YYYY-MM-DD format
  end_date?: string;   // YYYY-MM-DD format
}

// Tipos para comandos del reloj
export interface SendCommandRequest {
  command: string;
  params?: string | null;
}

export interface RawCommandRequest {
  payload: string;
}

export interface CommandResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface CommandParams {
  imeiCode?: string;
  serverUrl?: string;
}

// Tipos para métricas de salud del reloj
export interface WatchMetrics {
  heartRate?: {
    current: number;
    resting: number;
    max: number;
    zone: 'rest' | 'fat_burn' | 'cardio' | 'peak';
    timestamp: string;
  };
  oxygen?: {
    saturation: number;
    timestamp: string;
  };
  temperature?: {
    body: number;
    ambient: number;
    timestamp: string;
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    timestamp: string;
  };
  bloodSugar?: {
    level: number;
    timestamp: string;
  };
  activity?: {
    steps: number;
    calories: number;
    distance: number;
    timestamp: string;
  };
  battery: {
    level: number;
    charging: boolean;
    timestamp: string;
  };
  lastUpdate: string;
}

// Tipos para eventos de caída
export interface FallEvent {
  id: string;
  imei: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'detected' | 'confirmed' | 'false_alarm' | 'resolved';
  battery: number;
  gsm_signal: number;
  satellites: number;
}

// Tipos para alertas del reloj
export interface WatchAlarm {
  id: string;
  imei: string;
  type: 'sos' | 'fall' | 'low_battery' | 'no_signal' | 'geofence' | 'heart_rate' | 'temperature';
  status: 'active' | 'inactive' | 'acknowledged' | 'resolved';
  timestamp: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
  };
}

// Tipos para estado del reloj
export interface WatchStatus {
  imei: string;
  online: boolean;
  lastSeen: string;
  battery: number;
  gsm_signal: number;
  satellites: number;
  working_mode: number;
  fortification_state: number;
  location?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

// Tipos para estadísticas de eventos
export interface FallEventStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  lastEvent?: string;
}

// Tipos para gestión de dispositivos del usuario
export interface WatchAssociation {
  imei: string;
  label?: string | null;
  linked_at: string;
  updated_at: string;
}

export interface LinkWatchRequest {
  imei: string;
  label?: string | null;
}

export interface UnlinkWatchResponse {
  detail: string;
}

// Tipos para configuración de scheduler
export interface SchedulerStatus {
  running: boolean;
  config: {
    test_interval_seconds: number;
    auto_test_interval_minutes: number;
    enabled_tests: string[];
    auto_configure_on_login: boolean;
  };
  active_devices: number;
  last_test_times: Record<string, string>;
}

export interface SchedulerConfigRequest {
  test_interval_seconds?: number;
  auto_test_interval_minutes?: number;
  enabled_tests?: string[];
  auto_configure_on_login?: boolean;
}

// Tipos para modos de trabajo
export interface WorkingModeRequest {
  mode: 1 | 2 | 3; // 1=normal (15min), 2=power-saving (60min), 3=emergency (1min)
}

export interface CustomModeRequest {
  interval_seconds: number; // minimum 30
  gps_enabled?: boolean;
}

// Tipos para recordatorios
export interface ReminderItem {
  time: string; // HH:MM format
  days?: string; // Days of week (1=Mon, 7=Sun), default "1234567"
  enabled?: boolean; // default true
  type?: 1 | 2 | 3; // 1=medicine, 2=water, 3=sedentary, default 1
}

export interface RemindersRequest {
  reminders: ReminderItem[]; // min 1, max 10
}

// Tipos para calibración de presión arterial
export interface BPCalibrationRequest {
  systolic: number; // 60-250 mmHg
  diastolic: number; // 40-150 mmHg
  age: number; // 1-120 years
  is_male: boolean; // True for male, False for female
}

// Tipos para configuración de detección de caídas
export interface FallDetectionConfig {
  enabled: boolean;
  sensitivity: number;
}

// Tipos para tests de salud
export type HealthTestType = 'heart_rate' | 'blood_pressure' | 'temperature' | 'blood_oxygen';

// Tipos adicionales para respuestas de la API
export interface WatchSession {
  imei: string;
  address: [string, number];
  last_seen: string;
  connected: boolean;
}

export interface ListWatchesResponse {
  sessions: WatchSession[];
  devices: {
    [key: string]: {
      status: string;
      last_seen: string;
      last_location?: WatchLocationResponse;
    };
  };
}

// ============================================
// Eview Personal Alarm Button Types
// ============================================

// Tipos de botones del dispositivo Eview
export type EviewButtonType =
  | 'SOS Button'
  | 'Side Call Button 1'
  | 'Side Call Button 2'
  | 'SOS Ending'
  | 'SOS Stop';

// Tipos de dispositivos soportados
// El API acepta 'eview_button' pero normaliza y retorna 'PENDANT'
export type DeviceType = 'watch' | 'eview_button' | 'PENDANT';

// Asociación genérica de dispositivo (soporta watch y eview)
export interface DeviceAssociation {
  device_id: string;
  device_type: DeviceType;
  label?: string | null;
  product_id?: string | null;
  linked_at: string;
  updated_at: string;
}

// Request para vincular un dispositivo genérico
export interface LinkDeviceRequest {
  device_id: string;
  device_type: DeviceType;
  label?: string | null;
  product_id?: string | null;
}

// Estado del dispositivo Eview
export interface EviewStatus {
  device_id: string;
  device_name?: string;
  online: boolean;
  battery?: number;
  is_charging?: boolean;
  latitude?: number;
  longitude?: number;
  accuracy_meters?: number;
  is_gps?: boolean;
  is_wifi?: boolean;
  is_gsm?: boolean;
  is_motion?: boolean;
  work_mode?: number;
  signal_strength?: number;
  last_event_type?: string;
  last_event_time?: string;
}

// Evento del dispositivo Eview
export interface EviewEvent {
  id: number;
  device_id: string;
  event_type: string;
  timestamp: string;
  device_name?: string;
  battery?: number;
  latitude?: number;
  longitude?: number;
  accuracy_meters?: number;
  is_gps?: boolean;
  is_wifi?: boolean;
  is_gsm?: boolean;
  is_motion?: boolean;
  is_charging?: boolean;
  work_mode?: number;
  signal_strength?: number;
  button_type?: EviewButtonType;
  processed_at: string;
}

// Evento de presión de botón Eview
export interface EviewButtonPressEvent {
  id: number;
  device_id: string;
  button_type: EviewButtonType;
  timestamp: string;
  device_name?: string;
  battery?: number;
  latitude?: number;
  longitude?: number;
  accuracy_meters?: number;
}

// Ubicación del dispositivo Eview
export interface EviewLocation {
  device_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters?: number;
  timestamp: string;
  is_gps?: boolean;
  is_wifi?: boolean;
  is_gsm?: boolean;
  battery?: number;
}

// Estado del servicio MQTT
export interface EviewMQTTStatus {
  connected: boolean;
  running: boolean;
  broker: string;
  client_id: string;
  product_id: string;
  monitored_devices: string[];
  monitored_device_count: number;
}

// Parámetros para consultar eventos Eview
export interface EviewEventsParams {
  device_id: string;
  limit?: number;
  offset?: number;
  event_type?: string;
}

// Parámetros para consultar eventos de botón
export interface EviewButtonEventsParams {
  device_id?: string;
  limit?: number;
  offset?: number;
}

// Alarma unificada que soporta tanto watch como eview
export interface UnifiedAlarm {
  id: string;
  device_id: string;
  device_type: DeviceType;
  device_name?: string;
  type: 'sos' | 'fall' | 'low_battery' | 'no_signal' | 'geofence' | 'heart_rate' | 'temperature' | 'button_press';
  button_type?: EviewButtonType;
  status: 'active' | 'inactive' | 'acknowledged' | 'resolved';
  timestamp: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: {
    latitude: number;
    longitude: number;
    accuracy_meters?: number;
  };
  battery?: number;
}
