import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { authSettings, type Challenge } from "@/content/customer-auth";

function useCountdown(target: number) {
  const [left, setLeft] = useState(() => Math.max(0, target - Date.now()));
  useEffect(() => {
    setLeft(Math.max(0, target - Date.now()));
    const id = window.setInterval(() => setLeft(Math.max(0, target - Date.now())), 1000);
    return () => window.clearInterval(id);
  }, [target]);
  return left;
}

function clock(ms: number) {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

export function OtpVerifyStep({
  challenge,
  error,
  busy,
  onVerify,
  onResend,
  onChangeIdentifier,
}: {
  challenge: Challenge;
  error: string | null;
  busy: boolean;
  onVerify: (code: string) => void;
  onResend: () => void;
  onChangeIdentifier: () => void;
}) {
  const [code, setCode] = useState("");
  const resendLeft = useCountdown(challenge.resendAvailableAt);
  const expiryLeft = useCountdown(challenge.expiresAt);
  const expired = expiryLeft <= 0;
  const liveRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => setCode(""), [challenge.id]);

  const channelLabel = useMemo(
    () => (challenge.kind === "mobile" ? "mobile number" : "email address"),
    [challenge.kind],
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
        <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight sm:text-xl">Enter your one-time code</h2>
          <p className="mt-1 text-pretty text-sm text-muted-foreground">
            We sent a 6-digit code to the {channelLabel} ending {challenge.masked}. It is valid for{" "}
            {authSettings.otpExpiryMinutes} minutes.
          </p>
        </div>
      </div>

      {/* Demo delivery notice — replaced by real SMS/email once the backend is enabled. */}
      <p className="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm">
        <span className="font-semibold">Demo mode:</span> messages aren&apos;t sent yet, so your code
        is <span className="font-mono text-base font-bold tracking-widest">{challenge.code}</span>
      </p>

      <div className="space-y-2">
        <Label htmlFor="otp-code">One-time code</Label>
        <InputOTP
          id="otp-code"
          maxLength={6}
          value={code}
          onChange={setCode}
          disabled={busy || expired}
          containerClassName="justify-start"
          aria-describedby="otp-help"
        >
          <InputOTPGroup>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <InputOTPSlot key={i} index={i} className="h-11 w-9 sm:w-11" />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <p id="otp-help" className="text-xs text-muted-foreground" ref={liveRef} aria-live="polite">
          {expired
            ? "This code has expired. Request a new one to continue."
            : `Code expires in ${clock(expiryLeft)}.`}
        </p>
      </div>

      {error ? (
        <p
          role="alert"
          className="grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0">{error}</span>
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          className="w-full sm:w-auto"
          disabled={busy || expired || code.length !== 6}
          onClick={() => onVerify(code)}
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          Verify &amp; continue
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={busy || resendLeft > 0}
          onClick={onResend}
        >
          <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
          {resendLeft > 0 ? `Resend in ${clock(resendLeft)}` : "Resend code"}
        </Button>
      </div>

      <button
        type="button"
        onClick={onChangeIdentifier}
        className="text-sm font-medium text-primary underline underline-offset-4"
      >
        Use a different mobile number or email
      </button>
    </div>
  );
}
