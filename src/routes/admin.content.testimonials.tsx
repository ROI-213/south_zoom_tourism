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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, Star, Loader2, Edit2, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/admin/content/testimonials')({
  component: TestimonialsPage,
});

type Testimonial = {
  id: string;
  customer_name: string;
  city?: string;
  trip_type?: string;
  rating: number;
  text: string;
  active: boolean;
  display_order: number;
  created_at: string;
};

const emptyForm = {
  customer_name: '',
  city: 'Bengaluru',
  trip_type: 'Outstation Trip',
  rating: 5,
  text: '',
  active: true,
  display_order: 1,
};

function TestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchItems() {
    setLoading(true);
    const { data } = await supabase
      .from('testimonials')
      .select('*')
      .order('display_order');
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = items.filter(
    (t) =>
      !search ||
      t.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      t.city?.toLowerCase().includes(search.toLowerCase()) ||
      t.text.toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave() {
    if (!form.customer_name || !form.text) {
      toast.error('Customer name and review text are required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        customer_name: form.customer_name,
        city: form.city,
        trip_type: form.trip_type,
        rating: +form.rating,
        text: form.text,
        active: form.active,
        display_order: +form.display_order,
      };

      if (editId) {
        await supabase.from('testimonials').update(payload).eq('id', editId);
        toast.success('Testimonial updated');
      } else {
        await supabase.from('testimonials').insert(payload);
        toast.success('Testimonial added');
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
      fetchItems();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save testimonial');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Customer Testimonials</h1>
          <p className="text-sm text-gray-500">Manage real customer reviews and ratings on the website</p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setDialogOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus size={16} /> Add Testimonial
        </Button>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search reviews by customer or city..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Star className="mx-auto mb-2 opacity-30" size={32} />
              <p>No testimonials found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Trip / City</th>
                    <th className="text-left px-4 py-3">Rating</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Review Text</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{t.customer_name}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {t.trip_type || 'Travel'} · {t.city || 'Bengaluru'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex text-yellow-400">
                          {Array(t.rating)
                            .fill(0)
                            .map((_, i) => (
                              <Star key={i} size={13} className="fill-yellow-400" />
                            ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell max-w-sm truncate">
                        "{t.text}"
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            t.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {t.active ? 'Approved' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            className="p-1.5 rounded hover:bg-gray-100"
                            onClick={() => {
                              setEditId(t.id);
                              setForm({
                                customer_name: t.customer_name,
                                city: t.city || '',
                                trip_type: t.trip_type || '',
                                rating: t.rating,
                                text: t.text,
                                active: t.active,
                                display_order: t.display_order,
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            onClick={() => setDeleteId(t.id)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1">
              <Label>Customer Name *</Label>
              <Input
                value={form.customer_name}
                placeholder="e.g. Ramesh Kumar"
                onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Location / City</Label>
              <Input
                value={form.city}
                placeholder="e.g. Bengaluru"
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Trip Type</Label>
              <Input
                value={form.trip_type}
                placeholder="e.g. Ooty Tour, Airport Cab"
                onChange={(e) => setForm((f) => ({ ...f, trip_type: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Star Rating</Label>
              <Select value={String(form.rating)} onValueChange={(v) => setForm((f) => ({ ...f, rating: +v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 4, 3, 2, 1].map((r) => (
                    <SelectItem key={r} value={String(r)}>
                      {r} Stars
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <Label>Review Text *</Label>
              <Textarea
                rows={3}
                value={form.text}
                placeholder="Write customer feedback..."
                onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Switch checked={form.active} onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))} />
              <Label>Approved / Public</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Saving...</> : 'Save Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Testimonial?</AlertDialogTitle>
            <AlertDialogDescription>This testimonial will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await supabase.from('testimonials').delete().eq('id', deleteId!);
                toast.success('Testimonial deleted');
                setDeleteId(null);
                fetchItems();
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
