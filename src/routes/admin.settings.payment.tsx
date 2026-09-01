import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, QrCode, CreditCard } from 'lucide-react';

export const Route = createFileRoute('/admin/settings/payment')({
  component: PaymentSettingsPage,
});

type PaymentSettings = {
  upi_id: string; account_holder: string; bank_name: string;
  account_number: string; ifsc_code: string; qr_image_url: string;
  payment_instructions: string; advance_percentage: number;
};

const defaults: PaymentSettings = {
  upi_id: '', account_holder: 'South Zoom Tourism', bank_name: '',
  account_number: '', ifsc_code: '', qr_image_url: '',
  payment_instructions: 'Please pay the advance amount via UPI or bank transfer and share the screenshot on WhatsApp.',
  advance_percentage: 30,
};

function PaymentSettingsPage() {
  const [form, setForm] = useState<PaymentSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('website_settings').select('value').eq('key', 'payment_settings').single().then(({ data }) => {
      if (data?.value) setForm({ ...defaults, ...data.value });
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('website_settings').upsert({ key: 'payment_settings', value: form, updated_at: new Date().toISOString() });
      toast.success('Payment settings saved! QR code on public website is now updated.');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Payment & QR Settings</h1>
        <p className="text-sm text-gray-500">Configure UPI, bank details and QR code shown to customers</p>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><CreditCard size={16}/>UPI & Bank Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label>UPI ID</Label><Input value={form.upi_id} placeholder="yourname@upi" onChange={e => setForm(f => ({...f, upi_id: e.target.value}))}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Account Holder Name</Label><Input value={form.account_holder} onChange={e => setForm(f => ({...f, account_holder: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Bank Name</Label><Input value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Account Number</Label><Input value={form.account_number} onChange={e => setForm(f => ({...f, account_number: e.target.value}))}/></div>
            <div className="space-y-1"><Label>IFSC Code</Label><Input value={form.ifsc_code} onChange={e => setForm(f => ({...f, ifsc_code: e.target.value}))}/></div>
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
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><QrCode size={16}/>QR Code</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label>QR Code Image URL</Label><Input value={form.qr_image_url} placeholder="https://..." onChange={e => setForm(f => ({...f, qr_image_url: e.target.value}))}/></div>
          {form.qr_image_url && (
            <div className="flex items-center gap-4">
              <img src={form.qr_image_url} alt="QR Preview" className="w-32 h-32 object-contain border rounded-lg p-1" onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>
              <div className="text-sm text-gray-500">This QR will be shown on the payment page</div>
            </div>
          )}
          <div className="space-y-1"><Label>Payment Instructions</Label><Textarea rows={3} value={form.payment_instructions} onChange={e => setForm(f => ({...f, payment_instructions: e.target.value}))}/></div>
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
