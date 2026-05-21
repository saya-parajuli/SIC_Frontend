import {
  Link,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";

import {
  Bolt,
  LogOut,
  LayoutDashboard,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import { useSession } from "@/hooks/use-session";

import { useLogout } from "@/hooks/use-auth";

export function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();

  const navigate = useNavigate();

  const path = useRouterState({
    select: (r) => r.location.pathname,
  });

  const { logout } = useLogout();

  const handleLogout = async () => {
    await logout();

    navigate({ to: "/login" });
  };

  const navLink = (
    to: string,
    label: string
  ) => (
    <Link
      to={to}
      className={`text-sm transition-colors hover:text-primary ${
        path === to
          ? "font-semibold text-primary"
          : "text-muted-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* HEADER */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Bolt className="h-4 w-4" />
            </div>

            <span className="text-base font-bold tracking-tight">
              SmartLoad DR
            </span>
          </Link>

          {/* NAVIGATION */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLink("/", "Home")}

            {navLink("/about", "About")}

            {navLink("/features", "Features")}

           {session && session.role !== "admin" && navLink("/dashboard", "Dashboard")}
            {session && session.role !== "admin" && navLink("/meters", "Meters")}
           {session?.role === "admin" && (
  <a
    href={`${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/`}
    className="text-sm font-medium hover:text-primary"
  >
    Admin
  </a>
)}
          </nav>

          {/* AUTH ACTIONS */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                <Button
  asChild
  variant="ghost"
  size="sm"
>
  {session.role === "admin" ? (
    <a href={`${import.meta.env.VITE_BACKEND_URL}/admin/dashboard/`}>
      <Shield className="mr-1 h-4 w-4" />
      {session.first_name ?? session.email}
    </a>
  ) : (
    <Link to="/dashboard">
      <LayoutDashboard className="mr-1 h-4 w-4" />
      {session.first_name ?? session.email}
    </Link>
  )}
</Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-1 h-4 w-4" />

                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link to="/login">
                    Login
                  </Link>
                </Button>

                <Button
                  asChild
                  size="sm"
                >
                  <Link to="/register">
                    Register
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="flex-1">
        {children}
      </main>

      {/* FOOTER */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto grid gap-8 px-4 py-10 md:grid-cols-4">
          {/* BRAND */}
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bolt className="h-4 w-4" />
              </div>

              <span className="font-bold">
                SmartLoad DR
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              AI-based Smart Load
              Forecasting & Demand
              Response platform.
            </p>
          </div>

          {/* PRODUCT */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">
              Product
            </h4>

            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/features"
                  className="hover:text-primary"
                >
                  Features
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-primary"
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">
              Company
            </h4>

            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary"
                >
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* ACCOUNT */}
          <div>
            <h4 className="mb-2 text-sm font-semibold">
              Account
            </h4>

            <ul className="space-y-1 text-sm text-muted-foreground">
              {session ? (
                <>
                  <li>
                    <a
                    style={{cursor: "pointer"}}
                      className="hover:text-primary"
                    >
                      Profile
                    </a>
                  </li>
                  <li>
                    <a
                    style={{cursor: "pointer"}}
                      onClick={handleLogout}
                      className="hover:text-primary"
                    >
                      Logout
                    </a>
                  </li>
                </>
              ) : (
                <>
              <li>
                <Link
                  to="/login"
                  className="hover:text-primary"
                >
                  Login
                </Link>
              </li>

              <li>
                <Link
                  to="/register"
                  className="hover:text-primary"
                >
                  Register
                </Link>
              </li>

              <li>
                <Link
                  to="/forgot-password"
                  className="hover:text-primary"
                >
                  Forgot password
                </Link>
              </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}{" "}
          SmartLoad DR — Demo project.
        </div>
      </footer>
    </div>
  );
}