// Mock JSON-style data for Smart Load Forecasting & Demand Response
// In production, this would come from a Django REST API.

export type Role = "admin" | "user";

export interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string; // demo only
  role: Role;
  meterId: string;
  joined: string;
}

export const mockUsers: MockUser[] = [
  { id: "u1", name: "Alice Smith",   email: "alice@demo.io",  password: "alice123",  role: "user",  meterId: "SM-1001", joined: "2024-11-02" },
  { id: "u2", name: "Bob Johnson",   email: "bob@demo.io",    password: "bob12345",  role: "user",  meterId: "SM-1002", joined: "2025-01-15" },
  { id: "u3", name: "Carol Davis",   email: "carol@demo.io",  password: "carol123",  role: "user",  meterId: "SM-1003", joined: "2025-02-20" },
  { id: "u4", name: "David Lee",     email: "david@demo.io",  password: "david123",  role: "user",  meterId: "SM-1004", joined: "2025-03-08" },
  { id: "a1", name: "Admin User",    email: "admin@demo.io",  password: "admin123",  role: "admin", meterId: "SM-0000", joined: "2024-01-01" },
];

const RATE = 0.18; // $/kWh

function seedRand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export interface DailyPoint { date: string; kwh: number; cost: number; }
export interface HourlyPoint { hour: string; kwh: number; forecast: number; }

export function getDailyConsumption(userId: string, days = 90): DailyPoint[] {
  const rand = seedRand(userId.charCodeAt(1) * 17 + 31);
  const today = new Date();
  const out: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const base = 18 + rand() * 14;
    const weekendBoost = [0, 6].includes(d.getDay()) ? 4 : 0;
    const kwh = +(base + weekendBoost).toFixed(2);
    out.push({ date: d.toISOString().slice(0, 10), kwh, cost: +(kwh * RATE).toFixed(2) });
  }
  return out;
}

export function getHourlyForecast(userId: string): HourlyPoint[] {
  const rand = seedRand(userId.charCodeAt(1) * 7 + 3);
  const out: HourlyPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const base = 0.4 + Math.sin((h / 24) * Math.PI * 2 - 1) * 0.3 + rand() * 0.2;
    const actual = Math.max(0.1, base + (rand() - 0.5) * 0.15);
    const forecast = Math.max(0.1, base + (rand() - 0.5) * 0.05);
    out.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      kwh: +actual.toFixed(2),
      forecast: +forecast.toFixed(2),
    });
  }
  return out;
}

export interface Notification {
  id: string;
  type: "alert" | "info" | "savings" | "dr";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export function getNotifications(userId: string): Notification[] {
  const base: Omit<Notification, "id">[] = [
    { type: "alert",   title: "Peak hour alert",          message: "Grid peak 6–9 PM today. Shift heavy loads to save ~12%.", time: "2h ago",  read: false },
    { type: "dr",      title: "Demand Response event",    message: "Reduce HVAC by 2°C between 7–8 PM for a $3.20 credit.",   time: "5h ago",  read: false },
    { type: "savings", title: "Weekly savings",           message: "You saved $4.85 vs last week. Nice work!",                 time: "1d ago",  read: true  },
    { type: "info",    title: "Forecast updated",         message: "Tomorrow's forecast: 24.6 kWh (±1.2).",                    time: "1d ago",  read: true  },
    { type: "alert",   title: "Unusual consumption",      message: "Consumption 28% above your weekday average at 03:00.",     time: "3d ago",  read: true  },
  ];
  return base.map((n, i) => ({ ...n, id: `${userId}-n${i}` }));
}

export interface UserSummary {
  userId: string;
  name: string;
  email: string;
  meterId: string;
  monthKwh: number;
  monthCost: number;
  savings: number;
  predictedNextMonthCost: number;
  drParticipation: number; // %
}

export function getUserSummary(userId: string): UserSummary {
  const u = mockUsers.find((x) => x.id === userId)!;
  const daily = getDailyConsumption(userId, 30);
  const monthKwh = +daily.reduce((a, b) => a + b.kwh, 0).toFixed(2);
  const monthCost = +(monthKwh * RATE).toFixed(2);
  const prev = getDailyConsumption(userId, 60).slice(0, 30).reduce((a, b) => a + b.kwh, 0) * RATE;
  const savings = +Math.max(0, prev - monthCost).toFixed(2);
  const trend = daily.slice(-7).reduce((a, b) => a + b.kwh, 0) / 7;
  const predictedNextMonthCost = +(trend * 30 * RATE).toFixed(2);
  const rand = seedRand(userId.charCodeAt(1) * 13);
  return {
    userId,
    name: u.name,
    email: u.email,
    meterId: u.meterId,
    monthKwh,
    monthCost,
    savings,
    predictedNextMonthCost,
    drParticipation: Math.round(50 + rand() * 45),
  };
}

export function getAllUserSummaries(): UserSummary[] {
  return mockUsers.filter((u) => u.role === "user").map((u) => getUserSummary(u.id));
}

// ----- Per-meter data (seeded by MAC ID) -----

function meterSeed(macId: string): number {
  let h = 0;
  for (let i = 0; i < macId.length; i++) h = (h * 31 + macId.charCodeAt(i)) >>> 0;
  return (h % 1000) + 1;
}

export function getMeterDaily(macId: string, days = 90): DailyPoint[] {
  const rand = seedRand(meterSeed(macId));
  const today = new Date();
  const out: DailyPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(today.getDate() - i);
    const base = 12 + rand() * 18;
    const weekendBoost = [0, 6].includes(d.getDay()) ? 3 + rand() * 3 : 0;
    const kwh = +(base + weekendBoost).toFixed(2);
    out.push({ date: d.toISOString().slice(0, 10), kwh, cost: +(kwh * RATE).toFixed(2) });
  }
  return out;
}

export function getMeterHourly(macId: string): HourlyPoint[] {
  const rand = seedRand(meterSeed(macId) + 7);
  const out: HourlyPoint[] = [];
  for (let h = 0; h < 24; h++) {
    const base = 0.5 + Math.sin((h / 24) * Math.PI * 2 - 1) * 0.35 + rand() * 0.25;
    const actual = Math.max(0.1, base + (rand() - 0.5) * 0.18);
    const forecast = Math.max(0.1, base + (rand() - 0.5) * 0.06);
    out.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      kwh: +actual.toFixed(2),
      forecast: +forecast.toFixed(2),
    });
  }
  return out;
}

export interface ApplianceShare { name: string; kwh: number; pct: number; }

export function getApplianceBreakdown(macId: string, totalKwh: number): ApplianceShare[] {
  const rand = seedRand(meterSeed(macId) + 13);
  // Typical residential disaggregation weights (rough industry averages)
  const cats = [
    { name: "HVAC",          w: 0.32 + (rand() - 0.5) * 0.08 },
    { name: "Water heater",  w: 0.14 + (rand() - 0.5) * 0.05 },
    { name: "Refrigeration", w: 0.10 + (rand() - 0.5) * 0.03 },
    { name: "Lighting",      w: 0.09 + (rand() - 0.5) * 0.03 },
    { name: "Laundry",       w: 0.08 + (rand() - 0.5) * 0.03 },
    { name: "Cooking",       w: 0.07 + (rand() - 0.5) * 0.03 },
    { name: "Electronics",   w: 0.10 + (rand() - 0.5) * 0.03 },
    { name: "Always-on",     w: 0.10 + (rand() - 0.5) * 0.03 },
  ];
  const sumW = cats.reduce((a, c) => a + c.w, 0);
  return cats
    .map((c) => {
      const pct = +(c.w / sumW * 100).toFixed(1);
      return { name: c.name, kwh: +(totalKwh * (c.w / sumW)).toFixed(1), pct };
    })
    .sort((a, b) => b.kwh - a.kwh);
}

export interface HeatPoint { day: number; hour: number; kwh: number; }
// day: 0=Mon..6=Sun, hour: 0..23
export function getHeatmap(macId: string): HeatPoint[] {
  const rand = seedRand(meterSeed(macId) + 23);
  const out: HeatPoint[] = [];
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const morningPeak = Math.exp(-Math.pow((h - 7.5) / 2.2, 2)) * 1.4;
      const eveningPeak = Math.exp(-Math.pow((h - 19) / 2.5, 2)) * 1.9;
      const weekendBoost = d >= 5 ? 0.4 : 0;
      const base = 0.35 + morningPeak + eveningPeak + weekendBoost + rand() * 0.25;
      out.push({ day: d, hour: h, kwh: +base.toFixed(2) });
    }
  }
  return out;
}

export function aggregateDaily(series: DailyPoint[][]): DailyPoint[] {
  const map = new Map<string, { kwh: number; cost: number }>();
  series.forEach((s) =>
    s.forEach((d) => {
      const cur = map.get(d.date) ?? { kwh: 0, cost: 0 };
      map.set(d.date, { kwh: cur.kwh + d.kwh, cost: cur.cost + d.cost });
    }),
  );
  return [...map.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, v]) => ({ date, kwh: +v.kwh.toFixed(2), cost: +v.cost.toFixed(2) }));
}

export function aggregateHourly(series: HourlyPoint[][]): HourlyPoint[] {
  if (!series.length) return [];
  const out: HourlyPoint[] = [];
  for (let h = 0; h < 24; h++) {
    let kwh = 0, fc = 0;
    series.forEach((s) => { kwh += s[h]?.kwh ?? 0; fc += s[h]?.forecast ?? 0; });
    out.push({ hour: `${String(h).padStart(2, "0")}:00`, kwh: +kwh.toFixed(2), forecast: +fc.toFixed(2) });
  }
  return out;
}

export const RATE_PER_KWH = RATE;