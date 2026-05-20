import { client } from "@/api/client";

import type {
  PropertyPayload,
  PropertyResponse,
  SmartMeterPayload,
  SmartMeterResponse,
  OnboardingStatusResponse,
} from "@/types/properties";

export async function createProperty(
  payload: PropertyPayload
): Promise<PropertyResponse> {
  const response = await client.post("/properties/", payload);

  return response.data;
}

export async function createSmartMeter(
  payload: SmartMeterPayload
): Promise<SmartMeterResponse> {
  const response = await client.post("/properties/meters/", payload);

  return response.data;
}

export async function getOnboardingStatus(): Promise<OnboardingStatusResponse> {
  const response = await client.get("/properties/onboarding/");

  return response.data;
}