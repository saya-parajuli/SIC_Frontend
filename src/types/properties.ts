export type TariffPlan = "flat" | "tou" | "tiered";

export type MeterType = "main" | "solar" | "sub" | "ev" | "industrial";

export interface Property {
  id: number;
  name: string;
  property_type: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district?: string;
  province?: string;
  country?: string;
  postal_code?: string;
  timezone: string;
  tariff_plan: string;
}

export interface SmartMeter {
  id: number;
  property: number;
  property_name: string;
  mac_address: string;
  serial_no?: string;
  device_model?: string;
  label: string;
  meter_type: string;
  phase?: string;
  rated_capacity_kw?: number;
  is_active: boolean;
  is_verified: boolean;
}

export interface PropertyPayload {
  name: string;
  property_type?: string;

  address_line1: string;
  address_line2?: string;

  city: string;
  district?: string;
  province?: string;
  country?: string;
  postal_code?: string;

  govt_property_id?: string;
  utility_account_no?: string;
  consumer_no?: string;

  timezone: string;
  tariff_plan: TariffPlan;

  peak_rate?: number;
  flat_rate?: number;
  valley_rate?: number;
}

export interface PropertyResponse {
  id: number;
  name: string;
  owner_email: string;

  address_line1: string;
  city: string;

  timezone: string;
  tariff_plan: TariffPlan;

  created_at: string;
}

export interface SmartMeterPayload {
  property: number;

  mac_address: string;
  serial_no?: string;
  device_model?: string;

  label: string;

  meter_type: MeterType;

  phase?: string;
  rated_capacity_kw?: number;
}

export interface SmartMeterResponse {
  id: number;

  property: number;
  property_name: string;

  mac_address: string;
  label: string;

  meter_type: MeterType;

  is_active: boolean;
  is_verified: boolean;

  registered_at: string;
}

export interface OnboardingStatusResponse {
  step: 1 | 2 | 3;

  has_property: boolean;
  has_meter: boolean;

  message: string;

  property: {
    id: number;
    name: string;
    address: string;
    city: string;
    tariff_plan: string;
  } | null;
}

export interface PropertyValidationErrors {
  name?: string;
  address_line1?: string;
  city?: string;
}

export interface MeterValidationErrors {
  mac_address?: string;
  label?: string;
}