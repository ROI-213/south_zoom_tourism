import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Layout, Eye, EyeOff } from 'lucide-react';

export const Route = createFileRoute('/admin/content/homepage')({
  component: HomepageSectionsPage,
});

type SectionConfig = {
  key: string;
  name: string;
  description: string;
  visible: boolean;
};

const defaultSections: SectionConfig[] = [
  { key: 'hero_slider', name: 'Hero Carousel Slider', description: 'Large banners with CTAs at top of home page', visible: true },
  { key: 'travel_search', name: 'Quick Travel Booking Widget', description: 'Tabs for Cabs, Tours, Hotels, Outstation search', visible: true },
  { key: 'about_preview', name: 'About South Zoom Section', description: 'Company overview, statistics, and badges', visible: true },
  { key: 'services_grid', name: 'Featured Services Grid', description: 'Cabs, Airport, Outstation, Corporate, Packages cards', visible: true },
  { key: 'fleet_preview', name: 'Featured Fleet & Tariffs', description: 'Vehicle list with seats, bags, and starting rates', visible: true },
  { key: 'karnataka_slider', name: 'Karnataka Special Showcase', description: 'Featured Karnataka destinations slider', visible: true },
  { key: 'packages_preview', name: 'Popular Tour Packages', description: 'Package cards with prices, days/nights, and WhatsApp CTA', visible: true },
  { key: 'hotels_preview', name: 'Partner Hotels & Rooms', description: 'Hotel cards with star rating, room types, and price', visible: true },
  { key: 'destinations_grid', name: 'South India Destinations', description: 'Destinations categorized by State (KA, TN, KL, etc.)', visible: true },
  { key: 'why_choose_us', name: 'Why Choose Us / Features', description: '24x7 support, verified drivers, transparent fares', visible: true },
  { key: 'how_it_works', name: 'How It Works / 3-Step Flow', description: 'Select -> Confirm -> Travel step guide', visible: true },
  { key: 'testimonials', name: 'Customer Testimonials & Reviews', description: 'Verified customer reviews with ratings', visible: true },
  { key: 'gallery_preview', name: 'Photo Gallery Preview', description: 'India Through Our Lens photo grid', visible: true },
  { key: 'faqs', name: 'Frequently Asked Questions', description: 'Accordion of common travel & booking questions', visible: true },
  { key: 'final_cta', name: 'Bottom Action Banner', description: 'Call-to-action banner before footer', visible: true },
];

function HomepageSectionsPage() {
  const [sections, setSections] = useState<SectionConfig[]>(defaultSections);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('website_settings')
      .select('value')
      .eq('key', 'homepage_sections')
      .single()
      .then(({ data }) => {
        if (data?.value && Array.isArray(data.value)) {
          // Merge saved with defaults
          const merged = defaultSections.map((def) => {
            const saved = (data.value as SectionConfig[]).find((s) => s.key === def.key);
            return saved ? { ...def, visible: saved.visible } : def;
          });
          setSections(merged);
        }
        setLoading(false);
      });
  }, []);

  const toggleSection = (key: string) => {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, visible: !s.visible } : s))
    );
  };

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('website_settings').upsert({
        key: 'homepage_sections',
        value: sections,
        updated_at: new Date().toISOString(),
      });
      toast.success('Homepage layout preferences updated!');
    } catch (e: any) {
      toast.error(e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Homepage Section Management</h1>
          <p className="text-sm text-gray-500">Enable or disable specific sections on the public homepage</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
          {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Layout</>}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Layout size={16} /> Section Visibility Controls
          </CardTitle>
          <CardDescription>
            Toggle sections ON or OFF to control what displays on the public website home page.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : (
            sections.map((section, idx) => (
              <div
                key={section.key}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-400">#{idx + 1}</span>
                    <Label className="font-semibold cursor-pointer" onClick={() => toggleSection(section.key)}>
                      {section.name}
                    </Label>
                    {section.visible ? (
                      <span className="flex items-center gap-1 text-[11px] bg-green-50 text-green-700 px-1.5 py-0.2 rounded font-medium">
                        <Eye size={10} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] bg-gray-100 text-gray-500 px-1.5 py-0.2 rounded font-medium">
                        <EyeOff size={10} /> Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">{section.description}</p>
                </div>
                <Switch
                  checked={section.visible}
                  onCheckedChange={() => toggleSection(section.key)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
