import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { AlertCircle, FileCheck2, Loader2, Paperclip, ShieldCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  bookingTypeOf,
  findDuplicateTransaction,
  makePaymentReference,
  paymentMethodOptions,
  paymentSettings,
  queuePaymentNotifications,
  savePaymentSubmission,
  screenshotStoragePath,
  todayISO,
  validateBookingLink,
  type PaymentScreenshotRef,
  type PaymentSubmissionRecord,
} from "@/content/payment";
import { company } from "@/content/site";

const maxBytes = paymentSettings.upload.maxMb * 1024 * 1024;

const schema = z.object({
  customerName: z.string().trim().min(2, "Please enter your full name.").max(100, "Name is too long."),
  bookingNumber: z
    .string()
    .trim()
    .min(6, "Enter the booking number from your confirmation.")
    .max(40, "Booking number is too long."),
  phone: z
    .string()
    .trim()
    .regex(/^[+]?[\d\s-]{10,15}$/, "Enter the phone number used for the booking."),
  amount: z
    .string()
    .trim()
    .regex(/^\d{1,8}(\.\d{1,2})?$/, "Enter the amount paid in rupees.")
    .refine((v) => Number(v) > 0, "Amount must be greater than zero."),
  paidOn: z
    .string()
    .min(1, "Select the payment date.")
    .refine((v) => v <= todayISO(), "The payment date cannot be in the future."),
  transactionId: z
    .string()
    .trim()
    .min(4, "Enter the UTR / transaction ID from your payment app.")
    .max(40, "Transaction ID is too long."),
  method: z.string().min(1, "Select how you paid."),
  passengers: z.string().optional(),
  travelDate: z.string().optional(),
  remarks: z.string().trim().max(500, "Please keep remarks under 500 characters."),
});

type Values = z.infer<typeof schema>;

const readAsDataUrl = (file: File) =>
  new Promise<string | null>((resolve) => {
    if (file.size > 1.5 * 1024 * 1024) return resolve(null); // keep local storage light
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

export function PaymentProofForm({
  defaults,
  onSubmitted,
}: {
  defaults: { bookingNumber?: string; amount?: string; name?: string; phone?: string };
  onSubmitted: (record: PaymentSubmissionRecord) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState, setError } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      customerName: defaults.name ?? "",
      bookingNumber: defaults.bookingNumber ?? "",
      phone: defaults.phone ?? "",
      amount: defaults.amount ?? "",
      paidOn: todayISO(),
      transactionId: "",
      method: paymentMethodOptions[0].id,
      passengers: "",
      travelDate: "",
      remarks: "",
    },
  });

  const method = watch("method");

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const acceptHint = useMemo(
    () => `${paymentSettings.upload.formats.join(", ")} · up to ${paymentSettings.upload.maxMb} MB`,
    [],
  );

  const pickFile = (selected: File | null) => {
    if (!selected) {
      setFile(null);
      setFileError(null);
      return;
    }
    if (!paymentSettings.upload.mimeTypes.includes(selected.type)) {
      setFileError(`Unsupported file type. Allowed: ${paymentSettings.upload.formats.join(", ")}.`);
      setFile(null);
      return;
    }
    if (selected.size > maxBytes) {
      setFileError(`File is too large. Maximum size is ${paymentSettings.upload.maxMb} MB.`);
      setFile(null);
      return;
    }
    setFileError(null);
    setFile(selected);
  };

  const onError = (errors: Record<string, any>) => {
    const missingLabels: string[] = [];
    if (errors.customerName) missingLabels.push("Full Name");
    if (errors.bookingNumber) missingLabels.push("Booking Number");
    if (errors.phone) missingLabels.push("Phone Number");
    if (errors.amount) missingLabels.push("Amount Paid");
    if (errors.paidOn) missingLabels.push("Payment Date");
    if (errors.transactionId) missingLabels.push("Transaction / UTR ID");

    toast.error("Please fill in the required fields", {
      description: `Missing: ${missingLabels.slice(0, 3).join(", ")}${
        missingLabels.length > 3 ? ` and ${missingLabels.length - 3} more` : ""
      }.`,
    });

    const fieldOrder = [
      "pay-name",
      "pay-booking",
      "pay-phone",
      "pay-amount",
      "pay-date",
      "pay-txn",
    ];
    for (const id of fieldOrder) {
      const el = document.getElementById(id);
      if (el && el.getAttribute("aria-invalid") === "true") {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus();
        break;
      }
    }
  };

  const onSubmit = async (values: Values) => {
    const link = validateBookingLink(values.bookingNumber, values.phone);
    if (link.state === "mismatch") {
      setError("phone", {
        message:
          "This phone number doesn't match the booking. Use the number on the booking, or call us for help.",
      });
      toast.error("We couldn't match that booking number and phone number.");
      return;
    }

    const duplicate = findDuplicateTransaction(values.transactionId);
    if (duplicate) {
      setError("transactionId", {
        message: `This transaction ID was already submitted (${duplicate.reference}).`,
      });
      toast.error("Duplicate transaction ID.");
      return;
    }

    const reference = makePaymentReference();
    const screenshot: PaymentScreenshotRef | null = file
      ? {
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          storagePath: screenshotStoragePath(reference, file.name),
          dataUrl: await readAsDataUrl(file),
        }
      : null;

    const now = new Date().toISOString();
    const base: PaymentSubmissionRecord = {
      reference,
      createdAt: now,
      updatedAt: now,
      status: "pending-verification",
      source: "web:/qr-payment",
      bookingNumber: values.bookingNumber.trim().toUpperCase(),
      bookingType: bookingTypeOf(values.bookingNumber),
      bookingLinkState: link.state,
      customerName: values.customerName,
      phone: values.phone,
      amount: Number(values.amount),
      paidOn: values.paidOn,
      transactionId: values.transactionId.trim(),
      remarks: values.remarks,
      method: paymentMethodOptions.find((m) => m.id === values.method)?.label ?? values.method,
      screenshot,
      verifiedBy: null,
      verifiedAt: null,
      rejectionReason: null,
      notifiedAdminAt: null,
      acknowledgementSentAt: null,
    };

    const record = { ...base, ...queuePaymentNotifications(base) };
    savePaymentSubmission(record);
    toast.success("Payment proof submitted — pending verification.", {
      description: `Reference: ${record.reference}. Our accounts team will verify shortly.`,
    });
    onSubmitted(record);
  };

  const err = formState.errors;

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Submit your payment proof</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Fields marked with <span className="text-destructive font-bold">*</span> are required. We verify against your booking before anything is marked paid.
      </p>

      <form onSubmit={handleSubmit(onSubmit, onError)} className="mt-5 space-y-4" noValidate>
        <div className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-name">Full name <span className="text-destructive">*</span></Label>
            <Input id="pay-name" autoComplete="name" {...register("customerName")} aria-invalid={!!err.customerName} />
            {err.customerName ? <p className="text-xs text-destructive">{err.customerName.message}</p> : null}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-booking">Booking number <span className="text-destructive">*</span></Label>
            <Input
              id="pay-booking"
              placeholder="SZT-HB-260729-1234"
              {...register("bookingNumber")}
              aria-invalid={!!err.bookingNumber}
            />
            {err.bookingNumber ? <p className="text-xs text-destructive">{err.bookingNumber.message}</p> : null}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-phone">Phone number on the booking <span className="text-destructive">*</span></Label>
            <Input id="pay-phone" inputMode="tel" autoComplete="tel" {...register("phone")} aria-invalid={!!err.phone} />
            {err.phone ? <p className="text-xs text-destructive">{err.phone.message}</p> : null}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-amount">Amount paid (₹) <span className="text-destructive">*</span></Label>
            <Input id="pay-amount" inputMode="decimal" {...register("amount")} aria-invalid={!!err.amount} />
            {err.amount ? <p className="text-xs text-destructive">{err.amount.message}</p> : null}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-date">Payment date <span className="text-destructive">*</span></Label>
            <Input id="pay-date" type="date" max={todayISO()} {...register("paidOn")} aria-invalid={!!err.paidOn} />
            {err.paidOn ? <p className="text-xs text-destructive">{err.paidOn.message}</p> : null}
          </div>

          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-txn">Transaction / UTR ID <span className="text-destructive">*</span></Label>
            <Input id="pay-txn" placeholder="e.g. 423456789012" {...register("transactionId")} aria-invalid={!!err.transactionId} />
            {err.transactionId ? <p className="text-xs text-destructive">{err.transactionId.message}</p> : null}
          </div>

          <div className="min-w-0 space-y-1.5 sm:col-span-2">
            <Label htmlFor="pay-method">How did you pay?</Label>
            <Select value={method} onValueChange={(v) => setValue("method", v, { shouldValidate: true })}>
              <SelectTrigger id="pay-method" aria-label="Payment method">
                <SelectValue placeholder="Select a payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Number of passengers */}
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-passengers">Number of passengers <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Select onValueChange={(v) => setValue("passengers", v, { shouldValidate: true })}>
              <SelectTrigger id="pay-passengers" aria-label="Number of passengers">
                <SelectValue placeholder="Select passengers" />
              </SelectTrigger>
              <SelectContent>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} {n === 1 ? "Passenger" : "Passengers"}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Travel / trip date */}
          <div className="min-w-0 space-y-1.5">
            <Label htmlFor="pay-travel-date">Travel / trip date <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Input id="pay-travel-date" type="date" {...register("travelDate")} />
          </div>
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="pay-file">Payment screenshot / receipt</Label>
          <input
            ref={fileInput}
            id="pay-file"
            type="file"
            accept={paymentSettings.upload.accept}
            className="sr-only"
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-border p-3">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
              <Paperclip className="mr-2 h-4 w-4" aria-hidden="true" />
              {file ? "Change file" : "Choose file"}
            </Button>
            <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
              {file ? `${file.name} · ${(file.size / 1024).toFixed(0)} KB` : `No file chosen — ${acceptHint}`}
            </span>
            {file ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                aria-label="Remove attached file"
                onClick={() => {
                  pickFile(null);
                  if (fileInput.current) fileInput.current.value = "";
                }}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
          </div>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview of the payment screenshot you attached"
              loading="lazy"
              className="mt-2 max-h-48 w-auto rounded-lg border border-border object-contain"
            />
          ) : null}
          {fileError ? <p className="text-xs text-destructive">{fileError}</p> : null}
          <p className="text-xs text-muted-foreground">
            Stored privately — only our accounts team can open it during verification.
          </p>
        </div>

        <div className="min-w-0 space-y-1.5">
          <Label htmlFor="pay-remarks">Remarks (optional)</Label>
          <Textarea id="pay-remarks" rows={3} placeholder="Anything we should know about this payment" {...register("remarks")} />
          {err.remarks ? <p className="text-xs text-destructive">{err.remarks.message}</p> : null}
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <div className="space-y-1">
            <p>
              Submitting this form records a payment claim only. Your booking stays unpaid until our
              team verifies the transaction with the bank (usually within{" "}
              {paymentSettings.verificationSlaHours} working hours, {paymentSettings.deskHours}).
            </p>
            <p className="font-semibold text-foreground text-[11px] pt-1 border-t border-border/60">
              {company.name} · {company.msmeRegistration}
            </p>
          </div>
        </div>

        {Object.keys(err).length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
            <div className="space-y-1">
              <span className="font-bold block">Please fill in the required fields above to submit:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {err.customerName && <li>Full Name: {err.customerName.message}</li>}
                {err.bookingNumber && <li>Booking Number: {err.bookingNumber.message}</li>}
                {err.phone && <li>Phone Number: {err.phone.message}</li>}
                {err.amount && <li>Amount: {err.amount.message}</li>}
                {err.paidOn && <li>Payment Date: {err.paidOn.message}</li>}
                {err.transactionId && <li>Transaction / UTR ID: {err.transactionId.message}</li>}
              </ul>
            </div>
          </div>
        )}

        <Button type="submit" className="w-full h-11 text-xs sm:text-sm font-bold shadow-md" disabled={formState.isSubmitting}>
          {formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Submitting…
            </>
          ) : (
            <>
              <FileCheck2 className="mr-2 h-4 w-4" aria-hidden="true" />
              Submit payment proof
            </>
          )}
        </Button>
      </form>
    </Card>
  );
}
