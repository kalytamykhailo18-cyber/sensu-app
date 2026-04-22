/**
 * Device Configuration Types
 *
 * Types for the EV04 button device configuration endpoints:
 * fall detection, geofencing, battery alerts, and unified alerts.
 */

// Re-export common device types from watch.ts for convenience
export type { DeviceType, DeviceAssociation, EviewStatus, EviewLocation } from './watch';

// ─── Alert Types ──────────────────────────────────────────────────────────────

export type AlertType =
  | 'fall_detection'
  | 'sos'
  | 'geofence_exit'
  | 'geofence_enter'
  | 'battery_low'
  | 'button_press';

export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';

export interface DeviceAlert {
  id: number;
  device_id: string;
  event_type: AlertType | string;
  priority: AlertPriority;
  timestamp: string;
  message: string;
  latitude?: number | null;
  longitude?: number | null;
  battery?: number | null;
  metadata?: Record<string, any> | null;
}

export interface DeviceAlertsParams {
  device_id: string;
  event_type?: AlertType;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

// ─── Fall Detection ───────────────────────────────────────────────────────────

export interface FallDetectionConfig {
  enabled: boolean;
  sensitivity: number; // 1-9 (1=least sensitive, 9=most)
  dial: boolean; // Call SOS numbers on fall
  device_id: string;
}

export interface FallDetectionConfigRequest {
  enabled: boolean;
  sensitivity: number;
  dial: boolean;
}

// ─── Geofence ─────────────────────────────────────────────────────────────────

export type GeofenceDirection = 'in' | 'out' | 'both';

export interface GeofenceConfig {
  id?: number | null;
  device_id: string;
  zone_number: number; // 1-4
  name: string;
  enabled: boolean;
  shape: string; // 'circle'
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  direction: GeofenceDirection;
  detect_interval_seconds: number;
  synced_to_device: boolean;
  last_sync_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface GeofenceRequest {
  name: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  direction: GeofenceDirection;
  enabled: boolean;
  detect_interval_seconds: number;
}

// ─── Battery ──────────────────────────────────────────────────────────────────

export interface BatteryConfig {
  threshold: number; // 5-50 (percentage)
  device_id: string;
}

export interface BatteryConfigRequest {
  threshold: number;
}

// ─── Contacts ────────────────────────────────────────────────────────────────

export interface DeviceContact {
  index: number;       // 0-9 slot index
  number: string;      // phone number (digits, optional + prefix)
  enabled: boolean;
  call: boolean;       // device can dial this number
  sms: boolean;        // device accepts SMS from this number
  flag: number;
}

export interface DeviceContactsResponse {
  device_id: string;
  contacts: DeviceContact[];
}

export interface DeviceContactRequest {
  index: number;       // 0-9 slot
  number: string;      // phone number, max 20 chars, pattern: ^\+?\d+$
  enabled?: boolean;   // default true
  call?: boolean;      // default true
  sms?: boolean;       // default true
}
