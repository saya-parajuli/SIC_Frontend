import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import { useState } from "react";

import { AuthShell } from "@/components/AuthShell";

import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import { toast } from "sonner";

import { useResetPassword } from "@/hooks/use-auth";

export const Route =
  createFileRoute(
    "/reset-password/$reset_token"
  )({
    head: () => ({
      meta: [
        {
          title:
            "Reset password — SmartLoad DR",
        },
      ],
    }),
    component: ResetPage,
  });

function ResetPage() {
  const navigate = useNavigate();

  const { reset_token } =
    Route.useParams();

  const {
    submitResetPassword,
    loading,
  } = useResetPassword();

  const [otp, setOtp] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const onSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (
      newPassword !==
      confirmPassword
    ) {
      toast.error(
        "Passwords do not match"
      );

      return;
    }

    try {
      await submitResetPassword({
        reset_token,
        otp,
        new_password:
          newPassword,
        confirm_password:
          confirmPassword,
      });

      toast.success(
        "Password updated successfully."
      );

      navigate({
        to: "/login",
      });
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ||
          "Failed to reset password"
      );
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter the OTP sent to your email and create a new password."
    >
      <form
        onSubmit={onSubmit}
        className="space-y-5"
      >
        {/* OTP */}
        <div className="space-y-2">
          <Label>
            Verification Code
          </Label>

          <div className="flex justify-center">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={setOtp}
            >
              <InputOTPGroup>
                {[0, 1, 2, 3, 4, 5].map(
                  (i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                    />
                  )
                )}
              </InputOTPGroup>
            </InputOTP>
          </div>
        </div>

        {/* NEW PASSWORD */}
        <div className="space-y-2">
          <Label htmlFor="password">
            New Password
          </Label>

          <Input
            id="password"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) =>
              setNewPassword(
                e.target.value
              )
            }
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="space-y-2">
          <Label htmlFor="confirm_password">
            Confirm Password
          </Label>

          <Input
            id="confirm_password"
            type="password"
            required
            minLength={6}
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(
                e.target.value
              )
            }
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={
            loading ||
            otp.length < 6
          }
        >
          {loading
            ? "Updating..."
            : "Update Password"}
        </Button>
      </form>
    </AuthShell>
  );
}