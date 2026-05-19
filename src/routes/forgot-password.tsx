import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useForgotPassword } from "@/hooks/use-auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Forgot password — SmartLoad DR" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const navigate = useNavigate();
  const {
    submitForgotPassword,
    loading,
  } = useForgotPassword();
  const [email, setEmail] = useState("");

   const onSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      await submitForgotPassword(
        email
      );

      toast.success(
        "Reset instructions sent to your email."
      );

      navigate({
        to: "/",
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          "Failed to send reset email"
      );
    }
  };

  return (
    <AuthShell
      title="Forgot password"
      subtitle="Enter your email address and we'll send reset instructions."
      footer={
        <>
          Remembered it?{" "}
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
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label htmlFor="email">
            Email
          </Label>

          <Input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            placeholder="batuli@example.com"
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "Send reset link"}
        </Button>
      </form>
    </AuthShell>
  );
}
