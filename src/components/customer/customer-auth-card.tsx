import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, KeyRound, Loader2, Mail, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OtpVerifyStep } from "@/components/customer/otp-verify-step";
import {
  authSettings,
  clearChallenge,
  genericAuthError,
  getChallenge,
  parseIdentifier,
  requestOtp,
  signInWithPassword,
  verifyOtp,
  type Challenge,
  type ChallengeIntent,
  type CustomerSession,
} from "@/content/customer-auth";

type Mode = "login" | "register" | "recovery";

const identifierHint = () => {
  if (authSettings.mobileOtpEnabled && authSettings.emailOtpEnabled)
    return "Mobile number or email address";
  if (authSettings.mobileOtpEnabled) return "Mobile number";
  return "Email address";
};

export function CustomerAuthCard({
  onAuthenticated,
  defaultMode = "login",
}: {
  onAuthenticated: (session: CustomerSession, createdAccount: boolean) => void;
  defaultMode?: Mode;
}) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [identifier, setIdentifier] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Resume an in-flight verification after a refresh.
  useEffect(() => {
    const pending = getChallenge();
    if (pending && pending.expiresAt > Date.now()) {
      setChallenge(pending);
      setMode(pending.intent);
      setIdentifier(pending.identifier);
    }
  }, []);

  const reset = useCallback(() => {
    clearChallenge();
    setChallenge(null);
    setError(null);
    setNotice(null);
  }, []);

  const startChallenge = useCallback(
    (intent: ChallengeIntent, opts: { fullName?: string; password?: string } = {}) => {
      setBusy(true);
      setError(null);
      const outcome = requestOtp(identifier, intent, opts);
      setBusy(false);
      if (!outcome.ok) {
        if (outcome.reason === "invalid-identifier")
          setError(`Enter a valid ${identifierHint().toLowerCase()}.`);
        else if (outcome.reason === "channel-disabled")
          setError("That sign-in channel is currently switched off. Please use the other option.");
        else
          setError(
            `Please wait ${Math.ceil((outcome.retryInMs ?? 0) / 1000)}s before requesting another code.`,
          );
        return;
      }
      setChallenge(outcome.challenge);
      setNotice(null);
    },
    [identifier],
  );

  const handleVerify = useCallback(
    (code: string) => {
      setBusy(true);
      const outcome = verifyOtp(code);
      setBusy(false);
      if (outcome.ok) {
        setChallenge(null);
        onAuthenticated(outcome.session, outcome.createdAccount);
        return;
      }
      if (outcome.reason === "expired") setError("That code has expired. Request a new one.");
      else if (outcome.reason === "too-many-attempts") {
        setError("Too many incorrect codes. Request a fresh code to try again.");
        clearChallenge();
        setChallenge(null);
      } else if (outcome.reason === "no-challenge") {
        setError("Your verification session ended. Please request a new code.");
        setChallenge(null);
      } else {
        setError(
          `That code isn't right. ${outcome.attemptsLeft} attempt${outcome.attemptsLeft === 1 ? "" : "s"} left.`,
        );
      }
    },
    [onAuthenticated],
  );

  const handlePasswordLogin = useCallback(() => {
    setBusy(true);
    const outcome = signInWithPassword(identifier, password);
    setBusy(false);
    if (outcome.ok) {
      onAuthenticated(outcome.session, false);
      return;
    }
    setError(
      outcome.reason === "invalid-identifier"
        ? `Enter a valid ${identifierHint().toLowerCase()}.`
        : outcome.reason === "disabled"
          ? "Password sign-in is currently switched off. Use a one-time code instead."
          : genericAuthError,
    );
  }, [identifier, password, onAuthenticated]);

  if (challenge) {
    return (
      <section aria-labelledby="auth-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-7">
        <h2 id="auth-heading" className="sr-only">
          Verify your identity
        </h2>
        <OtpVerifyStep
          challenge={challenge}
          error={error}
          busy={busy}
          onVerify={handleVerify}
          onResend={() =>
            startChallenge(challenge.intent, {
              fullName: challenge.fullName,
              password: challenge.password,
            })
          }
          onChangeIdentifier={reset}
        />
      </section>
    );
  }

  const parsed = parseIdentifier(identifier);
  const channelIcon = parsed?.kind === "email" ? Mail : Smartphone;
  const ChannelIcon = channelIcon;

  return (
    <section aria-labelledby="auth-heading" className="rounded-2xl border border-border bg-card p-5 sm:p-7">
      <h2 id="auth-heading" className="text-xl font-bold tracking-tight sm:text-2xl">
        Customer sign in
      </h2>
      <p className="mt-2 text-pretty text-sm text-muted-foreground">
        Signing in is optional. Use a one-time code sent to your mobile or email — no password
        needed.
      </p>

      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as Mode);
          setError(null);
          setNotice(null);
        }}
        className="mt-5"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="login" className="text-xs sm:text-sm">
            Sign in
          </TabsTrigger>
          <TabsTrigger value="register" className="text-xs sm:text-sm">
            Register
          </TabsTrigger>
          <TabsTrigger value="recovery" className="text-xs sm:text-sm">
            Recover
          </TabsTrigger>
        </TabsList>

        <div className="mt-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="auth-identifier">{identifierHint()}</Label>
            <div className="relative">
              <ChannelIcon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="auth-identifier"
                inputMode="text"
                autoComplete="username"
                className="pl-9"
                placeholder="98400 12345 or you@example.com"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
              />
            </div>
          </div>

          <TabsContent value="login" className="m-0 space-y-4">
            {authSettings.passwordLoginEnabled && usePassword ? (
              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            ) : null}
            <Button
              type="button"
              className="w-full"
              disabled={busy || !identifier.trim() || (usePassword && !password)}
              onClick={() => (usePassword ? handlePasswordLogin() : startChallenge("login"))}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {usePassword ? "Sign in" : "Send one-time code"}
            </Button>
            {authSettings.passwordLoginEnabled ? (
              <button
                type="button"
                className="flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-4"
                onClick={() => {
                  setUsePassword((v) => !v);
                  setError(null);
                }}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {usePassword ? "Use a one-time code instead" : "Sign in with a password instead"}
              </button>
            ) : null}
          </TabsContent>

          <TabsContent value="register" className="m-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-name">Full name</Label>
              <Input
                id="auth-name"
                autoComplete="name"
                placeholder="e.g. Arun Kumar"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
              />
            </div>
            {authSettings.passwordLoginEnabled ? (
              <div className="space-y-2">
                <Label htmlFor="auth-new-password">Set a password (optional)</Label>
                <Input
                  id="auth-new-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  aria-describedby="auth-new-password-help"
                />
                <p id="auth-new-password-help" className="text-xs text-muted-foreground">
                  At least 8 characters. Leave blank to sign in with one-time codes only.
                </p>
              </div>
            ) : null}
            <Button
              type="button"
              className="w-full"
              disabled={
                busy ||
                !identifier.trim() ||
                fullName.trim().length < 2 ||
                (newPassword.length > 0 && newPassword.length < 8)
              }
              onClick={() =>
                startChallenge("register", {
                  fullName,
                  password: newPassword || undefined,
                })
              }
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Create account &amp; verify
            </Button>
            <p className="text-xs text-muted-foreground">
              Your profile is created only after the code is verified. If this mobile or email is
              already registered, you&apos;ll simply be signed in to that account.
            </p>
          </TabsContent>

          <TabsContent value="recovery" className="m-0 space-y-4">
            <p className="text-sm text-muted-foreground">
              Forgot your password or lost access? Verify a one-time code and set a new password.
            </p>
            {authSettings.passwordLoginEnabled ? (
              <div className="space-y-2">
                <Label htmlFor="auth-reset-password">New password (optional)</Label>
                <Input
                  id="auth-reset-password"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                />
              </div>
            ) : null}
            <Button
              type="button"
              className="w-full"
              disabled={
                busy || !identifier.trim() || (newPassword.length > 0 && newPassword.length < 8)
              }
              onClick={() => {
                setNotice(
                  "If that mobile number or email is registered with us, a one-time code is on its way.",
                );
                startChallenge("recovery", { password: newPassword || undefined });
              }}
            >
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Send recovery code
            </Button>
          </TabsContent>
        </div>
      </Tabs>

      {notice ? (
        <p className="mt-4 rounded-xl border border-border bg-muted/50 px-4 py-3 text-sm" role="status">
          {notice}
        </p>
      ) : null}

      {error ? (
        <p
          role="alert"
          className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-2 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="min-w-0">{error}</span>
        </p>
      ) : null}
    </section>
  );
}
