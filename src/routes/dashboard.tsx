import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Bolt, TrendingDown, TrendingUp, DollarSign, Activity, BellRing,
  AlertTriangle, Sparkles, Zap, CheckCircle2,
} from "lucide-react";
import {
  getDailyConsumption, getHourlyForecast, getNotifications, getUserSummary, RATE_PER_KWH,
} from "@/data/mockData";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SmartLoad DR" }] }),
  component: Dashboard,
});

function Dashboard() {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === null) navigate({ to: "/login" });
    else if (session.role === "admin") navigate({ to: "/admin" });
  }, [session, navigate]);

  const userId = session?.userId ?? "u1";
  const summary = useMemo(() => getUserSummary(userId), [userId]);
  const daily = useMemo(() => getDailyConsumption(userId, 90), [userId]);
  const hourly = useMemo(() => getHourlyForecast(userId), [userId]);
  const notifications = useMemo(() => getNotifications(userId), [userId]);

  if (!session || session.role === "admin") return null;

  const week = daily.slice(-7);
  const month = daily.slice(-30);
  const year = daily;

  const trendDelta = (() => {
    const last7 = week.reduce((a, b) => a + b.kwh, 0) / 7;
    const prev7 = daily.slice(-14, -7).reduce((a, b) => a + b.kwh, 0) / 7;
    return ((last7 - prev7) / prev7) * 100;
  })();

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {session.first_name} 👋</h1>
            <p className="text-sm text-muted-foreground">
              Meter <code>{summary.meterId}</code> · Live forecast & DR insights
            </p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> Live
          </Badge>
        </div>

        {/* KPI cards */}
        <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            icon={Activity} label="This month"
            value={`${summary.monthKwh} kWh`}
            sub={`$${summary.monthCost.toFixed(2)} at $${RATE_PER_KWH}/kWh`}
            tone="default"
          />
          <KpiCard
            icon={TrendingDown} label="Savings vs last month"
            value={`$${summary.savings.toFixed(2)}`}
            sub={summary.savings > 0 ? "You're trending down 🎉" : "About the same"}
            tone="good"
          />
          <KpiCard
            icon={Sparkles} label="Predicted next bill"
            value={`$${summary.predictedNextMonthCost.toFixed(2)}`}
            sub="Based on rolling 7-day avg"
            tone="default"
          />
          <KpiCard
            icon={Zap} label="DR participation"
            value={`${summary.drParticipation}%`}
            sub="Last 30 days"
            tone="info"
            progress={summary.drParticipation}
          />
        </div>

        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Live forecast vs actual (24h)</CardTitle>
                <Badge variant="outline" className="gap-1">
                  {trendDelta >= 0 ? <TrendingUp className="h-3 w-3 text-orange-500" /> : <TrendingDown className="h-3 w-3 text-green-600" />}
                  {trendDelta.toFixed(1)}% vs last week
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={hourly}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="hour" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="kwh" name="Actual" stroke="var(--color-chart-1)" fill="url(#g1)" />
                  <Area type="monotone" dataKey="forecast" name="Forecast" stroke="var(--color-chart-2)" fill="url(#g2)" strokeDasharray="4 2" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BellRing className="h-4 w-4" /> Notifications
                <Badge variant="destructive" className="ml-auto">{notifications.filter(n => !n.read).length} new</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.slice(0, 5).map((n) => (
                <NotificationItem key={n.id} n={n} />
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Consumption analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="week">
              <TabsList>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="year">90 days</TabsTrigger>
              </TabsList>
              <TabsContent value="week">
                <PeriodChart data={week} type="bar" />
                <PeriodSummary data={week} label="this week" />
              </TabsContent>
              <TabsContent value="month">
                <PeriodChart data={month} type="line" />
                <PeriodSummary data={month} label="this month" />
              </TabsContent>
              <TabsContent value="year">
                <PeriodChart data={year} type="area" />
                <PeriodSummary data={year} label="last 90 days" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bolt className="h-4 w-4" /> AI optimization tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Tip text="Shift dishwasher to 11 PM — predicted ~$2.10/mo savings." />
              <Tip text="Reduce HVAC by 1°C during 6–9 PM peak window." />
              <Tip text="Pre-cool home before 5 PM to leverage off-peak rates." />
              <Tip text="Charge EV between 1–5 AM to maximize DR credits." />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4" /> Cost breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={month.slice(-14)}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={10} tickFormatter={(d) => d.slice(5)} />
                  <YAxis fontSize={11} />
                  <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Bar dataKey="cost" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </SiteLayout>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone, progress }: {
  icon: any; label: string; value: string; sub: string;
  tone?: "default" | "good" | "warn" | "info"; progress?: number;
}) {
  const toneCls = {
    default: "bg-primary/10 text-primary",
    good: "bg-green-500/10 text-green-600",
    warn: "bg-orange-500/10 text-orange-600",
    info: "bg-blue-500/10 text-blue-600",
  }[tone ?? "default"];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneCls}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        {typeof progress === "number" && <Progress value={progress} className="mt-3 h-1.5" />}
      </CardContent>
    </Card>
  );
}

function NotificationItem({ n }: { n: ReturnType<typeof getNotifications>[number] }) {
  const map = {
    alert:   { icon: AlertTriangle, cls: "text-orange-600 bg-orange-500/10" },
    info:    { icon: BellRing,      cls: "text-blue-600 bg-blue-500/10" },
    savings: { icon: TrendingDown,  cls: "text-green-600 bg-green-500/10" },
    dr:      { icon: Zap,           cls: "text-purple-600 bg-purple-500/10" },
  } as const;
  const { icon: Icon, cls } = map[n.type];
  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${cls}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium">{n.title}</p>
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        <p className="text-xs text-muted-foreground">{n.message}</p>
        <p className="mt-1 text-[10px] uppercase text-muted-foreground">{n.time}</p>
      </div>
    </div>
  );
}

function PeriodChart({ data, type }: { data: { date: string; kwh: number; cost: number }[]; type: "bar" | "line" | "area" }) {
  const fmt = (d: string) => d.slice(5);
  return (
    <ResponsiveContainer width="100%" height={260}>
      {type === "bar" ? (
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tickFormatter={fmt} fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
          <Bar dataKey="kwh" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
        </BarChart>
      ) : type === "line" ? (
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tickFormatter={fmt} fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
          <Line dataKey="kwh" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
        </LineChart>
      ) : (
        <AreaChart data={data}>
          <defs>
            <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="date" tickFormatter={fmt} fontSize={11} />
          <YAxis fontSize={11} />
          <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
          <Area dataKey="kwh" stroke="var(--color-chart-1)" fill="url(#ga)" />
        </AreaChart>
      )}
    </ResponsiveContainer>
  );
}

function PeriodSummary({ data, label }: { data: { kwh: number; cost: number }[]; label: string }) {
  const total = data.reduce((a, b) => a + b.kwh, 0);
  const cost = data.reduce((a, b) => a + b.cost, 0);
  const avg = total / data.length;
  return (
    <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
      <div className="rounded-lg border p-3">
        <p className="text-xs text-muted-foreground">Total {label}</p>
        <p className="mt-1 text-lg font-bold">{total.toFixed(1)} kWh</p>
      </div>
      <div className="rounded-lg border p-3">
        <p className="text-xs text-muted-foreground">Cost</p>
        <p className="mt-1 text-lg font-bold">${cost.toFixed(2)}</p>
      </div>
      <div className="rounded-lg border p-3">
        <p className="text-xs text-muted-foreground">Daily average</p>
        <p className="mt-1 text-lg font-bold">{avg.toFixed(1)} kWh</p>
      </div>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
      <span>{text}</span>
    </div>
  );
}





// import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
// import { useEffect, useMemo, useState } from "react";
// import { SiteLayout } from "@/components/SiteLayout";
// import { useSession } from "@/hooks/use-session";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Progress } from "@/components/ui/progress";
// import {
//   AreaChart, Area, BarChart, Bar, LineChart, Line,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
//   PieChart, Pie, Cell,
// } from "recharts";
// import {
//   Bolt, TrendingDown, TrendingUp, DollarSign, Activity, BellRing,
//   AlertTriangle, Sparkles, Zap, CheckCircle2, Plus, Cpu, Calendar,
// } from "lucide-react";
// import {
//   getNotifications, RATE_PER_KWH,
//   getMeterDaily, getMeterHourly, getApplianceBreakdown, getHeatmap,
//   aggregateDaily, aggregateHourly,
//   type DailyPoint, type HourlyPoint,
// } from "@/data/mockData";
// import { useMeterStore } from "@/lib/meters";
// import {
//   MeterSelector, describeScope, resolveMacIds, type MeterScope,
// } from "@/components/MeterSelector";
// import { ConsumptionHeatmap } from "@/components/ConsumptionHeatmap";

// export const Route = createFileRoute("/dashboard")({
//   head: () => ({ meta: [{ title: "Dashboard — SmartLoad DR" }] }),
//   component: Dashboard,
// });

// const PIE_COLORS = [
//   "var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)",
//   "var(--color-chart-4)", "var(--color-chart-5)",
//   "color-mix(in oklab, var(--color-chart-1) 60%, var(--color-chart-3))",
//   "color-mix(in oklab, var(--color-chart-2) 60%, var(--color-chart-4))",
//   "color-mix(in oklab, var(--color-chart-5) 60%, var(--color-chart-1))",
// ];

// function Dashboard() {
//   const session = useSession();
//   const navigate = useNavigate();
//   const store = useMeterStore(session?.userId);

//   useEffect(() => {
//     if (session === null) navigate({ to: "/login" });
//     else if (session.role === "admin") navigate({ to: "/admin" });
//   }, [session, store.homes.length, store.meters.length, navigate]);

//   // Per-card scopes (independent filters)
//   const [kpiScope, setKpiScope] = useState<MeterScope>({ kind: "all" });
//   const [forecastScope, setForecastScope] = useState<MeterScope>({ kind: "all" });
//   const [periodScope, setPeriodScope] = useState<MeterScope>({ kind: "all" });
//   const [applianceScope, setApplianceScope] = useState<MeterScope>({ kind: "all" });
//   const [heatmapScope, setHeatmapScope] = useState<MeterScope>({ kind: "all" });
//   const [costScope, setCostScope] = useState<MeterScope>({ kind: "all" });

//   // Default first meter once meters load
//   useEffect(() => {
//     if (store.meters.length === 1) {
//       const single: MeterScope = { kind: "meter", meterId: store.meters[0].id };
//       setKpiScope(single); setForecastScope(single); setPeriodScope(single);
//       setApplianceScope(single); setHeatmapScope(single); setCostScope(single);
//     }
//   }, [store.meters.length]);

//   const userId = session?.userId ?? "u1";
//   const notifications = useMemo(() => getNotifications(userId), [userId]);

//   const noMeters = store.homes.length === 0 || store.meters.length === 0;

//   // Resolve per-card series
//   const kpiData = useDaily(kpiScope, store.meters, 30);
//   const forecastData = useHourly(forecastScope, store.meters);
//   const periodData = useDaily(periodScope, store.meters, 90);
//   const applianceTotal = useDaily(applianceScope, store.meters, 30).reduce((a, b) => a + b.kwh, 0);
//   const appliance = useMemo(() => {
//     const macs = resolveMacIds(applianceScope, store.meters);
//     // Aggregate appliance shares across selected meters
//     const merged = new Map<string, number>();
//     macs.forEach((mac) => {
//       const meterTotal = getMeterDaily(mac, 30).reduce((a, b) => a + b.kwh, 0);
//       getApplianceBreakdown(mac, meterTotal).forEach((a) =>
//         merged.set(a.name, (merged.get(a.name) ?? 0) + a.kwh),
//       );
//     });
//     const total = [...merged.values()].reduce((a, b) => a + b, 0) || 1;
//     return [...merged.entries()]
//       .map(([name, kwh]) => ({ name, kwh: +kwh.toFixed(1), pct: +(kwh / total * 100).toFixed(1) }))
//       .sort((a, b) => b.kwh - a.kwh);
//   }, [applianceScope, store.meters]);
//   const heatmap = useMemo(() => {
//     const macs = resolveMacIds(heatmapScope, store.meters);
//     const grids = macs.map((m) => getHeatmap(m));
//     const merged: { day: number; hour: number; kwh: number }[] = [];
//     for (let d = 0; d < 7; d++) for (let h = 0; h < 24; h++) {
//       let sum = 0;
//       grids.forEach((g) => { sum += g.find((p) => p.day === d && p.hour === h)?.kwh ?? 0; });
//       merged.push({ day: d, hour: h, kwh: +sum.toFixed(2) });
//     }
//     return merged;
//   }, [heatmapScope, store.meters]);
//   const costData = useDaily(costScope, store.meters, 14);

//   // KPI computations
//   const monthKwh = +kpiData.reduce((a, b) => a + b.kwh, 0).toFixed(2);
//   const monthCost = +(monthKwh * RATE_PER_KWH).toFixed(2);
//   const prev30 = useMemo(() => {
//     const macs = resolveMacIds(kpiScope, store.meters);
//     const total = macs.reduce(
//       (a, m) => a + getMeterDaily(m, 60).slice(0, 30).reduce((x, d) => x + d.kwh, 0), 0,
//     );
//     return +(total * RATE_PER_KWH).toFixed(2);
//   }, [kpiScope, store.meters]);
//   const savings = +Math.max(0, prev30 - monthCost).toFixed(2);
//   const trend7 = kpiData.slice(-7).reduce((a, b) => a + b.kwh, 0) / 7;
//   const predicted = +(trend7 * 30 * RATE_PER_KWH).toFixed(2);
//   const drParticipation = Math.min(98, 60 + (kpiScope.kind === "meter" ? 15 : 5));

//   const last7 = kpiData.slice(-7).reduce((a, b) => a + b.kwh, 0) / 7;
//   const prev7 = kpiData.slice(-14, -7).reduce((a, b) => a + b.kwh, 0) / 7;
//   const trendDelta = prev7 ? ((last7 - prev7) / prev7) * 100 : 0;

//   if (!session || session.role === "admin" || noMeters) return null;

//   return (
//     <SiteLayout>
//       <div className="container mx-auto px-4 py-8">
//         <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Hello, {session.name.split(" ")[0]}</h1>
//             <p className="mt-1 text-sm text-muted-foreground">
//               {store.homes.length} home{store.homes.length > 1 ? "s" : ""} · {store.meters.length} meter{store.meters.length > 1 ? "s" : ""} linked ·
//               <span className="ml-1 inline-flex items-center gap-1">
//                 <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
//               </span>
//             </p>
//           </div>
//           <div className="flex gap-2">
//             <Button asChild variant="outline" size="sm">
//               <Link to="/meters"><Cpu className="mr-1 h-4 w-4" /> Manage meters</Link>
//             </Button>
//             <Button asChild size="sm">
//               <Link to="/onboarding"><Plus className="mr-1 h-4 w-4" /> Add meter</Link>
//             </Button>
//           </div>
//         </div>

//         {/* KPI band — single scope selector for all KPIs */}
//         <Card className="mb-4">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-sm font-medium text-muted-foreground">
//               At a glance · 30 days
//             </CardTitle>
//             <MeterSelector homes={store.homes} meters={store.meters} value={kpiScope} onChange={setKpiScope} />
//           </CardHeader>
//           <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <KpiCard icon={Activity} label="Consumption"
//               value={`${monthKwh.toFixed(1)} kWh`}
//               sub={`$${monthCost.toFixed(2)} at $${RATE_PER_KWH}/kWh`} tone="default"
//               delta={trendDelta} />
//             <KpiCard icon={TrendingDown} label="Savings vs prior 30d"
//               value={`$${savings.toFixed(2)}`}
//               sub={savings > 0 ? "Down vs last cycle" : "About the same"} tone="good" />
//             <KpiCard icon={Sparkles} label="Predicted next bill"
//               value={`$${predicted.toFixed(2)}`}
//               sub="Rolling 7-day projection" tone="default" />
//             <KpiCard icon={Zap} label="DR participation"
//               value={`${drParticipation}%`} sub="Last 30 days" tone="info" progress={drParticipation} />
//           </CardContent>
//         </Card>

//         <div className="mb-4 grid gap-4 lg:grid-cols-3">
//           <Card className="lg:col-span-2">
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="text-base">Live forecast vs actual · 24h</CardTitle>
//               <div className="flex items-center gap-2">
//                 <Badge variant="outline" className="gap-1 text-[10px]">
//                   {trendDelta >= 0 ? <TrendingUp className="h-3 w-3 text-orange-500" /> : <TrendingDown className="h-3 w-3 text-green-600" />}
//                   {Math.abs(trendDelta).toFixed(1)}% w/w
//                 </Badge>
//                 <MeterSelector homes={store.homes} meters={store.meters} value={forecastScope} onChange={setForecastScope} />
//               </div>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={280}>
//                 <AreaChart data={forecastData}>
//                   <defs>
//                     <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
//                       <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
//                     </linearGradient>
//                     <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="5%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
//                       <stop offset="95%" stopColor="var(--color-chart-2)" stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//                   <XAxis dataKey="hour" fontSize={11} />
//                   <YAxis fontSize={11} />
//                   <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
//                   <Legend />
//                   <Area type="monotone" dataKey="kwh" name="Actual" stroke="var(--color-chart-1)" fill="url(#g1)" />
//                   <Area type="monotone" dataKey="forecast" name="Forecast" stroke="var(--color-chart-2)" fill="url(#g2)" strokeDasharray="4 2" />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader className="pb-2">
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <BellRing className="h-4 w-4" /> Notifications
//                 <Badge variant="destructive" className="ml-auto">{notifications.filter(n => !n.read).length} new</Badge>
//               </CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-3">
//               {notifications.slice(0, 5).map((n) => <NotificationItem key={n.id} n={n} />)}
//             </CardContent>
//           </Card>
//         </div>

//         {/* Time-of-use heatmap */}
//         <Card className="mb-4">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <div>
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <Calendar className="h-4 w-4" /> Time-of-use heatmap
//               </CardTitle>
//               <p className="mt-1 text-xs text-muted-foreground">When you consume the most across an average week.</p>
//             </div>
//             <MeterSelector homes={store.homes} meters={store.meters} value={heatmapScope} onChange={setHeatmapScope} />
//           </CardHeader>
//           <CardContent>
//             <ConsumptionHeatmap data={heatmap} />
//           </CardContent>
//         </Card>

//         {/* Period analytics */}
//         <Card className="mb-4">
//           <CardHeader className="flex flex-row items-center justify-between pb-2">
//             <CardTitle className="text-base">Consumption analytics</CardTitle>
//             <MeterSelector homes={store.homes} meters={store.meters} value={periodScope} onChange={setPeriodScope} />
//           </CardHeader>
//           <CardContent>
//             <Tabs defaultValue="week">
//               <TabsList>
//                 <TabsTrigger value="week">Week</TabsTrigger>
//                 <TabsTrigger value="month">Month</TabsTrigger>
//                 <TabsTrigger value="year">90 days</TabsTrigger>
//               </TabsList>
//               <TabsContent value="week"><PeriodChart data={periodData.slice(-7)} type="bar" /><PeriodSummary data={periodData.slice(-7)} label="this week" /></TabsContent>
//               <TabsContent value="month"><PeriodChart data={periodData.slice(-30)} type="line" /><PeriodSummary data={periodData.slice(-30)} label="this month" /></TabsContent>
//               <TabsContent value="year"><PeriodChart data={periodData} type="area" /><PeriodSummary data={periodData} label="last 90 days" /></TabsContent>
//             </Tabs>
//           </CardContent>
//         </Card>

//         <div className="grid gap-4 lg:grid-cols-2">
//           {/* Appliance breakdown */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <div>
//                 <CardTitle className="flex items-center gap-2 text-base">
//                   <Bolt className="h-4 w-4" /> Appliance breakdown
//                 </CardTitle>
//                 <p className="mt-1 text-xs text-muted-foreground">Estimated kWh by category (last 30d) · {applianceTotal.toFixed(0)} kWh total</p>
//               </div>
//               <MeterSelector homes={store.homes} meters={store.meters} value={applianceScope} onChange={setApplianceScope} />
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-[160px_1fr] items-center gap-4">
//                 <ResponsiveContainer width="100%" height={180}>
//                   <PieChart>
//                     <Pie data={appliance} dataKey="kwh" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
//                       {appliance.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
//                     </Pie>
//                     <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <ul className="space-y-1.5 text-xs">
//                   {appliance.map((a, i) => (
//                     <li key={a.name} className="flex items-center gap-2">
//                       <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
//                       <span className="flex-1 truncate">{a.name}</span>
//                       <span className="font-mono tabular-nums text-muted-foreground">{a.kwh.toFixed(0)} kWh</span>
//                       <span className="w-10 text-right font-semibold tabular-nums">{a.pct.toFixed(0)}%</span>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             </CardContent>
//           </Card>

//           {/* Cost breakdown */}
//           <Card>
//             <CardHeader className="flex flex-row items-center justify-between pb-2">
//               <CardTitle className="flex items-center gap-2 text-base">
//                 <DollarSign className="h-4 w-4" /> Daily cost · last 14 days
//               </CardTitle>
//               <MeterSelector homes={store.homes} meters={store.meters} value={costScope} onChange={setCostScope} />
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={200}>
//                 <BarChart data={costData}>
//                   <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//                   <XAxis dataKey="date" fontSize={10} tickFormatter={(d) => d.slice(5)} />
//                   <YAxis fontSize={11} />
//                   <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
//                   <Bar dataKey="cost" fill="var(--color-chart-4)" radius={[4, 4, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </div>

//         {/* AI Tips */}
//         <Card className="mt-4">
//           <CardHeader className="pb-2">
//             <CardTitle className="flex items-center gap-2 text-base">
//               <Sparkles className="h-4 w-4 text-primary" /> AI optimization tips
//             </CardTitle>
//           </CardHeader>
//           <CardContent className="grid gap-2 sm:grid-cols-2">
//             <Tip text="Shift dishwasher to 11 PM — ~$2.10/mo savings." />
//             <Tip text="Reduce HVAC by 1°C during 6–9 PM peak window." />
//             <Tip text="Pre-cool home before 5 PM to leverage off-peak rates." />
//             <Tip text="Charge EV between 1–5 AM to maximize DR credits." />
//           </CardContent>
//         </Card>

//         <p className="mt-4 text-center text-xs text-muted-foreground">
//           Showing data for: <span className="font-medium text-foreground">{describeScope(kpiScope, store.homes, store.meters)}</span>
//         </p>
//       </div>
//     </SiteLayout>
//   );
// }

// // --- Hooks for resolving series by scope ---
// function useDaily(scope: MeterScope, meters: ReturnType<typeof useMeterStore>["meters"], days: number): DailyPoint[] {
//   return useMemo(() => {
//     const macs = resolveMacIds(scope, meters);
//     if (!macs.length) return [];
//     return aggregateDaily(macs.map((m) => getMeterDaily(m, days)));
//   }, [scope, meters, days]);
// }

// function useHourly(scope: MeterScope, meters: ReturnType<typeof useMeterStore>["meters"]): HourlyPoint[] {
//   return useMemo(() => {
//     const macs = resolveMacIds(scope, meters);
//     if (!macs.length) return [];
//     return aggregateHourly(macs.map((m) => getMeterHourly(m)));
//   }, [scope, meters]);
// }

// // --- Subcomponents ---
// function KpiCard({ icon: Icon, label, value, sub, tone, progress, delta }: {
//   icon: any; label: string; value: string; sub: string;
//   tone?: "default" | "good" | "warn" | "info"; progress?: number; delta?: number;
// }) {
//   const toneCls = {
//     default: "bg-primary/10 text-primary",
//     good: "bg-green-500/10 text-green-600",
//     warn: "bg-orange-500/10 text-orange-600",
//     info: "bg-blue-500/10 text-blue-600",
//   }[tone ?? "default"];
//   return (
//     <div className="rounded-xl border bg-card p-5 transition-shadow hover:shadow-sm">
//       <div className="flex items-start justify-between">
//         <div>
//           <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
//           <p className="mt-1 text-2xl font-bold">{value}</p>
//           <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
//         </div>
//         <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneCls}`}>
//           <Icon className="h-4 w-4" />
//         </div>
//       </div>
//       {typeof progress === "number" && <Progress value={progress} className="mt-3 h-1.5" />}
//       {typeof delta === "number" && (
//         <div className="mt-2 flex items-center gap-1 text-[11px]">
//           {delta >= 0 ? <TrendingUp className="h-3 w-3 text-orange-500" /> : <TrendingDown className="h-3 w-3 text-green-600" />}
//           <span className={delta >= 0 ? "text-orange-600" : "text-green-600"}>{Math.abs(delta).toFixed(1)}%</span>
//           <span className="text-muted-foreground">vs last week</span>
//         </div>
//       )}
//     </div>
//   );
// }

// function NotificationItem({ n }: { n: ReturnType<typeof getNotifications>[number] }) {
//   const map = {
//     alert:   { icon: AlertTriangle, cls: "text-orange-600 bg-orange-500/10" },
//     info:    { icon: BellRing,      cls: "text-blue-600 bg-blue-500/10" },
//     savings: { icon: TrendingDown,  cls: "text-green-600 bg-green-500/10" },
//     dr:      { icon: Zap,           cls: "text-purple-600 bg-purple-500/10" },
//   } as const;
//   const { icon: Icon, cls } = map[n.type];
//   return (
//     <div className="flex gap-3 rounded-lg border p-3">
//       <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${cls}`}>
//         <Icon className="h-4 w-4" />
//       </div>
//       <div className="min-w-0 flex-1">
//         <div className="flex items-center justify-between gap-2">
//           <p className="truncate text-sm font-medium">{n.title}</p>
//           {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
//         </div>
//         <p className="text-xs text-muted-foreground">{n.message}</p>
//         <p className="mt-1 text-[10px] uppercase text-muted-foreground">{n.time}</p>
//       </div>
//     </div>
//   );
// }

// function PeriodChart({ data, type }: { data: DailyPoint[]; type: "bar" | "line" | "area" }) {
//   const fmt = (d: string) => d.slice(5);
//   return (
//     <ResponsiveContainer width="100%" height={260}>
//       {type === "bar" ? (
//         <BarChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//           <XAxis dataKey="date" tickFormatter={fmt} fontSize={11} />
//           <YAxis fontSize={11} />
//           <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
//           <Bar dataKey="kwh" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
//         </BarChart>
//       ) : type === "line" ? (
//         <LineChart data={data}>
//           <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//           <XAxis dataKey="date" tickFormatter={fmt} fontSize={11} />
//           <YAxis fontSize={11} />
//           <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
//           <Line dataKey="kwh" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
//         </LineChart>
//       ) : (
//         <AreaChart data={data}>
//           <defs>
//             <linearGradient id="ga" x1="0" y1="0" x2="0" y2="1">
//               <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
//               <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
//             </linearGradient>
//           </defs>
//           <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
//           <XAxis dataKey="date" tickFormatter={fmt} fontSize={11} />
//           <YAxis fontSize={11} />
//           <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
//           <Area dataKey="kwh" stroke="var(--color-chart-1)" fill="url(#ga)" />
//         </AreaChart>
//       )}
//     </ResponsiveContainer>
//   );
// }

// function PeriodSummary({ data, label }: { data: DailyPoint[]; label: string }) {
//   if (!data.length) return null;
//   const total = data.reduce((a, b) => a + b.kwh, 0);
//   const cost = data.reduce((a, b) => a + b.cost, 0);
//   const avg = total / data.length;
//   return (
//     <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
//       <div className="rounded-lg border p-3">
//         <p className="text-xs text-muted-foreground">Total {label}</p>
//         <p className="mt-1 text-lg font-bold">{total.toFixed(1)} kWh</p>
//       </div>
//       <div className="rounded-lg border p-3">
//         <p className="text-xs text-muted-foreground">Cost</p>
//         <p className="mt-1 text-lg font-bold">${cost.toFixed(2)}</p>
//       </div>
//       <div className="rounded-lg border p-3">
//         <p className="text-xs text-muted-foreground">Daily average</p>
//         <p className="mt-1 text-lg font-bold">{avg.toFixed(1)} kWh</p>
//       </div>
//     </div>
//   );
// }

// function Tip({ text }: { text: string }) {
//   return (
//     <div className="flex items-start gap-2 rounded-md bg-muted/40 p-2.5 text-sm">
//       <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
//       <span>{text}</span>
//     </div>
//   );
// }
