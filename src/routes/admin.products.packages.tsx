import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Search, Package, Loader2, Edit2, Trash2, Star } from 'lucide-react';

export const Route = createFileRoute('/admin/products/packages')({
  component: PackagesPage,
});

const CATEGORIES = ['Nature', 'Heritage', 'Beach', 'Pilgrimage', 'Adventure', 'Backwater', 'Hill Station', 'Custom'];
type Package_ = { id: string; title: string; slug?: string; category?: string; nights: number; days: number; price_from: number; main_image?: string; active: boolean; featured: boolean; display_order?: number; created_at: string; destinations?: { name: string } | null; };
type Destination = { id: string; name: string; state: string; };
const emptyForm = { title: '', category: 'Nature', destination_id: '', nights: 1, days: 2, price_from: 0, main_image: '', highlights: '', active: true, featured: false, display_order: 0 };

function PackagesPage() {
  const [packages, setPackages] = useState<Package_[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    const [pkgRes, destRes] = await Promise.all([
      supabase.from('tour_packages').select('*, destinations(name)').order('display_order').order('created_at', { ascending: false }),
      supabase.from('destinations').select('id, name, state').order('name'),
    ]);
    setPackages(pkgRes.data || []);
    setDestinations(destRes.data || []);
    setLoading(false);
  }

  useEffect(() => { fetchAll(); }, []);

  const filtered = packages.filter(p => !search || p.title.toLowerCase().includes(search.toLowerCase()));

  async function handleSave() {
    if (!form.title) { toast.error('Title required'); return; }
    setSaving(true);
    try {
      const slug = form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        title: form.title, slug, category: form.category,
        destination_id: form.destination_id || null,
        nights: +form.nights, days: +form.days, price_from: +form.price_from,
        main_image: form.main_image || null,
        highlights: form.highlights ? form.highlights.split(',').map(h => h.trim()) : [],
        active: form.active, featured: form.featured, display_order: +form.display_order,
      };
      if (editId) { await supabase.from('tour_packages').update(payload).eq('id', editId); toast.success('Package updated'); }
      else { await supabase.from('tour_packages').insert(payload); toast.success('Package created'); }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetchAll();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function toggleFeatured(id: string, current: boolean) {
    await supabase.from('tour_packages').update({ featured: !current }).eq('id', id);
    toast.success(current ? 'Unfeatured' : 'Featured on homepage');
    fetchAll();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Tour Packages</h1><p className="text-sm text-gray-500">Manage all tour packages</p></div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add Package
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Package size={22} className="text-blue-500"/><div><div className="text-xl font-bold">{packages.length}</div><div className="text-xs text-gray-500">Total</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Package size={22} className="text-green-500"/><div><div className="text-xl font-bold">{packages.filter(p => p.active).length}</div><div className="text-xs text-gray-500">Active</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Star size={22} className="text-yellow-500"/><div><div className="text-xl font-bold">{packages.filter(p => p.featured).length}</div><div className="text-xs text-gray-500">Featured</div></div></CardContent></Card>
      </div>

      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <Input placeholder="Search packages..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>
          : filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><Package className="mx-auto mb-2 opacity-30" size={32}/><p>No packages found</p></div>
          : <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="text-left px-4 py-3">Package</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Destination</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Duration</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Featured</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.main_image && <img src={p.main_image} alt={p.title} className="w-10 h-10 rounded object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>}
                        <div><div className="font-medium">{p.title}</div><div className="text-xs text-gray-500">{p.category}</div></div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">{p.destinations?.name || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">{p.nights}N / {p.days}D</td>
                    <td className="px-4 py-3 font-semibold text-green-700">₹{p.price_from.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <button onClick={() => toggleFeatured(p.id, p.featured)}>
                        <Star size={16} className={p.featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}/>
                      </button>
                    </td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.active ? 'Active' : 'Draft'}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => {
                          setEditId(p.id);
                          setForm({
                            title: p.title,
                            category: p.category || 'Nature',
                            destination_id: (p as any).destination_id || '',
                            nights: p.nights,
                            days: p.days,
                            price_from: p.price_from,
                            main_image: p.main_image || '',
                            highlights: Array.isArray((p as any).highlights) ? (p as any).highlights.join(', ') : '',
                            active: p.active,
                            featured: p.featured,
                            display_order: p.display_order || 0,
                          });
                          setDialogOpen(true);
                        }}><Edit2 size={13}/></button>
                        <button className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => setDeleteId(p.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
        }
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editId ? 'Edit Package' : 'Add Tour Package'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1"><Label>Package Title *</Label><Input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Destination</Label>
              <Select value={form.destination_id} onValueChange={v => setForm(f => ({...f, destination_id: v}))}>
                <SelectTrigger><SelectValue placeholder="Select destination"/></SelectTrigger>
                <SelectContent>{destinations.map(d => <SelectItem key={d.id} value={d.id}>{d.name} ({d.state})</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Nights</Label><Input type="number" min={1} value={form.nights} onChange={e => setForm(f => ({...f, nights: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Days</Label><Input type="number" min={1} value={form.days} onChange={e => setForm(f => ({...f, days: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Price From (₹)</Label><Input type="number" min={0} value={form.price_from} onChange={e => setForm(f => ({...f, price_from: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Display Order</Label><Input type="number" min={0} value={form.display_order} onChange={e => setForm(f => ({...f, display_order: +e.target.value}))}/></div>
            <div className="col-span-2 space-y-1"><Label>Main Image URL</Label><Input value={form.main_image} placeholder="https://..." onChange={e => setForm(f => ({...f, main_image: e.target.value}))}/></div>
            <div className="col-span-2 space-y-1"><Label>Highlights (comma separated)</Label><Textarea rows={2} value={form.highlights} placeholder="Beach views, Heritage walk, Local cuisine..." onChange={e => setForm(f => ({...f, highlights: e.target.value}))}/></div>
            <div className="flex items-center gap-3"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({...f, active: v}))}/><Label>Active / Published</Label></div>
            <div className="flex items-center gap-3"><Switch checked={form.featured} onCheckedChange={v => setForm(f => ({...f, featured: v}))}/><Label>Featured on Homepage</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Package?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the tour package.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('tour_packages').delete().eq('id', deleteId!); toast.success('Deleted'); setDeleteId(null); fetchAll(); }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
