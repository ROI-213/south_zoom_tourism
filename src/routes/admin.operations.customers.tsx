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
import { Plus, Search, Users, Loader2, Edit2, Eye, Phone } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export const Route = createFileRoute('/admin/operations/customers')({
  component: CustomersPage,
});

type Customer = { id: string; name: string; phone: string; email?: string; whatsapp?: string; address?: string; total_bookings?: number; total_spent?: number; created_at: string; };
const emptyForm = { name: '', phone: '', email: '', whatsapp: '', address: '' };

function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [customerBookings, setCustomerBookings] = useState<any[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  async function fetch() {
    setLoading(true);
    const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    setCustomers(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, []);

  const filtered = customers.filter(c => !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  async function openView(c: Customer) {
    setViewCustomer(c);
    const { data } = await supabase.from('bookings')
      .select('booking_number, booking_type, status, total_amount, pickup_date, pickup_location, drop_location')
      .eq('customer_id', c.id)
      .order('created_at', { ascending: false });
    setCustomerBookings(data || []);
  }

  async function handleSave() {
    if (!form.name || !form.phone) { toast.error('Name and phone required'); return; }
    setSaving(true);
    try {
      if (editId) { await supabase.from('customers').update(form).eq('id', editId); toast.success('Customer updated'); }
      else { await supabase.from('customers').insert(form); toast.success('Customer added'); }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  const thisMonth = customers.filter(c => new Date(c.created_at).getMonth() === new Date().getMonth()).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Customers</h1><p className="text-sm text-gray-500">Customer profiles and booking history</p></div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 flex items-center gap-3"><Users size={22} className="text-blue-500"/><div><div className="text-xl font-bold">{customers.length}</div><div className="text-xs text-gray-500">Total Customers</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users size={22} className="text-green-500"/><div><div className="text-xl font-bold">{thisMonth}</div><div className="text-xs text-gray-500">New This Month</div></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><Users size={22} className="text-orange-500"/><div><div className="text-xl font-bold">₹{(customers.reduce((s, c) => s + (c.total_spent || 0), 0)).toLocaleString('en-IN')}</div><div className="text-xs text-gray-500">Total Revenue</div></div></CardContent></Card>
      </div>

      <div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
        <Input placeholder="Search by name, phone or email..." className="pl-9" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}/>
      </div>

      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>
          : paged.length === 0 ? <div className="text-center py-12 text-gray-400"><Users className="mx-auto mb-2 opacity-30" size={32}/><p>No customers found</p></div>
          : <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="text-left px-4 py-3">Customer</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Bookings</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Total Spent</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Joined</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {paged.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3"><div className="font-medium">{c.name}</div><div className="text-xs text-gray-500 flex items-center gap-1"><Phone size={11}/>{c.phone}</div></td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">{c.email || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-center font-medium">{c.total_bookings || 0}</td>
                    <td className="px-4 py-3 hidden lg:table-cell font-medium">₹{(c.total_spent || 0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button className="p-1.5 rounded hover:bg-blue-50 text-blue-500" onClick={() => openView(c)}><Eye size={13}/></button>
                        <button className="p-1.5 rounded hover:bg-gray-100" onClick={() => { setEditId(c.id); setForm({name:c.name,phone:c.phone,email:c.email||'',whatsapp:c.whatsapp||'',address:c.address||''}); setDialogOpen(true); }}><Edit2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
        }
      </CardContent></Card>

      {Math.ceil(filtered.length / PER_PAGE) > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>{filtered.length} total</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page === Math.ceil(filtered.length / PER_PAGE)} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* View Sheet */}
      <Sheet open={!!viewCustomer} onOpenChange={() => setViewCustomer(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader><SheetTitle>Customer Details</SheetTitle></SheetHeader>
          {viewCustomer && (
            <div className="mt-4 space-y-4">
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="text-lg font-bold">{viewCustomer.name}</div>
                <div className="text-sm text-gray-600">{viewCustomer.phone}</div>
                {viewCustomer.email && <div className="text-sm text-gray-600">{viewCustomer.email}</div>}
                {viewCustomer.address && <div className="text-sm text-gray-500 mt-1">{viewCustomer.address}</div>}
              </div>
              <div>
                <h3 className="font-semibold text-sm mb-3">Booking History</h3>
                {customerBookings.length === 0 ? <p className="text-sm text-gray-400">No bookings yet</p>
                  : <div className="space-y-2">
                    {customerBookings.map(b => (
                      <div key={b.booking_number} className="border rounded-lg p-3 text-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-orange-600 text-xs">{b.booking_number}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${b.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.status}</span>
                        </div>
                        <div className="text-gray-600">{b.pickup_location} → {b.drop_location}</div>
                        <div className="text-gray-500 text-xs">{b.booking_type} · ₹{(b.total_amount||0).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editId ? 'Edit Customer' : 'Add Customer'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}/></div>
            <div className="space-y-1"><Label>WhatsApp</Label><Input value={form.whatsapp} onChange={e => setForm(f => ({...f, whatsapp: e.target.value}))}/></div>
            <div className="col-span-2 space-y-1"><Label>Address</Label><Input value={form.address} onChange={e => setForm(f => ({...f, address: e.target.value}))}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
