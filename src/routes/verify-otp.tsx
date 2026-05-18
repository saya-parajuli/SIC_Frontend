import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AuthShell } from "@/components/AuthShell";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
// import { login, MOCK_OTP, verifyOtp } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-otp")({
  head: () => ({ meta: [{ title: "Verify OTP — SmartLoad DR" }] }),
  component: VerifyOtpPage,
});

function VerifyOtpPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // verifyOtp(code);
      const email = sessionStorage.getItem("pending_email");
      const password = sessionStorage.getItem("pending_password");
      if (email && password) {
        // const s = login(email, password);
        sessionStorage.removeItem("pending_email");
        sessionStorage.removeItem("pending_password");
        toast.success("Verified! Welcome.");
        //  navigate({ to: s.role === "admin" ? "/admin" : "/dashboard" });
      } else {
        toast.success("OTP verified.");
        navigate({ to: "/login" });
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally { setLoading(false); }
  };

  return (
    <AuthShell title="Verify it's you" subtitle={`Enter the 6-digit code (demo: "123456").`}>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex justify-center">
          <InputOTP maxLength={6} value={code} onChange={setCode}>
            <InputOTPGroup>
              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button type="submit" className="w-full" disabled={loading || code.length < 6}>
          {loading ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </AuthShell>
  );
}
