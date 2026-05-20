// Smart Meter & Home registry — localStorage backed per-user store.
// Industry pattern: User → Homes (sites/premises) → Meters (MAC ID).

import { useEffect, useState } from "react";

export type TariffPlan = "flat" | "tou" | "tiered";

export interface Home {
  id: string;
  name: string;          // "Main residence"
  address: string;       // "221B Baker St"
  timezone: string;      // "America/New_York"
  tariff: TariffPlan;
  createdAt: string;
}

export interface Meter {
  id: string;
  homeId: string;
  macId: string;         // canonical: AA:BB:CC:DD:EE:FF
  label: string;         // "Main", "Solar export", "EV sub-meter"
  type: "main" | "solar" | "sub" | "ev";
  installedAt: string;
}

interface Store {
  homes: Home[];
  meters: Meter[];
}

const KEY = (userId: string) => `slf_meters_${userId}`;

function read(userId: string): Store {
  if (typeof window === "undefined") return { homes: [], meters: [] };
  try {
    const raw = window.localStorage.getItem(KEY(userId));
    return raw ? JSON.parse(raw) : { homes: [], meters: [] };
  } catch {
    return { homes: [], meters: [] };
  }
}

function write(userId: string, s: Store) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY(userId), JSON.stringify(s));
  window.dispatchEvent(new Event("meters-change"));
}

export const MAC_RE = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;

export function normalizeMac(input: string): string {
  return input.trim().toUpperCase().replace(/[-\s]/g, ":");
}

export function isValidMac(input: string): boolean {
  return MAC_RE.test(normalizeMac(input));
}

export function getHomes(userId: string): Home[] {
  return read(userId).homes;
}

export function getMeters(userId: string, homeId?: string): Meter[] {
  const all = read(userId).meters;
  return homeId ? all.filter((m) => m.homeId === homeId) : all;
}

export function addHome(userId: string, h: Omit<Home, "id" | "createdAt">): Home {
  const s = read(userId);
  const home: Home = { ...h, id: `home_${Date.now()}`, createdAt: new Date().toISOString() };
  s.homes.push(home);
  write(userId, s);
  return home;
}

export function addMeter(userId: string, m: Omit<Meter, "id" | "installedAt" | "macId"> & { macId: string }): Meter {
  const s = read(userId);
  const mac = normalizeMac(m.macId);
  if (!isValidMac(mac)) throw new Error("Invalid MAC ID. Expected format AA:BB:CC:DD:EE:FF");
  if (s.meters.some((x) => x.macId === mac)) throw new Error("This MAC ID is already registered");
  const meter: Meter = {
    id: `mtr_${Date.now()}`,
    homeId: m.homeId,
    macId: mac,
    label: m.label,
    type: m.type,
    installedAt: new Date().toISOString(),
  };
  s.meters.push(meter);
  write(userId, s);
  return meter;
}

export function removeMeter(userId: string, meterId: string) {
  const s = read(userId);
  s.meters = s.meters.filter((m) => m.id !== meterId);
  write(userId, s);
}

export function removeHome(userId: string, homeId: string) {
  const s = read(userId);
  s.homes = s.homes.filter((h) => h.id !== homeId);
  s.meters = s.meters.filter((m) => m.homeId !== homeId);
  write(userId, s);
}

export function useMeterStore(userId: string | undefined) {
  const [store, setStore] = useState<Store>(() =>
    userId ? read(userId) : { homes: [], meters: [] },
  );
  useEffect(() => {
    if (!userId) return;
    const sync = () => setStore(read(userId));
    sync();
    window.addEventListener("meters-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("meters-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, [userId]);
  return store;
}
