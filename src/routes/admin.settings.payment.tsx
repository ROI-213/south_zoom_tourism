import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, QrCode, CreditCard, RefreshCw, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { AdminImageUpload } from '@/components/admin/admin-image-upload';
import { applyDbPaymentSettingsToMemory, buildUpiPayload } from '@/content/payment';

export const Route = createFileRoute('/admin/settings/payment')({
  component: PaymentSettingsPage,
});

type PaymentSettings = {
  upi_id: string;
  account_holder: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  branch: string;
  account_type: string;
  qr_image_url: string;
  payment_instructions: string;
  advance_percentage: number;
};

const defaults: PaymentSettings = {
  upi_id: 'southzoom@upi',
  account_holder: 'South Zoom Tourism Pvt Ltd',
  bank_name: 'HDFC Bank',
  account_number: '50200088991234',
  ifsc_code: 'HDFC0001234',
  branch: 'Electronic City, Bengaluru',
  account_type: 'Current Account',
  qr_image_url: '',
  payment_instructions: 'Pay 30% booking advance via UPI or Direct Bank Transfer, and share receipt on WhatsApp (+91 8884015512) with your Booking Reference.',
  advance_percentage: 30,
};

function PaymentSettingsPage() {
  const [form, setForm] = useState<PaymentSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('website_settings').select('value').eq('key', 'payment_settings').single().then(({ data }) => {
      if (data?.value) {
        setForm({ ...defaults, ...data.value });
        applyDbPaymentSettingsToMemory(data.value);
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const { error } = await supabase.from('website_settings').upsert({
        key: 'payment_settings',
        value: form,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      applyDbPaymentSettingsToMemory(form);
      toast.success('Payment settings saved! QR code and bank transfer details on public website are now updated.');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save payment settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>;

  const dynamicUpiPayload = `upi://pay?pa=${encodeURIComponent(form.upi_id || 'southzoom@upi')}&pn=${encodeURIComponent(form.account_holder || 'South Zoom Tourism Pvt Ltd')}&cu=INR`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Payment &amp; QR Settings</h1>
        <p className="text-sm text-gray-500">Configure UPI, bank details and QR code shown to customers</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard size={16}/>UPI &amp; Bank Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label>UPI ID</Label><Input value={form.upi_id} placeholder="yourname@upi" onChange={e => setForm(f => ({...f, upi_id: e.target.value}))}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Account Holder Name</Label><Input value={form.account_holder} onChange={e => setForm(f => ({...f, account_holder: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Bank Name</Label><Input value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Account Number</Label><Input value={form.account_number} onChange={e => setForm(f => ({...f, account_number: e.target.value}))}/></div>
            <div className="space-y-1"><Label>IFSC Code</Label><Input value={form.ifsc_code} onChange={e => setForm(f => ({...f, ifsc_code: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Branch</Label><Input value={form.branch} placeholder="e.g. Electronic City, Bengaluru" onChange={e => setForm(f => ({...f, branch: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Account Type</Label><Input value={form.account_type} placeholder="Current Account / Savings" onChange={e => setForm(f => ({...f, account_type: e.target.value}))}/></div>
          </div>
          <div className="space-y-1"><Label>Advance Required (%)</Label>
            <div className="flex items-center gap-3">
              <Input type="number" min={0} max={100} value={form.advance_percentage} onChange={e => setForm(f => ({...f, advance_percentage: +e.target.value}))} className="w-24"/>
              <span className="text-sm text-gray-500">% of total fare collected upfront</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><QrCode size={16}/>Payment QR Code</CardTitle>
            {form.qr_image_url ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-xs text-orange-600 border-orange-200 hover:bg-orange-50 gap-1.5"
                onClick={() => {
                  setForm(f => ({ ...f, qr_image_url: '' }));
                  toast.info('Switched to dynamic auto-generated UPI QR code. Click Save to publish.');
                }}
              >
                <RefreshCw size={12} />
                Use Auto-Generated QR Code
              </Button>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <CheckCircle2 size={12} /> Dynamic UPI QR Code Active
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-5 items-start bg-muted/40 p-4 rounded-xl border border-border/60">
            <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-border shadow-xs shrink-0 self-center sm:self-start">
              {form.qr_image_url ? (
                <img
                  src={form.qr_image_url}
                  alt="QR Code Preview"
                  className="w-36 h-36 object-contain rounded"
                />
              ) : (
                <QRCodeSVG
                  value={dynamicUpiPayload}
                  size={144}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  marginSize={1}
                />
              )}
              <span className="text-[11px] font-mono text-muted-foreground mt-2 max-w-[150px] truncate text-center">
                {form.upi_id || 'southzoom@upi'}
              </span>
            </div>

            <div className="flex-1 space-y-3 w-full">
              <AdminImageUpload
                label="Custom QR Code Artwork (Optional)"
                value={form.qr_image_url || ''}
                onChange={(url) => setForm(f => ({ ...f, qr_image_url: url }))}
                placeholder="https://... or upload custom payment QR"
                aspectRatioHint="Upload a Google Pay, PhonePe, or Paytm QR code image. If left empty, a live, scannable UPI QR code will be generated automatically."
              />
              {!form.qr_image_url && (
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The website will automatically generate and display a sharp, scannable UPI QR code for <strong className="text-foreground">{form.upi_id}</strong>. Customers scanning with any UPI app (GPay, PhonePe, Paytm, BHIM) will pay directly to your account.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <Label>Payment Instructions</Label>
            <Textarea rows={3} value={form.payment_instructions} onChange={e => setForm(f => ({...f, payment_instructions: e.target.value}))}/>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin"/>Saving...</> : <><Save size={14}/>Save Payment Settings</>}
        </Button>
      </div>
    </div>
  );
}
