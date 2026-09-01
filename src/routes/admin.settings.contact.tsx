import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, Phone, Mail, MapPin, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';

export const Route = createFileRoute('/admin/settings/contact')({
  component: ContactSettingsPage,
});

type ContactSettings = {
  company_name: string; phone: string; whatsapp: string; email: string;
  address: string; google_maps_url: string; business_hours: string; support_hours: string;
  facebook_url: string; instagram_url: string; youtube_url: string;
};

const defaults: ContactSettings = {
  company_name: 'South Zoom Tourism', phone: '+91 6366357757', whatsapp: '916366357757',
  email: 'bookings@southzoomtourism.com', address: 'South Zoom Tourism, #8, Srinivasa Building, Anchepalya Main Road, TG Halli, Bengaluru – 560073, Karnataka.',
  google_maps_url: '', business_hours: 'Mon – Sun · 24×7 Service', support_hours: '24×7 Support',
  facebook_url: '', instagram_url: '', youtube_url: '',
};

function ContactSettingsPage() {
  const [form, setForm] = useState<ContactSettings>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('website_settings').select('value').eq('key', 'contact_settings').single().then(({ data }) => {
      if (data?.value) setForm({ ...defaults, ...data.value });
      setLoading(false);
    });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('website_settings').upsert({ key: 'contact_settings', value: form, updated_at: new Date().toISOString() });
      toast.success('Contact settings saved! These will appear across the entire website.');
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Contact Information</h1>
        <p className="text-sm text-gray-500 mt-0.5">These details appear in the header, footer, contact page, and all CTAs across the website.</p>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-800">
        <strong>⚠️ Important:</strong> Changes saved here will immediately reflect across the public website — including the navigation bar phone number, WhatsApp buttons, footer, and contact page.
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Company Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label>Company Name</Label><Input value={form.company_name} onChange={e => setForm(f => ({...f, company_name: e.target.value}))}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label className="flex items-center gap-1.5"><Phone size={13}/>Phone Number</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}/></div>
            <div className="space-y-1"><Label className="flex items-center gap-1.5"><MessageCircle size={13}/>WhatsApp (number only)</Label><Input value={form.whatsapp} placeholder="916366357757" onChange={e => setForm(f => ({...f, whatsapp: e.target.value}))}/></div>
          </div>
          <div className="space-y-1"><Label className="flex items-center gap-1.5"><Mail size={13}/>Email</Label><Input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}/></div>
          <div className="space-y-1"><Label className="flex items-center gap-1.5"><MapPin size={13}/>Address</Label><Textarea rows={2} value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}/></div>
          <div className="space-y-1"><Label>Google Maps URL</Label><Input value={form.google_maps_url} placeholder="https://maps.google.com/..." onChange={e => setForm(f => ({...f, google_maps_url: e.target.value}))}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1"><Label>Business Hours</Label><Input value={form.business_hours} onChange={e => setForm(f => ({...f, business_hours: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Support Hours</Label><Input value={form.support_hours} onChange={e => setForm(f => ({...f, support_hours: e.target.value}))}/></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Social Media Links</CardTitle><CardDescription>Leave blank to hide</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1"><Label className="flex items-center gap-1.5"><Facebook size={13}/>Facebook URL</Label><Input value={form.facebook_url} placeholder="https://facebook.com/..." onChange={e => setForm(f => ({...f, facebook_url: e.target.value}))}/></div>
          <div className="space-y-1"><Label className="flex items-center gap-1.5"><Instagram size={13}/>Instagram URL</Label><Input value={form.instagram_url} placeholder="https://instagram.com/..." onChange={e => setForm(f => ({...f, instagram_url: e.target.value}))}/></div>
          <div className="space-y-1"><Label className="flex items-center gap-1.5"><Youtube size={13}/>YouTube URL</Label><Input value={form.youtube_url} placeholder="https://youtube.com/..." onChange={e => setForm(f => ({...f, youtube_url: e.target.value}))}/></div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin"/>Saving...</> : <><Save size={14}/>Save Contact Settings</>}
        </Button>
      </div>
    </div>
  );
}
