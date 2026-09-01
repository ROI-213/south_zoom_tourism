import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export const Route = createFileRoute('/admin/settings/general')({
  component: GeneralSettingsPage,
});

type GeneralSettings = {
  website_name: string; tagline: string; logo_url: string;
  currency: string; timezone: string; business_hours: string; support_email: string;
};

const defaults: GeneralSettings = {
  website_name: 'South Zoom Tourism',
  tagline: "Bengaluru's Premier South India Travel & Cab Desk",
  logo_url: '', currency: 'INR', timezone: 'Asia/Kolkata',
  business_hours: 'Mon – Sun · 24×7 Service', support_email: 'bookings@southzoomtourism.com',
};

function GeneralSettingsPage() {
  const [form, setForm] = useState<GeneralSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('website_settings').select('value').eq('key', 'general_settings').single().then(({ data }) => {
      if (data?.value) setForm({ ...defaults, ...data.value });
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('website_settings').upsert({ key: 'general_settings', value: form, updated_at: new Date().toISOString() });
      toast.success('General settings saved');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div><h1 className="text-xl font-bold">General Settings</h1><p className="text-sm text-gray-500">Basic website configuration</p></div>

      <Card>
        <CardHeader><CardTitle className="text-base">Site Identity</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label>Website Name</Label><Input value={form.website_name} onChange={e => setForm(f => ({...f, website_name: e.target.value}))}/></div>
          <div className="space-y-1"><Label>Tagline</Label><Input value={form.tagline} onChange={e => setForm(f => ({...f, tagline: e.target.value}))}/></div>
          <div className="space-y-1"><Label>Logo URL</Label><Input value={form.logo_url} placeholder="https://..." onChange={e => setForm(f => ({...f, logo_url: e.target.value}))}/></div>
          {form.logo_url && <img src={form.logo_url} alt="Logo preview" className="h-12 object-contain" onError={e => { (e.target as HTMLImageElement).style.display='none'; }}/>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Regional Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Currency</Label>
              <Select value={form.currency} onValueChange={v => setForm(f => ({...f, currency: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="INR">INR (₹)</SelectItem><SelectItem value="USD">USD ($)</SelectItem></SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Timezone</Label>
              <Select value={form.timezone} onValueChange={v => setForm(f => ({...f, timezone: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent><SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem></SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1"><Label>Business Hours</Label><Input value={form.business_hours} onChange={e => setForm(f => ({...f, business_hours: e.target.value}))}/></div>
          <div className="space-y-1"><Label>Support Email</Label><Input value={form.support_email} onChange={e => setForm(f => ({...f, support_email: e.target.value}))}/></div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin"/>Saving...</> : <><Save size={14}/>Save Settings</>}
        </Button>
      </div>
    </div>
  );
}
