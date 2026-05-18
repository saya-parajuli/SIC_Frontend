import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { toast } from "sonner";
import { useRegister } from "../hooks/use-auth";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [{ title: "Register — SmartLoad DR" }],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();

  const { register, loading, errors } = useRegister();

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    password2: "",
    phone: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const success = await register(formData);

      if (!success) return;

      sessionStorage.setItem("pending_email", formData.email);

      toast.success(
        "Account created successfully. Please log in."
      );

      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(
        err.response?.data?.detail ||
          "Registration failed. Try again."
      );
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start tracking your smart-meter consumption."
      footer={
        <>
          Already registered?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline"
          >
            Login
          </Link>
        </>
      }
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5"
      >
        {/* Name Row */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="first_name">
              First Name
            </Label>

            <Input
              id="first_name"
              value={formData.first_name}
              onChange={(e) =>
                handleChange("first_name", e.target.value)
              }
              placeholder="Batuli"
            />

            {errors.first_name && (
              <p className="text-sm text-red-500">
                {errors.first_name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last_name">
              Last Name
            </Label>

            <Input
              id="last_name"
              value={formData.last_name}
              onChange={(e) =>
                handleChange("last_name", e.target.value)
              }
              placeholder="Kafle"
            />

            {errors.last_name && (
              <p className="text-sm text-red-500">
                {errors.last_name}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>

          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              handleChange("email", e.target.value)
            }
            placeholder="batuli@example.com"
          />

          {errors.email && (
            <p className="text-sm text-red-500">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number
            <span className="text-muted-foreground ml-1">
              (Optional)
            </span>
          </Label>

          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) =>
              handleChange("phone", e.target.value)
            }
            placeholder="+977 98XXXXXXXX"
          />

          {errors.phone && (
            <p className="text-sm text-red-500">
              {errors.phone}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>

          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              handleChange("password", e.target.value)
            }
            placeholder="••••••••"
          />

          {errors.password && (
            <p className="text-sm text-red-500">
              {errors.password}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="password2">
            Confirm Password
          </Label>

          <Input
            id="password2"
            type="password"
            value={formData.password2}
            onChange={(e) =>
              handleChange("password2", e.target.value)
            }
            placeholder="••••••••"
          />

          {errors.password2 && (
            <p className="text-sm text-red-500">
              {errors.password2}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-base"
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
    </AuthShell>
  );
}