import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, Plus, Trash2, Navigation } from 'lucide-react';

export const Route = createFileRoute('/admin/content/navigation')({
  component: NavigationAdminPage,
});

type NavLink = {
  label: string;
  to: string;
  active: boolean;
};

const defaultNav: NavLink[] = [
  { label: 'Home', to: '/', active: true },
  { label: 'Services', to: '/services', active: true },
  { label: 'Fleet', to: '/fleet', active: true },
  { label: 'Tour Packages', to: '/tour-packages', active: true },
  { label: 'Destinations', to: '/destinations', active: true },
  { label: 'Hotels & Rooms', to: '/hotels', active: true },
  { label: 'About Us', to: '/about-us', active: true },
  { label: 'Gallery', to: '/gallery', active: true },
  { label: 'Contact', to: '/contact-us', active: true },
];

function NavigationAdminPage() {
  const [navItems, setNavItems] = useState<NavLink[]>(defaultNav);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from('website_settings')
      .select('value')
      .eq('key', 'main_navigation')
      .single()
      .then(({ data }) => {
        if (data?.value && Array.isArray(data.value)) {
          setNavItems(data.value);
        }
        setLoading(false);
      });
  }, []);

  const addItem = () => {
    setNavItems((prev) => [...prev, { label: 'New Link', to: '/', active: true }]);
  };

  const updateItem = (index: number, key: keyof NavLink, value: any) => {
    setNavItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [key]: value } : item))
    );
  };

  const removeItem = (index: number) => {
    setNavItems((prev) => prev.filter((_, i) => i !== index));
  };

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from('website_settings').upsert({
        key: 'main_navigation',
        value: navItems,
        updated_at: new Date().toISOString(),
      });
      toast.success('Main navigation saved');
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
          <h1 className="text-xl font-bold">Header Navigation Menu</h1>
          <p className="text-sm text-gray-500">Configure main menu links displayed in top navbar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={addItem} className="gap-1.5">
            <Plus size={15} /> Add Link
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 gap-2">
            {saving ? <><Loader2 size={14} className="animate-spin" />Saving...</> : <><Save size={14} />Save Menu</>}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Navigation size={16} /> Navigation Items
          </CardTitle>
          <CardDescription>Order and label of items shown in public website header.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : (
            navItems.map((item, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                <span className="font-mono text-xs text-gray-400 w-5">#{index + 1}</span>
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <Input
                    value={item.label}
                    placeholder="Link Label"
                    onChange={(e) => updateItem(index, 'label', e.target.value)}
                  />
                  <Input
                    value={item.to}
                    placeholder="Route Path (e.g. /services)"
                    onChange={(e) => updateItem(index, 'to', e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={item.active}
                    onCheckedChange={(v) => updateItem(index, 'active', v)}
                  />
                  <button
                    onClick={() => removeItem(index)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
