import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Image as ImageIcon, Loader2, Edit2, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, Check, Upload } from 'lucide-react';
import { resolveHeroImage, originalHeroPresets } from '@/lib/image-map';
import { useRef } from 'react';

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
  badge: '',
  image_desktop: '',
  image_mobile: '',
  primary_cta_label: 'Book Now',
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Compress using canvas
      const img = new Image();
      img.onload = () => {
        const MAX = 1920;
        let { width, height } = img;
        if (width > MAX) { height = Math.round(height * MAX / width); width = MAX; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        setForm(f => ({ ...f, image_desktop: canvas.toDataURL('image/jpeg', 0.85) }));
        toast.success('Image uploaded and ready!');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!form.heading) {
      toast.error('Heading is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        heading: form.heading,
        description: form.description,
        badge: form.badge || null,
        image_desktop: form.image_desktop || null,
        image_mobile: form.image_mobile || form.image_desktop || null,
        primary_cta_label: form.primary_cta_label,
        primary_cta_href: form.primary_cta_href,
        active: form.active,
        display_order: +form.display_order,
      };

      if (editId) {
        const { error } = await supabase.from('hero_slides').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Hero slide updated successfully!');
      } else {
        const { error } = await supabase.from('hero_slides').insert(payload);
        if (error) throw error;
        toast.success('New hero slide is live on the website!');
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

  async function toggleActive(slide: HeroSlide) {
    await supabase.from('hero_slides').update({ active: !slide.active }).eq('id', slide.id);
    fetchSlides();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Homepage Hero Carousel</h1>
          <p className="text-sm text-gray-500">Manage hero slides shown at the top of the homepage. Upload your own images.</p>
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
          <Plus size={16} /> Add New Slide
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {slides.map((slide, idx) => {
            const resolvedImg = resolveHeroImage(slide.image_desktop, slide.heading);
            return (
              <Card key={slide.id} className="overflow-hidden group hover:shadow-lg transition-shadow border">
                {/* Hero Preview — matches frontend exactly */}
                <div className="relative h-52 bg-gray-900 overflow-hidden">
                  <img
                    src={resolvedImg}
                    alt={slide.heading}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {/* Gradient overlay matching frontend */}
                  <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/30 sm:bg-gradient-to-r sm:from-background/90 sm:via-background/60 sm:to-background/10" />
                  {/* Content overlay */}
                  <div className="absolute inset-0 flex flex-col justify-end p-4 text-foreground">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1 min-w-0">
                        {slide.badge && (
                          <span className="inline-flex rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-primary-foreground mb-1">
                            {slide.badge}
                          </span>
                        )}
                        <h3 className="font-extrabold text-base leading-tight line-clamp-2">{slide.heading}</h3>
                        {slide.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{slide.description}</p>
                        )}
                        <div className="flex gap-1.5 mt-2">
                          <span className="inline-flex items-center rounded bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                            {slide.primary_cta_label || 'Book Now'}
                          </span>
                          <span className="inline-flex items-center rounded border border-foreground/30 px-2 py-0.5 text-[10px] font-semibold text-foreground/80">
                            Talk to a Planner
                          </span>
                        </div>
                      </div>
                      <span className="shrink-0 text-xs bg-black/50 text-white px-2 py-0.5 rounded font-mono">
                        #{slide.display_order}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <CardContent className="p-3 flex items-center justify-between bg-white border-t gap-2">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => moveOrder(slide.id, 'up')} disabled={idx === 0}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Move Up">
                      <ChevronUp size={15} />
                    </button>
                    <button onClick={() => moveOrder(slide.id, 'down')} disabled={idx === slides.length - 1}
                      className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30" title="Move Down">
                      <ChevronDown size={15} />
                    </button>
                    <button
                      onClick={() => toggleActive(slide)}
                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                        slide.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      title={slide.active ? 'Click to hide' : 'Click to publish'}
                    >
                      {slide.active ? <Eye size={11} /> : <EyeOff size={11} />}
                      {slide.active ? 'Live' : 'Hidden'}
                    </button>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-600 text-xs flex items-center gap-1"
                      onClick={() => {
                        setEditId(slide.id);
                        setForm({
                          heading: slide.heading,
                          description: slide.description || '',
                          badge: slide.badge || '',
                          image_desktop: slide.image_desktop || '',
                          image_mobile: slide.image_mobile || '',
                          primary_cta_label: slide.primary_cta_label || 'Book Now',
                          primary_cta_href: slide.primary_cta_href || '/fleet',
                          active: slide.active,
                          display_order: slide.display_order,
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      className="p-1.5 rounded hover:bg-red-50 text-red-500 text-xs flex items-center gap-1"
                      onClick={() => setDeleteId(slide.id)}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Hero Slide' : 'Add New Hero Slide'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">

            {/* Image Section — Preset Picker + Upload */}
            <div className="col-span-2 border rounded-xl p-4 bg-gray-50 space-y-3">
              <Label className="font-semibold text-sm block">Hero Background Image *</Label>

              {/* Built-in AI-generated images */}
              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Choose a built-in South Zoom image:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {originalHeroPresets.map((preset) => {
                    const isSelected = form.image_desktop === preset.filename || form.image_desktop === preset.value;
                    return (
                      <button
                        key={preset.filename}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, image_desktop: preset.filename }))}
                        className={`relative rounded-xl overflow-hidden border-2 text-left transition-all ${
                          isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <img src={preset.value} alt={preset.label} className="h-20 w-full object-cover" />
                        <div className="px-2 py-1.5 bg-white">
                          <p className="text-[11px] font-semibold text-gray-700 truncate">{preset.label}</p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-1.5 right-1.5 bg-orange-500 text-white rounded-full p-0.5 shadow">
                            <Check size={11} />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload your own image */}
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2 font-medium">Or upload your own photo:</p>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2 bg-white">
                  <Upload size={14} /> Upload from Computer (JPG / PNG)
                </Button>
                {form.image_desktop && form.image_desktop.startsWith('data:') && (
                  <p className="text-xs text-green-600 mt-1.5 font-medium">✓ Custom photo uploaded — will be saved with this slide</p>
                )}
              </div>
            </div>

            {/* Live Preview matching frontend */}
            {(form.image_desktop || form.heading) && (
              <div className="col-span-2">
                <p className="text-xs text-gray-500 mb-1.5 font-medium">Live Preview (matches homepage):</p>
                <div className="relative h-44 w-full rounded-xl overflow-hidden border shadow-sm bg-gray-900">
                  <img
                    src={resolveHeroImage(form.image_desktop, form.heading)}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background/70 to-background/20 sm:bg-gradient-to-r sm:from-background/90 sm:via-background/60 sm:to-background/10" />
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    {form.badge && (
                      <span className="inline-flex w-fit rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-primary-foreground mb-1.5">
                        {form.badge}
                      </span>
                    )}
                    <h3 className="font-extrabold text-lg leading-tight text-foreground">
                      {form.heading || 'Your heading here'}
                    </h3>
                    {form.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{form.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                        {form.primary_cta_label || 'Book Now'}
                      </span>
                      <span className="inline-flex items-center rounded-md border border-foreground/30 px-3 py-1 text-xs font-semibold text-foreground/80">
                        Talk to a Planner
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="col-span-2 space-y-1">
              <Label>Heading / Main Title *</Label>
              <Input
                value={form.heading}
                placeholder="e.g. Car rentals across South India"
                onChange={(e) => setForm((f) => ({ ...f, heading: e.target.value }))}
              />
            </div>

            <div className="space-y-1">
              <Label>Promo Badge (optional)</Label>
              <Input
                value={form.badge}
                placeholder="e.g. New — Tempo Travellers"
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
              <Label>Active — Visible in the homepage hero carousel</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
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
            <AlertDialogDescription>This slide will be removed from the public website immediately.</AlertDialogDescription>
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

