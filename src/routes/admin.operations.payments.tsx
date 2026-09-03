import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  CreditCard,
  Loader2,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  DollarSign,
  ArrowRight,
  Wallet,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { listPaymentSubmissions } from '@/content/payment';

export const Route = createFileRoute('/admin/operations/payments')({
  component: PaymentsPage,
});

const METHODS = [
  'UPI / QR Scan',
  'GPay',
  'PhonePe',
  'Cash to Driver',
  'Bank Transfer (NEFT/IMPS)',
  'Credit / Debit Card',
  'Online Payment',
];

const STATUSES = ['All', 'Paid', 'Advance Paid', 'Pending', 'Partially Paid', 'Failed', 'Refunded'];

const statusColors: Record<string, string> = {
  Paid: 'bg-green-100 text-green-700 border-green-200',
  'Advance Paid': 'bg-amber-100 text-amber-800 border-amber-200',
  Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Partially Paid': 'bg-blue-100 text-blue-800 border-blue-200',
  Failed: 'bg-red-100 text-red-700 border-red-200',
  Refunded: 'bg-purple-100 text-purple-700 border-purple-200',
};

type PaymentRow = {
  id: string;
  booking_id?: string;
  booking_number: string;
  customer_name: string;
  customer_phone?: string;
  total_amount: number;
  advance_amount: number;
  balance_amount: number;
  payment_method: string;
  transaction_id?: string;
  status: string;
  notes?: string;
  created_at: string;
};

const emptyForm = {
  id: '',
  booking_id: '',
  booking_number: '',
  customer_name: '',
  total_amount: 0,
  advance_amount: 0,
  balance_amount: 0,
  payment_method: 'UPI / QR Scan',
  transaction_id: '',
  status: 'Advance Paid',
  notes: '',
};

function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [clearConfirmRow, setClearConfirmRow] = useState<PaymentRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  async function fetchAll() {
    setLoading(true);
    try {
      // 1. Fetch raw payments from supabase
      const { data: rawPayments } = await supabase
        .from('payments')
        .select('*, bookings(id, booking_number, total_amount, advance_amount, balance_amount, customers(name, phone))')
        .order('created_at', { ascending: false });

      // 2. Fetch all bookings from supabase
      const { data: rawBookings } = await supabase
        .from('bookings')
        .select('*, customers(name, phone)')
        .order('created_at', { ascending: false });

      // 3. Fetch device-local payment submissions (from QR payment proof uploads)
      const localSubmissions = listPaymentSubmissions();

      // Merge and construct consolidated payment rows
      const rowsMap = new Map<string, PaymentRow>();

      // A. Populate from bookings first (source of truth for total, advance, balance)
      if (rawBookings && rawBookings.length > 0) {
        for (const b of rawBookings) {
          const total = Number(b.total_amount) || 0;
          const advance = Number(b.advance_amount) || 0;
          const balance = b.balance_amount !== undefined && b.balance_amount !== null
            ? Number(b.balance_amount)
            : Math.max(0, total - advance);

          let rowStatus = 'Pending';
          if (balance <= 0 && (advance > 0 || total > 0)) {
            rowStatus = 'Paid';
          } else if (advance > 0) {
            rowStatus = 'Advance Paid';
          }

          rowsMap.set(b.booking_number || b.id, {
            id: b.id,
            booking_id: b.id,
            booking_number: b.booking_number || `SZT-${b.id.slice(0, 6)}`,
            customer_name: b.customers?.name || 'Customer',
            customer_phone: b.customers?.phone || '',
            total_amount: total,
            advance_amount: advance,
            balance_amount: balance,
            payment_method: advance > 0 ? 'UPI / Advance' : 'Pending',
            transaction_id: '',
            status: rowStatus,
            notes: b.notes || '',
            created_at: b.created_at || new Date().toISOString(),
          });
        }
      }

      // B. Merge explicit payments from payments table
      if (rawPayments && rawPayments.length > 0) {
        for (const p of rawPayments) {
          const bk = p.bookings;
          const key = bk?.booking_number || p.booking_id || p.id;
          const existing = rowsMap.get(key);

          const paidAmt = Number(p.amount) || 0;
          const total = existing ? existing.total_amount : Number(bk?.total_amount) || paidAmt;
          const advance = existing ? Math.max(existing.advance_amount, paidAmt) : paidAmt;
          const balance = Math.max(0, total - advance);

          rowsMap.set(key, {
            id: p.id,
            booking_id: p.booking_id || existing?.booking_id,
            booking_number: bk?.booking_number || existing?.booking_number || `PAY-${p.id.slice(0, 6)}`,
            customer_name: bk?.customers?.name || existing?.customer_name || 'Customer',
            customer_phone: bk?.customers?.phone || existing?.customer_phone || '',
            total_amount: total,
            advance_amount: advance,
            balance_amount: balance,
            payment_method: p.payment_method || existing?.payment_method || 'UPI',
            transaction_id: p.transaction_id || existing?.transaction_id || '',
            status: p.status === 'Paid' && balance === 0 ? 'Paid' : p.status || existing?.status || 'Paid',
            notes: p.notes || existing?.notes || '',
            created_at: p.created_at || existing?.created_at || new Date().toISOString(),
          });
        }
      }

      // C. Merge local payment submissions if not already in list
      for (const sub of localSubmissions) {
        const key = sub.bookingNumber || sub.reference;
        if (!rowsMap.has(key)) {
          const paid = Number(sub.amount) || 0;
          rowsMap.set(key, {
            id: sub.reference,
            booking_number: sub.bookingNumber || sub.reference,
            customer_name: sub.customerName || 'Website Guest',
            customer_phone: sub.phone || '',
            total_amount: paid,
            advance_amount: paid,
            balance_amount: 0,
            payment_method: sub.method || 'UPI / QR Scan',
            transaction_id: sub.transactionId || '',
            status: sub.status === 'verified' ? 'Paid' : 'Advance Paid',
            notes: sub.remarks || '',
            created_at: sub.createdAt || new Date().toISOString(),
          });
        }
      }

      const rows = Array.from(rowsMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setPayments(rows);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, []);

  const filtered = payments.filter((p) => {
    const matchesSearch =
      !search ||
      p.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.transaction_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.customer_phone?.includes(search);

    const matchesStatus =
      statusFilter === 'all' ||
      p.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const totalAdvanceCollected = payments.reduce((s, p) => s + (p.advance_amount || 0), 0);
  const totalBalancePending = payments.reduce((s, p) => s + (p.balance_amount || 0), 0);
  const totalBookingValue = payments.reduce((s, p) => s + (p.total_amount || 0), 0);
  const fullyPaidCount = payments.filter((p) => p.balance_amount <= 0 && p.advance_amount > 0).length;

  function openNewPayment() {
    setForm({
      ...emptyForm,
      booking_number: `SZT-BK-${Date.now().toString().slice(-6)}`,
    });
    setIsEditMode(false);
    setDialogOpen(true);
  }

  function openEditPayment(p: PaymentRow) {
    setForm({
      id: p.id,
      booking_id: p.booking_id || '',
      booking_number: p.booking_number,
      customer_name: p.customer_name,
      total_amount: p.total_amount,
      advance_amount: p.advance_amount,
      balance_amount: p.balance_amount,
      payment_method: p.payment_method || 'UPI / QR Scan',
      transaction_id: p.transaction_id || '',
      status: p.status,
      notes: p.notes || '',
    });
    setIsEditMode(true);
    setDialogOpen(true);
  }

  // Quick Action: Clear balance and mark as Fully Paid
  async function handleQuickClearBalance(row: PaymentRow) {
    try {
      const updatedAdvance = row.total_amount > 0 ? row.total_amount : row.advance_amount + row.balance_amount;
      const updatedBalance = 0;
      const updatedStatus = 'Paid';

      // 1. Update bookings table
      if (row.booking_number) {
        await supabase
          .from('bookings')
          .update({
            advance_amount: updatedAdvance,
            balance_amount: updatedBalance,
            status: 'Confirmed',
          })
          .eq('booking_number', row.booking_number);
      }

      // 2. Insert or update payments table
      await supabase.from('payments').insert({
        booking_id: row.booking_id || null,
        amount: row.balance_amount,
        payment_method: 'Cash to Driver',
        status: 'Paid',
        notes: `Balance amount of ₹${row.balance_amount} cleared and marked fully paid.`,
      });

      toast.success(`Payment Cleared for ${row.booking_number}!`, {
        description: `Balance amount of ₹${row.balance_amount.toLocaleString('en-IN')} marked as Fully Paid.`,
      });

      setClearConfirmRow(null);
      fetchAll();
    } catch (err: any) {
      toast.error('Failed to clear balance: ' + (err.message || 'Unknown error'));
    }
  }

  // 1-Click action inside the Edit dialog: Clear Full Balance
  function setClearBalanceInForm() {
    const total = form.total_amount > 0 ? form.total_amount : form.advance_amount + form.balance_amount;
    setForm((f) => ({
      ...f,
      total_amount: total,
      advance_amount: total,
      balance_amount: 0,
      status: 'Paid',
      notes: f.notes
        ? `${f.notes}\nBalance cleared on ${new Date().toLocaleDateString('en-IN')}.`
        : `Balance cleared on ${new Date().toLocaleDateString('en-IN')}. Fully paid.`,
    }));
    toast.info('Balance cleared to ₹0. Click "Save Changes" to apply.');
  }

  // Auto-calculate balance when total or advance changes in form
  function handleTotalChange(val: number) {
    setForm((f) => ({
      ...f,
      total_amount: val,
      balance_amount: Math.max(0, val - f.advance_amount),
    }));
  }

  function handleAdvanceChange(val: number) {
    setForm((f) => {
      const balance = Math.max(0, f.total_amount - val);
      return {
        ...f,
        advance_amount: val,
        balance_amount: balance,
        status: balance === 0 ? 'Paid' : 'Advance Paid',
      };
    });
  }

  function handleBalanceChange(val: number) {
    setForm((f) => ({
      ...f,
      balance_amount: val,
      status: val === 0 ? 'Paid' : 'Advance Paid',
    }));
  }

  async function handleSave() {
    if (!form.booking_number.trim()) {
      toast.error('Booking number is required');
      return;
    }

    setSaving(true);
    try {
      let bookingId = form.booking_id;

      // Find booking if booking_id isn't populated
      if (!bookingId && form.booking_number) {
        const { data: bData } = await supabase
          .from('bookings')
          .select('id')
          .eq('booking_number', form.booking_number)
          .maybeSingle();
        bookingId = bData?.id || null;
      }

      // 1. Update booking record if found
      if (bookingId) {
        await supabase
          .from('bookings')
          .update({
            total_amount: form.total_amount,
            advance_amount: form.advance_amount,
            balance_amount: form.balance_amount,
            status: form.status === 'Paid' && form.balance_amount === 0 ? 'Confirmed' : undefined,
          })
          .eq('id', bookingId);
      } else if (form.booking_number) {
        // Try updating booking by booking_number
        await supabase
          .from('bookings')
          .update({
            total_amount: form.total_amount,
            advance_amount: form.advance_amount,
            balance_amount: form.balance_amount,
          })
          .eq('booking_number', form.booking_number);
      }

      // 2. Insert or update payments record
      if (isEditMode && form.id && !form.id.startsWith('SZT-') && !form.id.startsWith('PAY-')) {
        await supabase
          .from('payments')
          .update({
            amount: form.advance_amount,
            payment_method: form.payment_method,
            transaction_id: form.transaction_id || null,
            status: form.status,
            notes: form.notes || null,
          })
          .eq('id', form.id);
      } else {
        await supabase.from('payments').insert({
          booking_id: bookingId || null,
          amount: form.advance_amount,
          payment_method: form.payment_method,
          transaction_id: form.transaction_id || null,
          status: form.status,
          notes: form.notes || null,
        });
      }

      toast.success(
        form.balance_amount === 0 ? 'Payment marked as Fully Paid!' : 'Payment record updated successfully!'
      );
      setDialogOpen(false);
      fetchAll();
    } catch (err: any) {
      toast.error('Failed to save payment: ' + (err.message || 'Error'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await supabase.from('payments').delete().eq('id', deleteId);
      toast.success('Payment record removed');
      setDeleteId(null);
      fetchAll();
    } catch (err: any) {
      toast.error('Error deleting: ' + err.message);
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Payments & Balance Tracking</h1>
          <p className="text-sm text-gray-500">
            Track advance received, remaining balance to be collected, and mark bookings as fully paid.
          </p>
        </div>
        <Button onClick={openNewPayment} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
          <Plus size={16} /> Record Payment
        </Button>
      </div>

      {/* 4 Summary Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Advance / Paid Collected */}
        <Card className="border-green-200 bg-gradient-to-br from-green-50/50 to-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Collected</span>
              <span className="p-1.5 rounded-lg bg-green-100 text-green-700">
                <CheckCircle2 size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-green-700">
              ₹{totalAdvanceCollected.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-green-600 mt-1 font-medium">
              {fullyPaidCount} trips fully cleared
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Balance Amount Pending */}
        <Card className="border-amber-200 bg-gradient-to-br from-amber-50/50 to-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Balance Due / Pending</span>
              <span className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
                <Clock size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-amber-700">
              ₹{totalBalancePending.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-amber-600 mt-1 font-medium">
              Payable to driver or office at trip end
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Gross Booking Value */}
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 to-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Booking Value</span>
              <span className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <DollarSign size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-blue-700">
              ₹{totalBookingValue.toLocaleString('en-IN')}
            </div>
            <p className="text-[11px] text-blue-600 mt-1 font-medium">
              Total across all active bookings
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Total Bookings Tracked */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50/50 to-white shadow-xs">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Bookings</span>
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
                <CreditCard size={16} />
              </span>
            </div>
            <div className="mt-2 text-2xl font-extrabold text-purple-700">
              {payments.length} Bookings
            </div>
            <p className="text-[11px] text-purple-600 mt-1 font-medium">
              Advance & settlement tracking active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by booking#, customer name, phone, or transaction ID..."
            className="pl-9 text-xs sm:text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-52">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payment Statuses</SelectItem>
            {STATUSES.filter((s) => s !== 'All').map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main Table: Showing Advance Paid, Balance Amount, and Clear Payment option */}
      <Card className="overflow-hidden border-border shadow-xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CreditCard className="mx-auto mb-2 opacity-30" size={36} />
              <p className="font-medium text-gray-600">No payment or booking records found</p>
              <p className="text-xs text-gray-400 mt-1">
                Click "+ Record Payment" or confirm a booking from the website to track payments here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-600 uppercase font-semibold">
                    <th className="text-left px-4 py-3.5">Booking / Trip</th>
                    <th className="text-left px-4 py-3.5">Customer</th>
                    <th className="text-left px-4 py-3.5">Total Fare</th>
                    <th className="text-left px-4 py-3.5 bg-green-50/50 text-green-900 border-l border-green-200">
                      Advance Paid
                    </th>
                    <th className="text-left px-4 py-3.5 bg-amber-50/50 text-amber-900 border-l border-amber-200">
                      Balance Amount
                    </th>
                    <th className="text-left px-4 py-3.5 hidden md:table-cell">Method</th>
                    <th className="text-left px-4 py-3.5">Status</th>
                    <th className="text-left px-4 py-3.5 hidden lg:table-cell">Date</th>
                    <th className="text-right px-4 py-3.5 min-w-[140px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((p) => {
                    const isFullyPaid = p.balance_amount <= 0;

                    return (
                      <tr key={p.id} className="hover:bg-orange-50/20 transition-colors">
                        {/* Booking Number */}
                        <td className="px-4 py-3.5">
                          <span className="font-mono text-xs font-bold text-orange-600 block">
                            {p.booking_number}
                          </span>
                          {p.notes && (
                            <span className="text-[10px] text-gray-400 truncate max-w-[180px] block mt-0.5">
                              {p.notes.split('\n')[0]}
                            </span>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="px-4 py-3.5">
                          <span className="font-semibold text-gray-900 text-xs sm:text-sm block">
                            {p.customer_name}
                          </span>
                          {p.customer_phone && (
                            <span className="text-[11px] text-gray-500 font-mono block">
                              {p.customer_phone}
                            </span>
                          )}
                        </td>

                        {/* Total Fare */}
                        <td className="px-4 py-3.5 font-bold text-gray-900">
                          ₹{p.total_amount.toLocaleString('en-IN')}
                        </td>

                        {/* Advance Paid (Green highlight) */}
                        <td className="px-4 py-3.5 bg-green-50/30 font-extrabold text-green-700">
                          <span className="inline-flex items-center gap-1">
                            ₹{p.advance_amount.toLocaleString('en-IN')}
                          </span>
                        </td>

                        {/* Balance Amount (Amber highlight or Green Cleared) */}
                        <td className="px-4 py-3.5 bg-amber-50/30">
                          {isFullyPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                              <Check size={12} className="stroke-[3]" /> Cleared (₹0)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                              ₹{p.balance_amount.toLocaleString('en-IN')} due
                            </span>
                          )}
                        </td>

                        {/* Method */}
                        <td className="px-4 py-3.5 hidden md:table-cell text-xs text-gray-600">
                          <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                            {p.payment_method}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <Badge
                            variant="outline"
                            className={`text-[11px] font-bold ${
                              isFullyPaid
                                ? statusColors['Paid']
                                : statusColors[p.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {isFullyPaid ? 'Paid' : p.status}
                          </Badge>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3.5 hidden lg:table-cell text-xs text-gray-400">
                          {new Date(p.created_at).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Quick Action: Clear Balance (if not fully paid) */}
                            {!isFullyPaid && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setClearConfirmRow(p)}
                                className="h-7 px-2 text-[11px] font-bold text-green-700 border-green-300 hover:bg-green-50 gap-1"
                                title="Clear balance & mark as fully paid"
                              >
                                <CheckCircle2 size={13} />
                                <span>Clear Balance</span>
                              </Button>
                            )}

                            {/* Edit / Manage Payment details */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditPayment(p)}
                              className="h-7 w-7 p-0 text-gray-600 hover:text-orange-600 hover:bg-orange-50"
                              title="Edit payment & balance details"
                            >
                              <Edit2 size={13} />
                            </Button>

                            {/* Delete */}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setDeleteId(p.id)}
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50"
                              title="Delete record"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* DIALOG: EDIT PAYMENT & BALANCE MANAGEMENT MODAL                           */}
      {/* ========================================================================= */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="text-orange-500" size={20} />
              <span>{isEditMode ? `Edit Payment — ${form.booking_number}` : 'Record New Payment'}</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Manage the advance amount collected, view remaining balance, and clear payment when settled.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* 1. HIGHLIGHTED BALANCE SECTION */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <Wallet size={14} /> Balance & Payment Breakdown
                </span>
                {form.balance_amount > 0 ? (
                  <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-extrabold text-[11px]">
                    ₹{form.balance_amount.toLocaleString('en-IN')} Due
                  </Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 border-green-300 font-extrabold text-[11px]">
                    ✓ Fully Paid
                  </Badge>
                )}
              </div>

              {/* 3 Metric Tiles */}
              <div className="grid grid-cols-3 gap-2.5 text-center">
                <div className="bg-white rounded-lg p-2.5 border border-amber-100 shadow-2xs">
                  <span className="text-[10px] text-gray-500 font-semibold block">Total Fare</span>
                  <span className="text-base font-extrabold text-gray-900 mt-0.5 block">
                    ₹{form.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-green-100 shadow-2xs">
                  <span className="text-[10px] text-green-700 font-semibold block">Advance Paid</span>
                  <span className="text-base font-extrabold text-green-700 mt-0.5 block">
                    ₹{form.advance_amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-2.5 border border-amber-200 shadow-2xs">
                  <span className="text-[10px] text-amber-800 font-semibold block">Balance Amount</span>
                  <span className="text-base font-extrabold text-amber-800 mt-0.5 block">
                    ₹{form.balance_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* 1-Click Button to Clear Balance and mark as Paid */}
              {form.balance_amount > 0 && (
                <Button
                  type="button"
                  onClick={setClearBalanceInForm}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-2 shadow-xs"
                >
                  <CheckCircle2 size={15} />
                  <span>Clear Full Balance (Make It Fully Paid)</span>
                </Button>
              )}
            </div>

            {/* Form Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Booking Number */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Booking Number *</Label>
                <Input
                  value={form.booking_number}
                  placeholder="e.g. SZT-BK-001"
                  onChange={(e) => setForm((f) => ({ ...f, booking_number: e.target.value }))}
                  className="text-xs font-mono"
                />
              </div>

              {/* Customer Name */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Customer Name</Label>
                <Input
                  value={form.customer_name}
                  placeholder="Customer name"
                  onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                  className="text-xs"
                />
              </div>

              {/* Total Booking Fare (₹) */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Total Fare / Quote (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.total_amount}
                  onChange={(e) => handleTotalChange(Number(e.target.value))}
                  className="text-xs font-bold"
                />
              </div>

              {/* Advance Paid (₹) */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-green-700">Advance Paid (₹) *</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.advance_amount}
                  onChange={(e) => handleAdvanceChange(Number(e.target.value))}
                  className="text-xs font-extrabold text-green-700 border-green-300"
                />
              </div>

              {/* Balance Amount (₹) */}
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold text-amber-800">
                  Balance Amount (₹) — Auto-calculated (Total - Advance)
                </Label>
                <Input
                  type="number"
                  min={0}
                  value={form.balance_amount}
                  onChange={(e) => handleBalanceChange(Number(e.target.value))}
                  className="text-xs font-extrabold text-amber-800 border-amber-300"
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Payment Method</Label>
                <Select
                  value={form.payment_method}
                  onValueChange={(v) => setForm((f) => ({ ...f, payment_method: v }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {METHODS.map((m) => (
                      <SelectItem key={m} value={m} className="text-xs">
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Payment Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(v) => setForm((f) => ({ ...f, status: v }))}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.filter((s) => s !== 'All').map((s) => (
                      <SelectItem key={s} value={s} className="text-xs">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Transaction ID */}
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold">Transaction ID / UTR / Reference</Label>
                <Input
                  value={form.transaction_id}
                  placeholder="e.g. UPI/1234567890 or Cash receipt #"
                  onChange={(e) => setForm((f) => ({ ...f, transaction_id: e.target.value }))}
                  className="text-xs font-mono"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1 sm:col-span-2">
                <Label className="text-xs font-semibold">Payment Notes & Clear Remarks</Label>
                <Textarea
                  rows={2}
                  value={form.notes}
                  placeholder="e.g. 15% advance paid by GPay, balance ₹2,500 settled in cash to driver."
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" size="sm" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 font-bold text-white text-xs"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* QUICK CONFIRM DIALOG: CLEAR BALANCE                                       */}
      {/* ========================================================================= */}
      <AlertDialog open={!!clearConfirmRow} onOpenChange={() => setClearConfirmRow(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-green-700 flex items-center gap-2">
              <CheckCircle2 size={20} /> Mark Booking as Fully Paid?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-gray-600 space-y-2">
              <p>
                Booking: <strong className="font-mono text-gray-900">{clearConfirmRow?.booking_number}</strong>
              </p>
              <p>
                Customer: <strong>{clearConfirmRow?.customer_name}</strong>
              </p>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 mt-2">
                <div className="flex justify-between text-xs">
                  <span>Remaining Balance:</span>
                  <strong className="text-amber-800">
                    ₹{clearConfirmRow?.balance_amount.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                This will clear the balance to ₹0, mark the status as <strong>"Paid"</strong>, and record the payment receipt.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => clearConfirmRow && handleQuickClearBalance(clearConfirmRow)}
              className="bg-green-600 hover:bg-green-700 font-bold text-white"
            >
              Yes, Mark as Fully Paid
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove this payment record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 font-bold">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
