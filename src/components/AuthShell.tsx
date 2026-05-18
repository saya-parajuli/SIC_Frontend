import {
  Link,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
} from "react";

import { Bolt } from "lucide-react";

import { useSession } from "@/hooks/use-session";

export function AuthShell({ title, subtitle, children, footer }: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const session = useSession();

  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;

    navigate({
      to: "/dashboard",
    });
  }, [session, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Bolt className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold">SmartLoad DR</span>
        </Link>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>
        {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
