import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Search, UserCheck, Loader2, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const Route = createFileRoute('/admin/operations/drivers')({
  component: DriversPage,
});

const STATUSES = ['Available', 'Assigned', 'On Trip', 'Leave', 'Inactive'];
const statusColors: Record<string, string> = {
  Available: 'bg-green-100 text-green-700', Assigned: 'bg-blue-100 text-blue-700',
  'On Trip': 'bg-orange-100 text-orange-700', Leave: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-600',
};

type Driver = { id: string; name: string; phone: string; whatsapp?: string; email?: string; license_number?: string; license_expiry?: string; experience_years?: number; status: string; rating?: number; created_at: string; };
const emptyForm = { name: '', phone: '', whatsapp: '', email: '', license_number: '', license_expiry: '', experience_years: 0, status: 'Available' };

function isExpiringSoon(date?: string) {
  if (!date) return false;
  const diff = (new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff < 30 && diff > 0;
}
function isExpired(date?: string) { return !!date && new Date(date) < new Date(); }

function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function fetch() {
    setLoading(true);
    let q = supabase.from('drivers').select('*').order('name');
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data } = await q;
    setDrivers(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, [statusFilter]);

  const filtered = drivers.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.phone.includes(search));

  async function handleSave() {
    if (!form.name || !form.phone) { toast.error('Name and phone required'); return; }
    setSaving(true);
    try {
      const payload = { ...form, experience_years: +form.experience_years, license_expiry: form.license_expiry || null };
      if (editId) { await supabase.from('drivers').update(payload).eq('id', editId); toast.success('Driver updated'); }
      else { await supabase.from('drivers').insert(payload); toast.success('Driver added'); }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  const counts = { total: drivers.length, available: drivers.filter(d => d.status === 'Available').length, onTrip: drivers.filter(d => d.status === 'On Trip').length };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Drivers</h1><p className="text-sm text-gray-500">Manage driver profiles and documents</p></div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add Driver
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><UserCheck size={22} className="text-blue-500"/><div><div className="text-xl font-bold">{counts.total}</div><div className="text-xs text-gray-500">Total</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><UserCheck size={22} className="text-green-500"/><div><div className="text-xl font-bold">{counts.available}</div><div className="text-xs text-gray-500">Available</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><UserCheck size={22} className="text-orange-500"/><div><div className="text-xl font-bold">{counts.onTrip}</div><div className="text-xs text-gray-500">On Trip</div></div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name or phone..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent><SelectItem value="all">All Statuses</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>
          : filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><UserCheck className="mx-auto mb-2 opacity-30" size={32}/><p>No drivers found</p></div>
          : <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="text-left px-4 py-3">Driver</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">License</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Expiry</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Experience</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium">{d.name}</div><div className="text-xs text-gray-500">{d.phone}</div></td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-xs">{d.license_number || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs">
                      <div className="flex items-center gap-1">
                        {d.license_expiry ? new Date(d.license_expiry).toLocaleDateString('en-IN') : '—'}
                        {isExpired(d.license_expiry) && <span className="text-red-500 flex items-center gap-0.5"><AlertTriangle size={11}/>Expired</span>}
                        {isExpiringSoon(d.license_expiry) && <span className="text-yellow-600 flex items-center gap-0.5"><AlertTriangle size={11}/>Soon</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600">{d.experience_years ? `${d.experience_years} yrs` : '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[d.status]}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => { setEditId(d.id); setForm({name:d.name,phone:d.phone,whatsapp:d.whatsapp||'',email:d.email||'',license_number:d.license_number||'',license_expiry:d.license_expiry||'',experience_years:d.experience_years||0,status:d.status}); setDialogOpen(true); }}><Edit2 size={13}/></button>
                        <button className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => setDeleteId(d.id)}><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>}
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Driver' : 'Add Driver'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
            <div className="space-y-1"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(f => ({...f, whatsapp: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div className="space-y-1"><Label>License Number</Label><Input value={form.license_number} onChange={e => setForm(f => ({...f, license_number: e.target.value}))} /></div>
            <div className="space-y-1"><Label>License Expiry</Label><Input type="date" value={form.license_expiry} onChange={e => setForm(f => ({...f, license_expiry: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Experience (years)</Label><Input type="number" min={0} value={form.experience_years} onChange={e => setForm(f => ({...f, experience_years: +e.target.value}))} /></div>
            <div className="space-y-1"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Driver?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('drivers').delete().eq('id', deleteId!); toast.success('Driver deleted'); setDeleteId(null); fetch(); }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
