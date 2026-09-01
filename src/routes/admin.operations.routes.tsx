import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Search, MapPin, Loader2, Edit2, Trash2 } from 'lucide-react';

export const Route = createFileRoute('/admin/operations/routes')({
  component: RoutesPage,
});

type Route_ = { id: string; origin: string; destination: string; distance_km?: number; estimated_duration?: string; active: boolean; created_at: string; };
const emptyForm = { origin: '', destination: '', distance_km: 0, estimated_duration: '', active: true };

function RoutesPage() {
  const [routes, setRoutes] = useState<Route_[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase.from('routes').select('*').order('origin');
    setRoutes(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  const filtered = routes.filter(r => !search || r.origin.toLowerCase().includes(search.toLowerCase()) || r.destination.toLowerCase().includes(search.toLowerCase()));

  async function handleSave() {
    if (!form.origin || !form.destination) { toast.error('Origin and destination required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, distance_km: +form.distance_km };
      if (editId) { await supabase.from('routes').update(payload).eq('id', editId); toast.success('Route updated'); }
      else { await supabase.from('routes').insert(payload); toast.success('Route added'); }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Routes</h1><p className="text-sm text-gray-500">Manage outstation and intercity routes</p></div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add Route
        </Button>
      </div>

      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <Input placeholder="Search routes..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)}/>
      </div>

      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>
          : filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><MapPin className="mx-auto mb-2 opacity-30" size={32}/><p>No routes added yet</p></div>
          : <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="text-left px-4 py-3">Origin → Destination</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Distance</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Duration</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><span className="font-medium">{r.origin}</span><span className="text-gray-400 mx-2">→</span><span className="font-medium">{r.destination}</span></td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{r.distance_km ? `${r.distance_km} km` : '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-600">{r.estimated_duration || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{r.active ? 'Active' : 'Inactive'}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => { setEditId(r.id); setForm({origin:r.origin,destination:r.destination,distance_km:r.distance_km||0,estimated_duration:r.estimated_duration||'',active:r.active}); setDialogOpen(true); }}><Edit2 size={13}/></button>
                        <button className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => setDeleteId(r.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
        }
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Route' : 'Add Route'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Origin *</Label><Input value={form.origin} placeholder="e.g. Bengaluru" onChange={e => setForm(f => ({...f, origin: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Destination *</Label><Input value={form.destination} placeholder="e.g. Mysuru" onChange={e => setForm(f => ({...f, destination: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Distance (km)</Label><Input type="number" min={0} value={form.distance_km} onChange={e => setForm(f => ({...f, distance_km: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Est. Duration</Label><Input value={form.estimated_duration} placeholder="e.g. 3 hrs" onChange={e => setForm(f => ({...f, estimated_duration: e.target.value}))}/></div>
            <div className="flex items-center gap-3 pt-4"><Switch checked={form.active} onCheckedChange={v => setForm(f => ({...f, active: v}))}/><Label>Active</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save Route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Route?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the route.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('routes').delete().eq('id', deleteId!); toast.success('Deleted'); setDeleteId(null); fetch(); }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
