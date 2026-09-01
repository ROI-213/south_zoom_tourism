import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Image as ImageIcon, Loader2, Edit2, Trash2, Upload, ChevronUp, ChevronDown, Check } from 'lucide-react';
import { originalHeroPresets, resolveHeroImage } from '@/lib/image-map';

export const Route = createFileRoute('/admin/content/hero')({
  component: HeroSlidesPage,
});

type HeroSlide = {
  id: string;
  heading: string;
  description?: string;
  badge?: string;
  image_desktop: string;
  image_mobile?: string;
  primary_cta_label?: string;
  primary_cta_href?: string;
  active: boolean;
  display_order: number;
  created_at: string;
};

const emptyForm = {
  heading: '',
  description: '',
  badge: 'Special Offer',
  image_desktop: originalHeroPresets[0].filename,
  image_mobile: '',
  primary_cta_label: 'Book a Vehicle',
  primary_cta_href: '/fleet',
  active: true,
  display_order: 1,
};

function HeroSlidesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  async function fetchSlides() {
    setLoading(true);
    const { data } = await supabase
      .from('hero_slides')
      .select('*')
      .order('display_order', { ascending: true });
    setSlides(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setForm((f) => ({ ...f, image_desktop: reader.result as string }));
        toast.success('Image loaded from your computer!');
      }
    };
    reader.readAsDataURL(file);
  };

  async function handleSave() {
    if (!form.heading || !form.image_desktop) {
      toast.error('Heading and image are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        heading: form.heading,
        description: form.description,
        badge: form.badge,
        image_desktop: form.image_desktop,
        image_mobile: form.image_mobile || form.image_desktop,
        primary_cta_label: form.primary_cta_label,
        primary_cta_href: form.primary_cta_href,
        active: form.active,
        display_order: +form.display_order,
      };

      if (editId) {
        await supabase.from('hero_slides').update(payload).eq('id', editId);
        toast.success('Hero slide updated');
      } else {
        await supabase.from('hero_slides').insert(payload);
        toast.success('New Hero slide created and live on website');
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
      fetchSlides();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save slide');
    } finally {
      setSaving(false);
    }
  }

  async function moveOrder(id: string, direction: 'up' | 'down') {
    const idx = slides.findIndex((s) => s.id === id);
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;

    const current = slides[idx];
    const target = slides[targetIdx];

    await Promise.all([
      supabase.from('hero_slides').update({ display_order: target.display_order }).eq('id', current.id),
      supabase.from('hero_slides').update({ display_order: current.display_order }).eq('id', target.id),
    ]);
    fetchSlides();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Homepage Hero Carousel</h1>
          <p className="text-sm text-gray-500">Manage large hero slides, banners, and call-to-actions on the homepage</p>
        </div>
        <Button
          onClick={() => {
            const nextOrder = slides.length > 0 ? Math.max(...slides.map((s) => s.display_order)) + 1 : 1;
            setForm({ ...emptyForm, display_order: nextOrder });
            setEditId(null);
            setDialogOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus size={16} /> Add New Hero Slide
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" />
        </div>
      ) : slides.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-400">
            <ImageIcon className="mx-auto mb-2 opacity-30" size={36} />
            <p>No hero slides configured. Add one to activate the carousel.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map((slide, idx) => (
            <Card key={slide.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-48 bg-gray-900">
                <img
                  src={resolveHeroImage(slide.image_desktop)}
                  alt={slide.heading}
                  className="w-full h-full object-cover opacity-80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = originalHeroPresets[0].value;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4 flex flex-col justify-end text-white">
                  <div className="flex items-center justify-between mb-1">
                    {slide.badge && (
                      <span className="text-[11px] font-semibold bg-orange-500 text-white px-2.5 py-0.5 rounded-full">
                        {slide.badge}
                      </span>
                    )}
                    <span className="text-xs bg-black/60 px-2 py-0.5 rounded font-mono">
                      #{slide.display_order}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{slide.heading}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1">{slide.description}</p>
                </div>
              </div>
              <CardContent className="p-3.5 flex items-center justify-between bg-white border-t">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => moveOrder(slide.id, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    title="Move Up"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveOrder(slide.id, 'down')}
                    disabled={idx === slides.length - 1}
                    className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    title="Move Down"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${slide.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.active ? 'Live' : 'Hidden'}
                  </span>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 text-gray-700"
                    onClick={() => {
                      setEditId(slide.id);
                      setForm({
                        heading: slide.heading,
                        description: slide.description || '',
                        badge: slide.badge || '',
                        image_desktop: slide.image_desktop,
                        image_mobile: slide.image_mobile || '',
                        primary_cta_label: slide.primary_cta_label || 'Book Now',
                        primary_cta_href: slide.primary_cta_href || '/fleet',
                        active: slide.active,
                        display_order: slide.display_order,
                      });
                      setDialogOpen(true);
                    }}
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                    onClick={() => setDeleteId(slide.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Hero Slide' : 'Add New Hero Section Slide'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Heading / Main Title *</Label>
              <Input
                value={form.heading}
                placeholder="e.g. Car rentals across South India"
                onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Promo Badge</Label>
              <Input
                value={form.badge}
                placeholder="e.g. Flat 10% off on round trips"
                onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Display Order</Label>
              <Input
                type="number"
                value={form.display_order}
                onChange={(e) => setForm((f) => ({ ...f, display_order: +e.target.value }))}
              />
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Description / Subtext</Label>
              <Textarea
                rows={2}
                value={form.description}
                placeholder="Well-maintained sedans, SUVs and tempo travellers..."
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Image Selection Section */}
            <div className="col-span-2 border rounded-xl p-4 bg-gray-50 space-y-3">
              <Label className="font-semibold text-sm">Hero Background Image</Label>

              {/* Option A: Pick an original website preset */}
              <div>
                <p className="text-xs text-gray-500 mb-1.5 font-medium">1. Choose an Original Website Banner:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {originalHeroPresets.map((preset) => {
                    const isSelected = form.image_desktop === preset.filename || form.image_desktop.includes(preset.filename);
                    return (
                      <button
                        key={preset.filename}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, image_desktop: preset.filename }))}
                        className={`relative rounded-lg overflow-hidden border-2 text-left p-1 transition-all ${
                          isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img src={preset.value} alt={preset.label} className="h-16 w-full object-cover rounded" />
                        <div className="text-[11px] font-medium mt-1 truncate text-gray-700">{preset.label}</div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full p-0.5">
                            <Check size={10} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option B: Upload new custom file */}
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1.5 font-medium">2. Or Upload a New Image from Your Computer:</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="gap-2 bg-white"
                >
                  <Upload size={14} /> Upload Image File (JPG / PNG)
                </Button>
              </div>

              {/* Option C: Custom URL */}
              <div className="pt-2 border-t space-y-1">
                <p className="text-xs text-gray-500 font-medium">3. Or Enter Custom Image URL:</p>
                <Input
                  value={form.image_desktop}
                  placeholder="https://... or /src/assets/..."
                  onChange={(e) => setForm((f) => ({ ...f, image_desktop: e.target.value }))}
                />
              </div>

              {/* Live Image Preview */}
              {form.image_desktop && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Live Preview:</p>
                  <div className="relative h-32 w-full rounded-lg overflow-hidden border">
                    <img
                      src={resolveHeroImage(form.image_desktop)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 flex flex-col justify-end text-white">
                      <div className="text-xs font-bold">{form.heading || 'Heading Preview'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Primary Button Text</Label>
              <Input
                value={form.primary_cta_label}
                placeholder="e.g. Book a Vehicle"
                onChange={(e) => setForm((f) => ({ ...f, primary_cta_label: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Primary Button Link</Label>
              <Input
                value={form.primary_cta_href}
                placeholder="e.g. /fleet"
                onChange={(e) => setForm((f) => ({ ...f, primary_cta_href: e.target.value }))}
              />
            </div>

            <div className="col-span-2 flex items-center gap-3 pt-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <Label>Active (Visible in Homepage Carousel)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Saving...</> : 'Save Slide'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Slide?</AlertDialogTitle>
            <AlertDialogDescription>This slide will be removed from the public website.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await supabase.from('hero_slides').delete().eq('id', deleteId!);
                toast.success('Slide removed');
                setDeleteId(null);
                fetchSlides();
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
