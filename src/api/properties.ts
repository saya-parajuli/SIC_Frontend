import { client } from "@/api/client";

import type {
    Property,
    SmartMeter,
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

export async function getProperties() {
  const res = await client.get<Property[]>("/properties/");
  return res.data;
}

export async function deleteProperty(id: number) {
  await client.delete(`/properties/${id}/`);
}

export async function getMeters() {
  const res = await client.get<SmartMeter[]>("/properties/meters/");
  return res.data;
}

export async function deleteMeter(id: number) {
  await client.delete(`/properties/meters/${id}/`);
}