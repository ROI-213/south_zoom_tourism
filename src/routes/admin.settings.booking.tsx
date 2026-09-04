import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';
import { saveFleetAdvancePercentage, getFleetAdvancePercentage } from '@/content/fleet-pricing';

export const Route = createFileRoute('/admin/settings/booking')({
  component: BookingSettingsPage,
});

type BookingSettings = {
  booking_id_prefix: string; advance_percentage: number;
  gst_percentage: number; minimum_booking_amount: number;
  cancellation_policy: string; auto_confirm: boolean; max_passengers: number;
};

const defaults: BookingSettings = {
  booking_id_prefix: 'SZT', advance_percentage: 30, gst_percentage: 5,
  minimum_booking_amount: 500, cancellation_policy: 'Cancellations made 48 hours before the trip start time are eligible for a full refund. Cancellations within 24 hours are non-refundable.',
  auto_confirm: false, max_passengers: 50,
};

function BookingSettingsPage() {
  const [form, setForm] = useState<BookingSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('website_settings').select('value').eq('key', 'booking_settings').single().then(({ data }) => {
      const currentAdvance = getFleetAdvancePercentage();
      if (data?.value) {
        setForm({ ...defaults, advance_percentage: currentAdvance, ...data.value });
      } else {
        setForm({ ...defaults, advance_percentage: currentAdvance });
      }
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('website_settings').upsert({ key: 'booking_settings', value: form, updated_at: new Date().toISOString() });
      saveFleetAdvancePercentage(form.advance_percentage);
      toast.success('Booking settings saved and fleet pricing synced');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-xl font-bold">Booking Rules</h1><p className="text-sm text-gray-500">Configure booking behavior and financial rules</p></div>

      <Card>
        <CardHeader><CardTitle className="text-base">Financial Rules</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Booking ID Prefix</Label><Input value={form.booking_id_prefix} onChange={e => setForm(f => ({...f, booking_id_prefix: e.target.value}))}/><p className="text-xs text-gray-500">e.g. SZT-1234567890</p></div>
            <div className="space-y-1"><Label>Advance Required (%)</Label><Input type="number" min={0} max={100} value={form.advance_percentage} onChange={e => setForm(f => ({...f, advance_percentage: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>GST (%)</Label><Input type="number" min={0} max={28} value={form.gst_percentage} onChange={e => setForm(f => ({...f, gst_percentage: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Minimum Booking Amount (₹)</Label><Input type="number" min={0} value={form.minimum_booking_amount} onChange={e => setForm(f => ({...f, minimum_booking_amount: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Max Passengers</Label><Input type="number" min={1} value={form.max_passengers} onChange={e => setForm(f => ({...f, max_passengers: +e.target.value}))}/></div>
          </div>
          <div className="flex items-center gap-3 pt-2"><Switch checked={form.auto_confirm} onCheckedChange={v => setForm(f => ({...f, auto_confirm: v}))}/><Label>Auto-confirm bookings after payment</Label></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Cancellation Policy</CardTitle></CardHeader>
        <CardContent>
          <Textarea rows={4} value={form.cancellation_policy} onChange={e => setForm(f => ({...f, cancellation_policy: e.target.value}))}/>
          <p className="text-xs text-gray-500 mt-1">This text is shown to customers during booking and on the FAQ page</p>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin"/>Saving...</> : <><Save size={14}/>Save Booking Settings</>}
        </Button>
      </div>
    </div>
  );
}
