import { useState } from "react";

import {
  createProperty,
  createSmartMeter,
  getOnboardingStatus,
} from "@/api/properties";

import type {
  PropertyPayload,
  SmartMeterPayload,
  PropertyValidationErrors,
  MeterValidationErrors,
} from "@/types/properties";

export function useProperty() {
  const [loading, setLoading] = useState(false);

  async function addProperty(payload: PropertyPayload) {
    const errors: PropertyValidationErrors = {};

    if (!payload.name.trim()) {
      errors.name = "Property name is required";
    }

    if (!payload.address_line1.trim()) {
      errors.address_line1 = "Address is required";
    }

    if (!payload.city.trim()) {
      errors.city = "City is required";
    }

    if (Object.keys(errors).length > 0) {
      throw errors;
    }

    setLoading(true);

    try {
      return await createProperty(payload);
    } finally {
      setLoading(false);
    }
  }

  async function addMeter(payload: SmartMeterPayload) {
    const errors: MeterValidationErrors = {};

    const macRegex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;

    if (!payload.mac_address.trim()) {
      errors.mac_address = "MAC address is required";
    } else if (!macRegex.test(payload.mac_address)) {
      errors.mac_address = "Invalid MAC address";
    }

    if (!payload.label.trim()) {
      errors.label = "Meter label is required";
    }

    if (Object.keys(errors).length > 0) {
      throw errors;
    }

    setLoading(true);

    try {
      return await createSmartMeter(payload);
    } finally {
      setLoading(false);
    }
  }

  async function onboardingStatus() {
    return await getOnboardingStatus();
  }

  return {
    loading,

    addProperty,
    addMeter,
    onboardingStatus,
  };
}