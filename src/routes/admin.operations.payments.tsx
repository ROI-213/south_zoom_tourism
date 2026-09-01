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
import { toast } from 'sonner';
import { Plus, Search, CreditCard, Loader2, Edit2, Trash2 } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export const Route = createFileRoute('/admin/operations/payments')({
  component: PaymentsPage,
});

const METHODS = ['UPI', 'GPay', 'PhonePe', 'Cash', 'Bank Transfer', 'Card', 'Online'];
const STATUSES = ['Pending', 'Paid', 'Failed', 'Refunded', 'Partially Paid'];
const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700', Paid: 'bg-green-100 text-green-700',
  Failed: 'bg-red-100 text-red-700', Refunded: 'bg-blue-100 text-blue-700',
  'Partially Paid': 'bg-orange-100 text-orange-700',
};

type Payment = { id: string; booking_id?: string; amount: number; payment_method: string; transaction_id?: string; status: string; notes?: string; created_at: string; bookings?: { booking_number: string; customers?: { name: string } | null } | null; };
const emptyForm = { booking_number: '', amount: 0, payment_method: 'UPI', transaction_id: '', status: 'Paid', notes: '' };

function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function fetch() {
    setLoading(true);
    let q = supabase.from('payments').select('*, bookings(booking_number, customers(name))').order('created_at', { ascending: false });
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data } = await q;
    setPayments(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, [statusFilter]);

  const filtered = payments.filter(p => !search ||
    p.bookings?.booking_number?.includes(search) ||
    p.bookings?.customers?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCollected = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

  async function handleSave() {
    if (!form.amount || !form.payment_method) { toast.error('Amount and method required'); return; }
    setSaving(true);
    try {
      // Try to find the booking by booking number
      let bookingId: string | null = null;
      if (form.booking_number) {
        const { data } = await supabase.from('bookings').select('id').eq('booking_number', form.booking_number).single();
        bookingId = data?.id || null;
      }
      await supabase.from('payments').insert({
        booking_id: bookingId, amount: +form.amount, payment_method: form.payment_method,
        transaction_id: form.transaction_id || null, status: form.status, notes: form.notes || null,
      });
      toast.success('Payment recorded');
      setDialogOpen(false); setForm(emptyForm); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-xl font-bold">Payments</h1><p className="text-sm text-gray-500">Track all payment transactions</p></div>
        <Button onClick={() => { setForm(emptyForm); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Record Payment
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4"><div className="text-xs text-gray-500 mb-1">Total Collected</div><div className="text-xl font-bold text-green-600">₹{totalCollected.toLocaleString('en-IN')}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-gray-500 mb-1">Pending</div><div className="text-xl font-bold text-yellow-600">₹{totalPending.toLocaleString('en-IN')}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-gray-500 mb-1">Total Transactions</div><div className="text-xl font-bold">{payments.length}</div></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <Input placeholder="Search by booking# or customer..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)}/>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses"/></SelectTrigger>
          <SelectContent><SelectItem value="all">All Statuses</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <Card><CardContent className="p-0">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500"/></div>
          : filtered.length === 0 ? <div className="text-center py-12 text-gray-400"><CreditCard className="mx-auto mb-2 opacity-30" size={32}/><p>No payments found</p></div>
          : <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-xs text-gray-500">
                <th className="text-left px-4 py-3">Booking</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Customer</th>
                <th className="text-left px-4 py-3">Amount</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">Method</th>
                <th className="text-left px-4 py-3 hidden lg:table-cell">Transaction ID</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right px-4 py-3">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-orange-600">{p.bookings?.booking_number || '—'}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-sm">{p.bookings?.customers?.name || '—'}</td>
                    <td className="px-4 py-3 font-bold">₹{p.amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">{p.payment_method}</td>
                    <td className="px-4 py-3 hidden lg:table-cell font-mono text-xs text-gray-500">{p.transaction_id || '—'}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>{p.status}</span></td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-400">{new Date(p.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 text-right">
                      <button className="p-1.5 rounded hover:bg-red-50 text-red-500" onClick={() => setDeleteId(p.id)}><Trash2 size={13}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
        }
      </CardContent></Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="col-span-2 space-y-1"><Label>Booking Number</Label><Input value={form.booking_number} placeholder="e.g. SZT-1234567890" onChange={e => setForm(f => ({...f, booking_number: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Amount (₹) *</Label><Input type="number" min={0} value={form.amount} onChange={e => setForm(f => ({...f, amount: +e.target.value}))}/></div>
            <div className="space-y-1"><Label>Method *</Label>
              <Select value={form.payment_method} onValueChange={v => setForm(f => ({...f, payment_method: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Transaction ID</Label><Input value={form.transaction_id} onChange={e => setForm(f => ({...f, transaction_id: e.target.value}))}/></div>
            <div className="space-y-1"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}/></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Payment?</AlertDialogTitle><AlertDialogDescription>This will remove this payment record permanently.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('payments').delete().eq('id', deleteId!); toast.success('Deleted'); setDeleteId(null); fetch(); }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
