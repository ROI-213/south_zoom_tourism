import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Save, AlignLeft } from 'lucide-react';

export const Route = createFileRoute('/admin/content/footer')({
  component: FooterAdminPage,
});

type FooterContent = {
  about_text: string;
  copyright: string;
  emergency_notice: string;
  registered_office: string;
};

const defaultFooter: FooterContent = {
  about_text:
    'South Zoom Tourism is Bengaluru’s premier travel and cab desk offering transparent cab bookings, verified drivers, custom tour itineraries, and partner-rate hotels across Karnataka, Tamil Nadu, Kerala, Andhra Pradesh, Goa, and Puducherry.',
  copyright: '© 2026 South Zoom Tourism. All rights reserved.',
  emergency_notice: '24×7 Road Assistance and Helpline available for on-trip guests.',
  registered_office: '#8, Srinivasa Building, Anchepalya Main Road, TG Halli, Bengaluru – 560073',
};

function FooterAdminPage() {
  const [form, setForm] = useState<FooterContent>(defaultFooter);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('website_settings')
      .select('value')
      .eq('key', 'footer_content')
      .single()
      .then(({ data }) => {
        if (data?.value) setForm({ ...defaultFooter, ...data.value });
        setLoading(false);
      });
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('website_settings').upsert({
        key: 'footer_content',
        value: form,
        updated_at: new Date().toISOString(),
      });
      toast.success('Footer content updated');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold">Footer Content Management</h1>
        <p className="text-sm text-gray-500">Configure legal text, address summary, and disclosures in the footer</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlignLeft size={16} /> Footer Text & Disclaimers
          </CardTitle>
          <CardDescription>Changes here appear in the footer section across all pages.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label>Footer About Summary</Label>
            <Textarea
              rows={4}
              value={form.about_text}
              onChange={(e) => setForm((f) => ({ ...f, about_text: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Registered Office Text</Label>
            <Input
              value={form.registered_office}
              onChange={(e) => setForm((f) => ({ ...f, registered_office: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Emergency Notice / 24x7 Banner</Label>
            <Input
              value={form.emergency_notice}
              onChange={(e) => setForm((f) => ({ ...f, emergency_notice: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Copyright Text</Label>
            <Input
              value={form.copyright}
              onChange={(e) => setForm((f) => ({ ...f, copyright: e.target.value }))}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Footer</>}
        </Button>
      </div>
    </div>
  );
}
