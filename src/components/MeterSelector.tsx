import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Cpu, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import type { Home, Meter } from "@/lib/meters";

export type MeterScope = { kind: "all" } | { kind: "home"; homeId: string } | { kind: "meter"; meterId: string };

export function describeScope(scope: MeterScope, homes: Home[], meters: Meter[]): string {
  if (scope.kind === "all") return "All meters";
  if (scope.kind === "home") {
    const h = homes.find((x) => x.id === scope.homeId);
    return h ? `${h.name} — all meters` : "Home";
  }
  const m = meters.find((x) => x.id === scope.meterId);
  if (!m) return "Meter";
  const h = homes.find((x) => x.id === m.homeId);
  return `${h?.name ?? ""} · ${m.label}`;
}

export function resolveMacIds(scope: MeterScope, meters: Meter[]): string[] {
  if (scope.kind === "all") return meters.map((m) => m.macId);
  if (scope.kind === "home") return meters.filter((m) => m.homeId === scope.homeId).map((m) => m.macId);
  const m = meters.find((x) => x.id === scope.meterId);
  return m ? [m.macId] : [];
}

interface Props {
  homes: Home[];
  meters: Meter[];
  value: MeterScope;
  onChange: (v: MeterScope) => void;
  size?: "sm" | "xs";
  className?: string;
}

export function MeterSelector({ homes, meters, value, onChange, size = "sm", className }: Props) {
  const [open, setOpen] = useState(false);
  const label = useMemo(() => describeScope(value, homes, meters), [value, homes, meters]);

  // Auto-correct dangling scope (deleted meter/home)
  useEffect(() => {
    if (value.kind === "meter" && !meters.some((m) => m.id === value.meterId)) onChange({ kind: "all" });
    if (value.kind === "home" && !homes.some((h) => h.id === value.homeId)) onChange({ kind: "all" });
  }, [value, meters, homes, onChange]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={size === "xs" ? "sm" : "sm"}
          className={cn("h-7 gap-1 px-2 text-xs font-medium", className)}
        >
          <Layers className="h-3 w-3" />
          <span className="max-w-[180px] truncate">{label}</span>
          <ChevronsUpDown className="h-3 w-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="end">
        <Command>
          <CommandInput placeholder="Search meter..." className="h-9" />
          <CommandList>
            <CommandEmpty>No meter found.</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => { onChange({ kind: "all" }); setOpen(false); }}>
                <Layers className="mr-2 h-4 w-4" />
                <span>All meters</span>
                {value.kind === "all" && <Check className="ml-auto h-4 w-4" />}
              </CommandItem>
            </CommandGroup>
            {homes.map((h) => {
              const hMeters = meters.filter((m) => m.homeId === h.id);
              if (!hMeters.length) return null;
              return (
                <CommandGroup key={h.id} heading={h.name}>
                  <CommandItem onSelect={() => { onChange({ kind: "home", homeId: h.id }); setOpen(false); }}>
                    <Layers className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>All meters in {h.name}</span>
                    {value.kind === "home" && value.homeId === h.id && <Check className="ml-auto h-4 w-4" />}
                  </CommandItem>
                  {hMeters.map((m) => (
                    <CommandItem
                      key={m.id}
                      onSelect={() => { onChange({ kind: "meter", meterId: m.id }); setOpen(false); }}
                    >
                      <Cpu className="mr-2 h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{m.label}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{m.macId}</span>
                      </div>
                      {value.kind === "meter" && value.meterId === m.id && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  ))}
                  <CommandSeparator />
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
