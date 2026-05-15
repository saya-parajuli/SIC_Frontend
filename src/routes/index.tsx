import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bolt, BellRing, BarChart3, Brain, Zap, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SmartLoad DR — AI Smart Load Forecasting & Demand Response" },
      { name: "description", content: "Live energy forecasts, demand response actions, and savings insights for smart-meter users." },
    ],
  }),
  component: HomePage,
});

function Feature({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <h3 className="mb-1 font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}

function HomePage() {
  return (
    <SiteLayout>
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs">
          <Zap className="h-3 w-3 text-primary" /> SIC project
          </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          Forecast. Optimize. <span className="text-primary">Save.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          AI-driven smart load forecasting and demand response — combining rule-based and reinforcement learning to cut your bill.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg"><Link to="/register">Get started</Link></Button>
          <Button asChild size="lg" variant="outline"><Link to="/login">Login</Link></Button>
        </div>

        <div className="mx-auto mt-10 max-w-md rounded-lg border bg-muted/30 p-4 text-left text-xs">
          <div className="mb-1 font-semibold">Demo accounts</div>
          <div>User: <code>samsung@gmail.com</code> / <code>sic123</code></div>
          <div>Admin: <code>admin@demo.io</code> / <code>admin123</code></div>
        </div>
      </section>

      <section className="container mx-auto grid gap-4 px-4 pb-20 md:grid-cols-3">
        <Feature icon={Brain}      title="Hybrid AI engine" desc="Rule-based + reinforcement learning recommendations." />
        <Feature icon={BarChart3}  title="Live forecasts"   desc="Hourly, daily, weekly and monthly consumption views." />
        <Feature icon={BellRing}   title="DR alerts"        desc="Peak-hour pushes and demand response credits." />
        <Feature icon={Bolt}       title="Savings tracker"  desc="See exactly how much you've saved each cycle." />
        <Feature icon={ShieldCheck} title="Role-based access" desc="Separate user and admin dashboards." />
        <Feature icon={Zap}         title="REST + Docker"    desc="Designed to plug into a Django REST backend." />
      </section>
    </SiteLayout>
  );
}
