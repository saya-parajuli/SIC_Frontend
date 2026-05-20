import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useSession } from "@/hooks/use-session";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Cpu, Home as HomeIcon, Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  addHome, addMeter, isValidMac, normalizeMac, removeHome, removeMeter, useMeterStore,
} from "@/lib/meters";

export const Route = createFileRoute("/meters")({
  head: () => ({ meta: [{ title: "Meters — SmartLoad DR" }] }),
  component: MetersPage,
});

function MetersPage() {
  const session = useSession();
  const navigate = useNavigate();
  const store = useMeterStore(session?.userId);

  useEffect(() => {
    if (session === null) navigate({ to: "/login" });
    else if (session?.role === "admin") navigate({ to: "/admin" });
  }, [session, navigate]);

  if (!session || session.role === "admin") return null;

  return (
    <SiteLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Homes & meters</h1>
            <p className="text-sm text-muted-foreground">Manage your properties and the smart meters linked to them.</p>
          </div>
          <div className="flex gap-2">
            <AddHomeDialog userId={session.userId} />
            {store.homes.length > 0 && <AddMeterDialog userId={session.userId} homes={store.homes} />}
          </div>
        </div>

        {store.homes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <HomeIcon className="h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">No homes yet</h3>
              <p className="max-w-sm text-sm text-muted-foreground">
                Add your first property to start linking smart meters.
              </p>
              <Button asChild><Link to="/onboarding">Run setup wizard <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {store.homes.map((h) => {
              const meters = store.meters.filter((m) => m.homeId === h.id);
              return (
                <Card key={h.id}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <HomeIcon className="h-5 w-5 text-primary" /> {h.name}
                      </CardTitle>
                      <CardDescription>
                        {h.address} · <Badge variant="secondary" className="ml-1 align-middle">{h.tariff.toUpperCase()}</Badge> · {h.timezone}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => { removeHome(session.userId, h.id); toast.success("Home removed"); }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {meters.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No meters linked to this home yet.</p>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {meters.map((m) => (
                          <div key={m.id} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 p-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                                <Cpu className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate text-sm font-medium">{m.label}</p>
                                  <Badge variant="outline" className="text-[10px]">{m.type}</Badge>
                                </div>
                                <p className="font-mono text-[11px] text-muted-foreground">{m.macId}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost" size="sm"
                              onClick={() => { removeMeter(session.userId, m.id); toast.success("Meter removed"); }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function AddHomeDialog({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [tariff, setTariff] = useState<"flat" | "tou" | "tiered">("tou");
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const submit = () => {
    if (!name.trim() || !address.trim()) { toast.error("Name and address required"); return; }
    addHome(userId, { name: name.trim(), address: address.trim(), timezone: tz, tariff });
    toast.success("Home added");
    setOpen(false); setName(""); setAddress("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm"><Plus className="mr-1 h-4 w-4" /> Add home</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a home</DialogTitle>
          <DialogDescription>A home groups one or more smart meters at a single property.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Beach house" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Address</Label>
            <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="12 Ocean Dr, Miami" />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">Tariff plan</Label>
            <Select value={tariff} onValueChange={(v) => setTariff(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat rate</SelectItem>
                <SelectItem value="tou">Time-of-use</SelectItem>
                <SelectItem value="tiered">Tiered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Add home</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddMeterDialog({ userId, homes }: { userId: string; homes: ReturnType<typeof useMeterStore>["homes"] }) {
  const [open, setOpen] = useState(false);
  const [homeId, setHomeId] = useState(homes[0]?.id ?? "");
  const [macId, setMacId] = useState("");
  const [label, setLabel] = useState("");
  const [type, setType] = useState<"main" | "solar" | "sub" | "ev">("main");

  const submit = () => {
    if (!homeId) { toast.error("Pick a home"); return; }
    if (!isValidMac(macId)) { toast.error("MAC ID must look like AA:BB:CC:DD:EE:FF"); return; }
    try {
      addMeter(userId, { homeId, macId: normalizeMac(macId), label: label.trim() || "Meter", type });
      toast.success("Meter linked");
      setOpen(false); setMacId(""); setLabel("");
    } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-1 h-4 w-4" /> Add meter</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Link a smart meter</DialogTitle>
          <DialogDescription>Enter the MAC ID printed on your meter.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label className="text-xs">Home</Label>
            <Select value={homeId} onValueChange={setHomeId}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {homes.map((h) => <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs">MAC ID</Label>
            <Input
              value={macId}
              onChange={(e) => setMacId(e.target.value.toUpperCase())}
              placeholder="AA:BB:CC:DD:EE:FF"
              className="font-mono uppercase tracking-wider"
              maxLength={17}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <Label className="text-xs">Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Main meter" />
            </div>
            <div className="grid gap-1.5">
              <Label className="text-xs">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main</SelectItem>
                  <SelectItem value="solar">Solar</SelectItem>
                  <SelectItem value="sub">Sub-circuit</SelectItem>
                  <SelectItem value="ev">EV charger</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={submit}>Link meter</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
