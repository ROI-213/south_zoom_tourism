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
import { Plus, Search, Globe, Loader2, Edit2, Trash2, Star, ExternalLink } from 'lucide-react';
import { AdminImageUpload } from '@/components/admin/admin-image-upload';
import { fetchDestinations } from '@/content/destinations';

export const Route = createFileRoute('/admin/products/destinations')({
  component: DestinationsPage,
});

const STATES = ['Karnataka', 'Tamil Nadu', 'Kerala', 'Andhra Pradesh', 'Goa', 'Puducherry'];
type Destination = { id: string; name: string; state: string; slug?: string; description?: string; image_url?: string; featured: boolean; created_at: string; };
const emptyForm = { name: '', state: 'Karnataka', slug: '', description: '', image_url: '', featured: false };

function DestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetchAll() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('destinations').select('*').order('state').order('name');
      if (error) {
        console.error('Error fetching destinations:', error);
        toast.error('Failed to load destinations: ' + error.message);
      }
      const list = data || [];
      setDestinations(list);
      // Synchronize front-end content cache & notify app
      await fetchDestinations();
    } catch (e: any) {
      console.error('Error:', e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const byState = STATES.reduce(
    (acc, s) => ({ ...acc, [s]: destinations.filter((d) => d.state === s).length }),
    {} as Record<string, number>
  );

  const filtered = destinations.filter((d) => {
    const matchesState = stateFilter === 'all' || d.state === stateFilter;
    const matchesSearch =
      !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.state.toLowerCase().includes(search.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
    return matchesState && matchesSearch;
  });

  async function handleSave() {
    const cleanName = form.name.trim();
    if (!cleanName || !form.state) {
      toast.error('Name and state are required');
      return;
    }
    setSaving(true);
    try {
      let slug = form.slug.trim() || cleanName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (!slug) slug = `dest-${Date.now().toString(36)}`;

      const payload = {
        name: cleanName,
        state: form.state,
        slug,
        description: form.description ? form.description.trim() : null,
        image_url: form.image_url ? form.image_url.trim() : null,
        featured: form.featured,
      };

      if (editId) {
        const { error } = await supabase.from('destinations').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Destination updated successfully');
      } else {
        const { error } = await supabase.from('destinations').insert(payload);
        if (error) {
          // If unique slug collision, automatically append short random suffix
          if (error.code === '23505') {
            const uniqueSlug = `${slug}-${Date.now().toString(36).slice(-4)}`;
            const { error: retryError } = await supabase.from('destinations').insert({ ...payload, slug: uniqueSlug });
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
        toast.success('Destination added successfully');
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
      await fetchAll();
    } catch (e: any) {
      console.error('Error saving destination:', e);
      toast.error(e.message || 'Failed to save destination');
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(id: string, current: boolean) {
    const { error } = await supabase.from('destinations').update({ featured: !current }).eq('id', id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(current ? 'Unfeatured' : 'Featured on homepage');
      await fetchAll();
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from('destinations').delete().eq('id', deleteId);
      if (error) throw error;
      toast.success('Destination deleted successfully');
      setDeleteId(null);
      await fetchAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete destination');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Destinations</h1>
          <p className="text-sm text-gray-500">Manage all destinations across South India</p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setDialogOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus size={16} /> Add Destination
        </Button>
      </div>

      {/* State tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStateFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            stateFilter === 'all'
              ? 'bg-orange-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({destinations.length})
        </button>
        {STATES.map((s) => (
          <button
            key={s}
            onClick={() => setStateFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              stateFilter === s
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {s} ({byState[s] || 0})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search destinations by name or state..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="animate-spin text-orange-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Globe className="mx-auto mb-2 opacity-30" size={32} />
          <p>No destinations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((d) => (
            <Card key={d.id} className="overflow-hidden hover:shadow-md transition-shadow">
              {d.image_url ? (
                <img src={d.image_url} alt={d.name} className="h-36 w-full object-cover" />
              ) : (
                <div className="h-36 bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                  <Globe size={32} className="text-orange-300" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{d.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {d.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <a
                      href={`/destinations/${d.slug || d.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-orange-600 transition-colors"
                      title="View live destination page"
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => toggleFeatured(d.id, d.featured)}
                      className="p-1 rounded hover:bg-gray-100"
                      title={d.featured ? 'Featured on homepage' : 'Mark as featured'}
                    >
                      <Star
                        size={15}
                        className={d.featured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                      />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-gray-100"
                      title="Edit destination"
                      onClick={() => {
                        setEditId(d.id);
                        setForm({
                          name: d.name,
                          state: d.state,
                          slug: d.slug || '',
                          description: d.description || '',
                          image_url: d.image_url || '',
                          featured: d.featured,
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      className="p-1 rounded hover:bg-red-50 text-red-500"
                      title="Delete destination"
                      onClick={() => setDeleteId(d.id)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {d.description && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2">{d.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Destination' : 'Add Destination'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}/></div>
            <div className="space-y-1"><Label>State *</Label>
              <Select value={form.state} onValueChange={v => setForm(f => ({...f, state: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Slug (auto-generated if empty)</Label><Input value={form.slug} placeholder="e.g. ooty" onChange={e => setForm(f => ({...f, slug: e.target.value}))}/></div>
            <div className="col-span-2">
              <AdminImageUpload
                label="Destination Image"
                value={form.image_url || ''}
                onChange={(url) => setForm(f => ({ ...f, image_url: url }))}
                placeholder="https://... or upload destination photo"
                aspectRatioHint="Supports PNG, JPG, JPEG, WebP up to 5 MB"
              />
            </div>
            <div className="col-span-2 space-y-1"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}/></div>
            <div className="flex items-center gap-3"><Switch checked={form.featured} onCheckedChange={v => setForm(f => ({...f, featured: v}))}/><Label>Featured on Homepage</Label></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Destination?</AlertDialogTitle><AlertDialogDescription>This may affect linked tour packages and hotels.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('destinations').delete().eq('id', deleteId!); toast.success('Deleted'); setDeleteId(null); fetch(); }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
