import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Search, Image, Loader2, Edit2, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const Route = createFileRoute('/admin/content/gallery')({
  component: GalleryPage,
});

const CATEGORIES = ['Karnataka', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Goa', 'Puducherry', 'Vehicles', 'Tours', 'Hotels', 'Events', 'Pilgrimage', 'Company'];
type GalleryItem = { id: string; image_url: string; alt_text?: string; category?: string; active: boolean; display_order?: number; created_at: string; };
const emptyForm = { image_url: '', alt_text: '', category: 'Karnataka', active: true, display_order: 0 };

function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    let q = supabase.from('gallery').select('*').order('display_order').order('created_at', { ascending: false });
    if (catFilter !== 'all') q = q.eq('category', catFilter);
    const { data } = await q;
    setItems(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, [catFilter]);

  const filtered = items.filter(i => !search || i.alt_text?.toLowerCase().includes(search.toLowerCase()) || i.category?.toLowerCase().includes(search.toLowerCase()));

  async function handleSave() {
    if (!form.image_url) { toast.error('Image URL required'); return; }
    setSaving(true);
    try {
      if (editId) { await supabase.from('gallery').update(form).eq('id', editId); toast.success('Updated'); }
      else { await supabase.from('gallery').insert(form); toast.success('Image added to gallery'); }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Gallery</h1><p className="text-sm text-gray-500">Manage website gallery images</p></div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add Image
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setCatFilter('all')} className={`px-3 py-1 rounded-lg text-sm font-medium ${catFilter === 'all' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>All ({items.length})</button>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCatFilter(c)} className={`px-3 py-1 rounded-lg text-sm font-medium ${catFilter === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{c}</button>
        ))}
      </div>

      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <Input placeholder="Search images..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>
        : filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><Image className="mx-auto mb-2 opacity-30" size={32}/><p>No images found</p></div>
        : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(item => (
            <div key={item.id} className="group relative rounded-lg overflow-hidden bg-gray-100 aspect-square">
              <img src={item.image_url} alt={item.alt_text || ''} className="w-full h-full object-cover"/>
              {!item.active && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="text-white text-xs font-medium bg-black/50 px-2 py-1 rounded">Hidden</span></div>}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button className="p-1.5 bg-white rounded text-gray-700 hover:bg-gray-100" onClick={() => { setEditId(item.id); setForm({image_url:item.image_url,alt_text:item.alt_text||'',category:item.category||'Karnataka',active:item.active,display_order:item.display_order||0}); setDialogOpen(true); }}><Edit2 size={13}/></button>
                  <button className="p-1.5 bg-white rounded text-red-500 hover:bg-red-50" onClick={() => setDeleteId(item.id)}><Trash2 size={13}/></button>
                </div>
              </div>
              {item.category && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2"><span className="text-white text-xs">{item.category}</span></div>}
            </div>
          ))}
        </div>
      }

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Image' : 'Add Gallery Image'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1"><Label>Image URL *</Label><Input value={form.image_url} placeholder="https://..." onChange={e => setForm(f => ({...f, image_url: e.target.value}))}/></div>
            {form.image_url && <img src={form.image_url} alt="preview" className="w-full h-40 object-cover rounded-lg" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}/>}
            <div className="space-y-1"><Label>Alt Text</Label><Input value={form.alt_text} placeholder="Image description" onChange={e => setForm(f => ({...f, alt_text: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1"><Label>Display Order</Label><Input type="number" min={0} value={form.display_order} onChange={e => setForm(f => ({...f, display_order: +e.target.value}))}/></div>
              <div className="flex items-center gap-3 pt-5"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({...f, active: v}))}/><Label>Visible</Label></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Remove Image?</AlertDialogTitle><AlertDialogDescription>This will remove the image from the gallery.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('gallery').delete().eq('id', deleteId!); toast.success('Removed'); setDeleteId(null); fetch(); }} className="bg-red-500 hover:bg-red-600">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
