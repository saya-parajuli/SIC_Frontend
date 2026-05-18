import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";

import { useLogin } from "../hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login — SmartLoad DR" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const { login, loading, errors } =
    useLogin();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      const data = await login(formData);

      if (!data) return;

      toast.success(
        `Welcome back ${
          data.user.first_name ?? ""
        }`
      );

      navigate({
        to: "/dashboard",
      });
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          "Login failed"
      );
    }
  };

   return (
    <AuthShell
      title="Login"
      subtitle="Access your smart-meter dashboard."
      footer={
        <>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary hover:underline"
          >
            Register
          </Link>
        </>
      }
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5"
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              handleChange(
                "email",
                e.target.value
              )
            }
            placeholder="batuli@example.com"
          />

          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">
              Password
            </Label>

            <Link
              to="/forgot-password"
              className="text-xs text-primary hover:underline"
            >
              Forgot?
            </Link>
          </div>

          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              handleChange(
                "password",
                e.target.value
              )
            }
            placeholder="••••••••"
          />

          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base"
          disabled={loading}
        >
          {loading
            ? "Signing in..."
            : "Sign In"}
        </Button>
      </form>
    </AuthShell>
  );
}