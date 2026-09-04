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
import { Plus, Search, UserCheck, Loader2, Edit2, Trash2, AlertTriangle, Car, Hash, ShieldCheck } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { getFleetVehicles } from '@/content/fleet';

export const Route = createFileRoute('/admin/operations/drivers')({
  component: DriversPage,
});

const STATUSES = ['Available', 'Assigned', 'On Trip', 'Leave', 'Inactive'];
const statusColors: Record<string, string> = {
  Available: 'bg-green-100 text-green-700', Assigned: 'bg-blue-100 text-blue-700',
  'On Trip': 'bg-orange-100 text-orange-700', Leave: 'bg-yellow-100 text-yellow-700',
  Inactive: 'bg-gray-100 text-gray-600',
};

const CAB_TYPE_PRESETS = [
  'Hatchback (WagonR / Indica)',
  'Sedan (Swift Dzire / Etios)',
  'Small SUV (Ertiga / Triber)',
  'Big SUV (Innova Crysta / Hycross)',
  'Tempo Traveller (12-17 Seater)',
  'Force Urbania Luxury Van',
  'Tourist Bus (27-45 Seater)',
  'Premium Sedan (BMW / Audi)',
];

type Driver = {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  cab_type?: string;
  car_number?: string;
  license_number?: string;
  license_expiry?: string;
  experience_years?: number;
  status: string;
  rating?: number;
  created_at: string;
};

const emptyForm = {
  name: '',
  phone: '',
  whatsapp: '',
  email: '',
  cab_type: '',
  car_number: '',
  license_number: '',
  license_expiry: '',
  experience_years: 0,
  status: 'Available',
};

const DEFAULT_MOCK_DRIVERS: Driver[] = [
  {
    id: 'drv-1',
    name: 'Senthil Nathan R.',
    phone: '+91 97890 54321',
    whatsapp: '+91 97890 54321',
    email: 'senthil.n@sztourism.com',
    cab_type: 'Big SUV (Innova Crysta / Hycross)',
    car_number: 'KA 01 MJ 4521',
    license_number: 'KA0120150003412',
    license_expiry: '2028-11-15',
    experience_years: 9,
    status: 'Available',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'drv-2',
    name: 'Vigneshwaran P.',
    phone: '+91 94440 11223',
    whatsapp: '+91 94440 11223',
    email: 'vignesh.p@sztourism.com',
    cab_type: 'Sedan (Swift Dzire / Etios)',
    car_number: 'KA 05 AB 8890',
    license_number: 'KA0520180009871',
    license_expiry: '2029-06-20',
    experience_years: 6,
    status: 'Available',
    created_at: '2026-02-15T11:30:00Z',
  },
  {
    id: 'drv-3',
    name: 'Karthikeyan M.',
    phone: '+91 98400 66778',
    whatsapp: '+91 98400 66778',
    email: 'karthik.m@sztourism.com',
    cab_type: 'Small SUV (Ertiga / Triber)',
    car_number: 'KA 03 EX 3344',
    license_number: 'KA0320140004529',
    license_expiry: '2027-08-30',
    experience_years: 11,
    status: 'On Trip',
    created_at: '2026-03-01T09:15:00Z',
  },
];

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
    try {
      const { data, error } = await supabase.from('drivers').select('*').order('name');
      if (error) {
        console.warn('Supabase fetch failed, falling back to local cache:', error);
        const local = localStorage.getItem('szt_admin_drivers_v2');
        setDrivers(local ? JSON.parse(local) : DEFAULT_MOCK_DRIVERS);
      } else {
        setDrivers(data || []);
        localStorage.setItem('szt_admin_drivers_v2', JSON.stringify(data || []));
      }
    } catch (err) {
      console.warn('Network error during fetch:', err);
      const local = localStorage.getItem('szt_admin_drivers_v2');
      setDrivers(local ? JSON.parse(local) : DEFAULT_MOCK_DRIVERS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetch();
  }, []);

  const filtered = drivers.filter(d => {
    const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
    const matchesSearch =
      !search ||
      d.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.phone?.includes(search) ||
      (d.cab_type && d.cab_type.toLowerCase().includes(search.toLowerCase())) ||
      (d.car_number && d.car_number.toLowerCase().includes(search.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  async function handleSave() {
    if (!form.name || !form.phone) {
      toast.error('Name and phone required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp?.trim() || null,
        email: form.email?.trim() || null,
        cab_type: form.cab_type || null,
        car_number: form.car_number ? form.car_number.toUpperCase().trim() : null,
        license_number: form.license_number?.trim() || null,
        license_expiry: form.license_expiry || null,
        experience_years: form.experience_years ? +form.experience_years : 0,
        status: form.status || 'Available',
      };

      if (editId) {
        const { error } = await supabase.from('drivers').update(payload).eq('id', editId);
        if (error) {
          console.warn('Supabase update warning, falling back to local state:', error);
          setDrivers(prev => {
            const updated = prev.map(d => (d.id === editId ? { ...d, ...payload } : d));
            localStorage.setItem('szt_admin_drivers_v2', JSON.stringify(updated));
            return updated;
          });
        }
        toast.success('Driver updated');
      } else {
        const { data, error } = await supabase.from('drivers').insert(payload).select().single();
        if (error) {
          console.warn('Supabase insert warning, saving offline:', error);
          const newRecord: Driver = {
            ...payload,
            id: `drv-${Date.now()}`,
            created_at: new Date().toISOString(),
          };
          setDrivers(prev => {
            const updated = [newRecord, ...prev];
            localStorage.setItem('szt_admin_drivers_v2', JSON.stringify(updated));
            return updated;
          });
          toast.success('Driver added');
        } else if (data) {
          setDrivers(prev => {
            const updated = [data, ...prev.filter(d => d.id !== data.id)];
            localStorage.setItem('szt_admin_drivers_v2', JSON.stringify(updated));
            return updated;
          });
          toast.success('Driver added');
        }
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
      await fetch();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to save driver');
    } finally {
      setSaving(false);
    }
  }

  const counts = {
    total: drivers.length,
    available: drivers.filter(d => d.status === 'Available').length,
    onTrip: drivers.filter(d => d.status === 'On Trip').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Drivers</h1><p className="text-sm text-gray-500">Manage driver profiles, cab assignments, and documents</p></div>
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
          <Input placeholder="Search by name, phone, cab type or car number..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
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
                <th className="text-left px-4 py-3">Cab & Car Number</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">License</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Expiry</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Experience</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {filtered.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-gray-900">{d.name}</div>
                      <div className="text-xs text-gray-500">{d.phone}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 font-medium text-xs text-gray-800">
                          <Car size={13} className="text-orange-500 shrink-0" />
                          <span>{d.cab_type || 'Unassigned'}</span>
                        </div>
                        {d.car_number ? (
                          <span className="font-mono text-[11px] font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded w-fit border border-gray-200">
                            {d.car_number}
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 italic">No vehicle plate</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell font-mono text-xs">{d.license_number || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs">
                      <div className="flex items-center gap-1">
                        {d.license_expiry ? new Date(d.license_expiry).toLocaleDateString('en-IN') : '—'}
                        {isExpired(d.license_expiry) && <span className="text-red-500 flex items-center gap-0.5 font-semibold"><AlertTriangle size={11}/>Expired</span>}
                        {isExpiringSoon(d.license_expiry) && <span className="text-yellow-600 flex items-center gap-0.5 font-semibold"><AlertTriangle size={11}/>Soon</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600">{d.experience_years ? `${d.experience_years} yrs` : '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[d.status] || 'bg-gray-100'}`}>{d.status}</span></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                          onClick={() => {
                            setEditId(d.id);
                            setForm({
                              name: d.name,
                              phone: d.phone,
                              whatsapp: d.whatsapp || '',
                              email: d.email || '',
                              cab_type: d.cab_type || '',
                              car_number: d.car_number || '',
                              license_number: d.license_number || '',
                              license_expiry: d.license_expiry || '',
                              experience_years: d.experience_years || 0,
                              status: d.status,
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="p-1.5 rounded hover:bg-red-50 text-red-500"
                          onClick={() => setDeleteId(d.id)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>}
      </CardContent></Card>

      {/* Add / Edit Driver Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{editId ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Name *</Label>
              <Input
                placeholder="Driver full name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Phone *</Label>
              <Input
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">WhatsApp</Label>
              <Input
                placeholder="WhatsApp contact number"
                value={form.whatsapp}
                onChange={e => setForm(f => ({ ...f, whatsapp: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Email</Label>
              <Input
                placeholder="driver@sztourism.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
            </div>

            {/* Cab Type & Car Number */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Car size={13} className="text-orange-500" />
                <span>Cab Type</span>
              </Label>
              <Select
                value={form.cab_type || 'unselected'}
                onValueChange={v => setForm(f => ({ ...f, cab_type: v === 'unselected' ? '' : v }))}
              >
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select Cab Model / Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unselected">-- Not Assigned --</SelectItem>
                  {CAB_TYPE_PRESETS.map(type => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold flex items-center gap-1">
                <Hash size={13} className="text-orange-500" />
                <span>Car Number (Vehicle Plate)</span>
              </Label>
              <Input
                placeholder="e.g. KA 01 AB 1234"
                className="uppercase font-mono text-xs"
                value={form.car_number}
                onChange={e => setForm(f => ({ ...f, car_number: e.target.value.toUpperCase() }))}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">License Number</Label>
              <Input
                placeholder="e.g. KA0120180009871"
                className="uppercase font-mono text-xs"
                value={form.license_number}
                onChange={e => setForm(f => ({ ...f, license_number: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">License Expiry</Label>
              <Input
                type="date"
                className="text-xs"
                value={form.license_expiry}
                onChange={e => setForm(f => ({ ...f, license_expiry: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Experience (years)</Label>
              <Input
                type="number"
                min={0}
                className="text-xs"
                value={form.experience_years}
                onChange={e => setForm(f => ({ ...f, experience_years: +e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger className="text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-3 gap-2">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600 font-bold">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Saving...</> : 'Save Driver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Driver?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                const { error } = await supabase.from('drivers').delete().eq('id', deleteId!);
                if (error) {
                  console.warn('Supabase delete error:', error);
                }
                setDrivers(prev => {
                  const updated = prev.filter(d => d.id !== deleteId);
                  localStorage.setItem('szt_admin_drivers_v2', JSON.stringify(updated));
                  return updated;
                });
                toast.success('Driver deleted');
                setDeleteId(null);
                await fetch();
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
