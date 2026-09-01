import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Search, Car, Loader2, Edit2 } from 'lucide-react';

export const Route = createFileRoute('/admin/operations/vehicles')({
  component: VehiclesPage,
});

const CATEGORIES = ['Sedan', 'SUV', 'Small SUV', 'Tempo Traveller', 'Minibus', 'Luxury'];
type Fleet = { id: string; name: string; category?: string; seats?: number; luggage?: number; price_per_km?: number; available?: boolean; ac?: boolean; };
const emptyForm = { id: '', name: '', category: 'Sedan', seats: 4, luggage: 2, price_per_km: 12, available: true, ac: true };

function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Fleet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    const { data } = await supabase.from('fleets').select('*').order('name');
    setVehicles(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  const filtered = vehicles.filter(v => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.category?.toLowerCase().includes(search.toLowerCase()));

  async function handleSave() {
    if (!form.name) { toast.error('Vehicle name required'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, category: form.category, seats: +form.seats, luggage: +form.luggage, price_per_km: +form.price_per_km, available: form.available, ac: form.ac };
      if (editId) { await supabase.from('fleets').update(payload).eq('id', editId); toast.success('Vehicle updated — public fleet prices updated!'); }
      else { await supabase.from('fleets').insert({ ...payload, id: `fleet_${Date.now()}` }); toast.success('Vehicle added'); }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function toggleAvailability(id: string, current: boolean) {
    await supabase.from('fleets').update({ available: !current }).eq('id', id);
    toast.success(current ? 'Marked Unavailable' : 'Marked Available');
    fetch();
  }

  const counts = { total: vehicles.length, available: vehicles.filter(v => v.available).length };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Vehicles</h1><p className="text-sm text-gray-500">Manage fleet vehicles and pricing</p></div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add Vehicle
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Car size={22} className="text-blue-500"/><div><div className="text-xl font-bold">{counts.total}</div><div className="text-xs text-gray-500">Total Vehicles</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Car size={22} className="text-green-500"/><div><div className="text-xl font-bold">{counts.available}</div><div className="text-xs text-gray-500">Available</div></div></CardContent></Card>
      </div>

      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input placeholder="Search vehicles..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? Array(6).fill(0).map((_, i) => <Card key={i}><CardContent className="p-4 h-32 bg-gray-100 rounded animate-pulse"/></Card>)
          : filtered.length === 0 ? <div className="col-span-3 text-center py-12 text-gray-400"><Car className="mx-auto mb-2 opacity-30" size={32}/><p>No vehicles</p></div>
          : filtered.map(v => (
            <Card key={v.id} className={`hover:shadow-md transition-shadow ${!v.available ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{v.name}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{v.category}</span>
                  </div>
                  <button onClick={() => { setEditId(v.id); setForm({id:v.id,name:v.name,category:v.category||'Sedan',seats:v.seats||4,luggage:v.luggage||2,price_per_km:v.price_per_km||12,available:v.available||true,ac:v.ac||true}); setDialogOpen(true); }} className="p-1.5 rounded hover:bg-gray-100"><Edit2 size={14}/></button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div className="text-center bg-blue-50 rounded p-1.5"><div className="font-bold text-blue-700">{v.seats}</div><div className="text-gray-500">Seats</div></div>
                  <div className="text-center bg-green-50 rounded p-1.5"><div className="font-bold text-green-700">₹{v.price_per_km}</div><div className="text-gray-500">per km</div></div>
                  <div className="text-center bg-orange-50 rounded p-1.5"><div className="font-bold text-orange-700">{v.ac ? 'AC' : 'Non-AC'}</div><div className="text-gray-500">Type</div></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${v.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {v.available ? 'Available' : 'Unavailable'}
                  </span>
                  <Switch checked={v.available} onCheckedChange={() => toggleAvailability(v.id, !!v.available)} />
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1"><Label>Vehicle Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} placeholder="e.g. Toyota Innova Crysta"/></div>
            <div className="space-y-1"><Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({...f, category: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Seats</Label><Input type="number" min={1} value={form.seats} onChange={e => setForm(f => ({...f, seats: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Luggage Bags</Label><Input type="number" min={0} value={form.luggage} onChange={e => setForm(f => ({...f, luggage: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Price Per KM (₹)</Label><Input type="number" min={0} step="0.5" value={form.price_per_km} onChange={e => setForm(f => ({...f, price_per_km: +e.target.value}))}/></div>
            <div className="flex items-center gap-3 pt-5"><Switch checked={form.ac} onCheckedChange={v => setForm(f => ({...f, ac: v}))}/><Label>AC Vehicle</Label></div>
            <div className="flex items-center gap-3 pt-5"><Switch checked={form.available} onCheckedChange={v => setForm(f => ({...f, available: v}))}/><Label>Available</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
