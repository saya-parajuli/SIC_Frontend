import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home as HomeIcon, Cpu, CheckCircle2, ArrowRight, Bolt } from "lucide-react";
import { toast } from "sonner";
import { addHome, addMeter, getHomes, getMeters, isValidMac, normalizeMac } from "@/lib/meters";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Setup — SmartLoad DR" }] }),
  component: Onboarding,
});

function Onboarding() {
  const session = useSession();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [homeId, setHomeId] = useState<string | null>(null);

  // Home form
  const [name, setName] = useState("Main residence");
  const [address, setAddress] = useState("");
  const [tariff, setTariff] = useState<"flat" | "tou" | "tiered">("tou");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");

  // Meter form
  const [macId, setMacId] = useState("");
  const [label, setLabel] = useState("Main meter");
  const [type, setType] = useState<"main" | "solar" | "sub" | "ev">("main");

  useEffect(() => {
    if (session === null) navigate({ to: "/login" });
  }, [session, navigate]);

  // If user already has homes & meters, skip to dashboard
  useEffect(() => {
    if (!session) return;
    /* if (getHomes(session.userId).length && getMeters(session.userId).length) {
      navigate({ to: "/dashboard" });
    } */
  }, [session, navigate]);

  if (!session) return null;

  const submitHome = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) { toast.error("Fill home name and address"); return; }
    const h = addHome(session.userId, { name: name.trim(), address: address.trim(), timezone, tariff });
    setHomeId(h.id);
    toast.success(`Home "${h.name}" added`);
    setStep(2);
  };

  const submitMeter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!homeId) return;
    if (!isValidMac(macId)) { toast.error("MAC ID must look like AA:BB:CC:DD:EE:FF"); return; }
    try {
      addMeter(session.userId, { homeId, macId: normalizeMac(macId), label: label.trim() || "Meter", type });
      toast.success("Meter linked");
      setStep(3);
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <SiteLayout>
      <div className="container mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bolt className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {session.first_name || session.email}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Two quick steps to bring your dashboard to life.</p>
        </div>

        <Stepper step={step} />

        {step === 1 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><HomeIcon className="h-5 w-5 text-primary" /> Add your home</CardTitle>
              <CardDescription>
                A home is the property where your meters live. You can add more homes later (e.g. cabin, office).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitHome} className="grid gap-4">
                <Field label="Home name">
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Main residence" />
                </Field>
                <Field label="Address">
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="221B Baker St, London" />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Timezone">
                    <Input value={timezone} onChange={(e) => setTimezone(e.target.value)} />
                  </Field>
                  <Field label="Tariff plan">
                    <Select value={tariff} onValueChange={(v) => setTariff(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat rate</SelectItem>
                        <SelectItem value="tou">Time-of-use</SelectItem>
                        <SelectItem value="tiered">Tiered</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Button type="submit" className="mt-2 w-full">Continue <ArrowRight className="ml-1 h-4 w-4" /></Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-primary" /> Link your smart meter</CardTitle>
              <CardDescription>
                Enter the MAC ID printed on your smart meter (Zigbee/Wi-Fi). You can add more meters later — main, solar export, EV sub-meter, etc.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={submitMeter} className="grid gap-4">
                <Field label="MAC ID" hint="Format: AA:BB:CC:DD:EE:FF (dashes and spaces are OK)">
                  <Input
                    value={macId}
                    onChange={(e) => setMacId(e.target.value.toUpperCase())}
                    placeholder="AA:BB:CC:DD:EE:FF"
                    className="font-mono uppercase tracking-wider"
                    maxLength={17}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Label">
                    <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Main meter" />
                  </Field>
                  <Field label="Type">
                    <Select value={type} onValueChange={(v) => setType(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="main">Main (whole home)</SelectItem>
                        <SelectItem value="solar">Solar export</SelectItem>
                        <SelectItem value="sub">Sub-circuit</SelectItem>
                        <SelectItem value="ev">EV charger</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
                <Button type="submit" className="mt-2 w-full">Link meter <ArrowRight className="ml-1 h-4 w-4" /></Button>
                <button
                  type="button"
                  onClick={() => { setMacId("AA:BB:CC:11:22:33"); }}
                  className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                  Use a demo MAC ID
                </button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center gap-4 p-10 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
              <h2 className="text-2xl font-bold">You're all set</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                Your meter is streaming. Your live forecast, savings, and DR alerts are ready on the dashboard.
              </p>
              <Button size="lg" onClick={() => navigate({ to: "/dashboard" })}>
                Go to dashboard <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </SiteLayout>
  );
}

function Stepper({ step }: { step: 1 | 2 | 3 }) {
  const items = [
    { n: 1, label: "Home" },
    { n: 2, label: "Meter" },
    { n: 3, label: "Done" },
  ];
  return (
    <div className="flex items-center justify-center gap-2">
      {items.map((it, i) => (
        <div key={it.n} className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-semibold transition ${
            step >= it.n ? "border-primary bg-primary text-primary-foreground" : "border-muted text-muted-foreground"
          }`}>
            {step > it.n ? <CheckCircle2 className="h-4 w-4" /> : it.n}
          </div>
          <span className={`text-xs ${step >= it.n ? "text-foreground font-medium" : "text-muted-foreground"}`}>{it.label}</span>
          {i < items.length - 1 && <div className={`h-px w-8 ${step > it.n ? "bg-primary" : "bg-border"}`} />}
        </div>
      ))}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

// silence unused import warning
void RadioGroup; void RadioGroupItem;
