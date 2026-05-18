import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
// import { MOCK_OTP, verifyOtp } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — SmartLoad DR" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [pw, setPw] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // verifyOtp(code);
      toast.success("Password updated. Please login.");
      navigate({ to: "/login" });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle={`Enter the code (demo: "123456" ) and a new password.`}>
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pw">New password</Label>
          <Input id="pw" type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={code.length < 6}>Update password</Button>
      </form>
    </AuthShell>
  );
}
