import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Search, CalendarDays, Clock, CheckCircle, XCircle, Loader2, Edit2, Trash2, Download, MessageCircle, UserCheck, Car, Coins, Wallet, IndianRupee } from 'lucide-react';
import { downloadTripTicketPdf, generateTicketWhatsAppShare, type TripTicketData } from '@/lib/trip-ticket-pdf';

export const Route = createFileRoute('/admin/operations/bookings')({
  component: BookingsPage,
});

const STATUSES = ['New', 'Enquiry', 'Pending', 'Confirmed', 'Driver Assigned', 'Vehicle Assigned', 'In Progress', 'Completed', 'Cancelled', 'Refunded'];
const BOOKING_TYPES = ['Local Taxi', 'Outstation One-Way', 'Outstation Round Trip', 'Airport Transfer', 'Corporate Travel', 'Group Travel', 'Tour Package', 'Hotel Booking', 'Custom Booking'];
const BALANCE_MODES = [
  'Cash to Driver at Trip End',
  'UPI Scan to Driver at Drop',
  'Direct UPI / Online to South Zoom Office',
  'Full Advance Paid (No Balance Due)',
];

const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700', Enquiry: 'bg-indigo-100 text-indigo-700',
  Pending: 'bg-yellow-100 text-yellow-700', Confirmed: 'bg-green-100 text-green-700',
  'Driver Assigned': 'bg-purple-100 text-purple-700', 'Vehicle Assigned': 'bg-cyan-100 text-cyan-700',
  'In Progress': 'bg-orange-100 text-orange-700', Completed: 'bg-gray-100 text-gray-700',
  Cancelled: 'bg-red-100 text-red-700', Refunded: 'bg-pink-100 text-pink-700',
};

type Driver = { id: string; name: string; phone: string; whatsapp?: string; license_number?: string; status: string; };

type Booking = {
  id: string; booking_number: string; booking_type: string; status: string;
  pickup_location: string; drop_location: string; pickup_date: string; return_date?: string;
  passengers: number; total_amount: number; advance_amount: number; balance_amount: number;
  notes: string; created_at: string; driver_id?: string; fleet_id?: string;
  customers?: { name: string; phone: string; email: string } | null;
  drivers?: { name: string; phone: string; license_number?: string } | null;
};

const emptyForm = {
  customer_name: '', customer_phone: '', customer_email: '',
  booking_type: 'Outstation Round Trip', pickup_location: '', drop_location: '',
  pickup_date: '', pickup_time: '06:00', return_date: '', passengers: 4,
  total_amount: 0, advance_amount: 0, balance_amount: 0,
  balance_payment_mode: 'Cash to Driver at Trip End',
  notes: '', status: 'Confirmed',
  driver_id: '', driver_name: '', driver_phone: '', driver_license: '',
  vehicle_name: 'Toyota Innova Crysta', vehicle_number: '',
};

function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [driversList, setDriversList] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  async function fetchAll() {
    setLoading(true);
    try {
      let q = supabase.from('bookings').select('*, customers(name,phone,email), drivers(name,phone,license_number)').order('created_at', { ascending: false });
      if (statusFilter !== 'all') q = q.eq('status', statusFilter);
      const { data: bData } = await q;
      setBookings(bData || []);

      const { data: dData } = await supabase.from('drivers').select('*').order('name');
      setDriversList(dData || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAll();
  }, [statusFilter]);

  const filtered = bookings.filter(b =>
    !search ||
    b.booking_number?.toLowerCase().includes(search.toLowerCase()) ||
    b.customers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.customers?.phone?.includes(search) ||
    b.drivers?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.pickup_location?.toLowerCase().includes(search.toLowerCase()) ||
    b.drop_location?.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const totalPages = Math.ceil(filtered.length / PER_PAGE);

  const counts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'Pending' || b.status === 'New').length,
    confirmed: bookings.filter(b => b.status === 'Confirmed' || b.status === 'Driver Assigned').length,
    completed: bookings.filter(b => b.status === 'Completed').length,
  };

  function createTicketData(b: Booking): TripTicketData {
    let vName = 'Toyota Innova Crysta';
    let vReg = '';
    let dName = b.drivers?.name || '';
    let dPhone = b.drivers?.phone || '';
    let dLic = b.drivers?.license_number || '';
    let cName = b.customers?.name || '';
    let cPhone = b.customers?.phone || '';
    let cEmail = b.customers?.email || '';

    if (b.notes) {
      if (b.notes.includes('Vehicle:')) vName = b.notes.split('Vehicle:')[1]?.split('\n')[0]?.trim() || vName;
      if (b.notes.includes('Reg:')) vReg = b.notes.split('Reg:')[1]?.split('\n')[0]?.trim() || '';
      if (!dName && b.notes.includes('Driver:')) dName = b.notes.split('Driver:')[1]?.split('\n')[0]?.trim() || '';
      if (!dPhone && b.notes.includes('Driver Phone:')) dPhone = b.notes.split('Driver Phone:')[1]?.split('\n')[0]?.trim() || '';
      if (!cName && b.notes.includes('Customer:')) {
        const custLine = b.notes.split('Customer:')[1]?.split('\n')[0]?.trim() || '';
        cName = custLine.split('(')[0]?.trim() || '';
        cPhone = custLine.split('(')[1]?.replace(')', '')?.trim() || '';
      }
    }

    return {
      bookingNumber: b.booking_number,
      bookingType: b.booking_type,
      status: b.status,
      customerName: cName || 'Customer',
      customerPhone: cPhone || '',
      customerEmail: cEmail || '',
      pickupLocation: b.pickup_location || 'Pickup Point',
      dropLocation: b.drop_location || 'Destination',
      pickupDate: b.pickup_date ? new Date(b.pickup_date).toLocaleDateString('en-IN') : 'Scheduled',
      passengers: b.passengers || 1,
      vehicleName: vName,
      vehicleNumber: vReg,
      driverName: dName || 'To be assigned',
      driverPhone: dPhone,
      driverLicense: dLic,
      totalAmount: b.total_amount || 0,
      advanceAmount: b.advance_amount || 0,
      balanceAmount: b.balance_amount || ((b.total_amount || 0) - (b.advance_amount || 0)),
      notes: b.notes || '',
    };
  }

  async function handleSave() {
    if (!form.pickup_location || !form.booking_type) {
      toast.error('Please enter pickup location and booking type');
      return;
    }
    setSaving(true);
    try {
      // Upsert customer
      let customerId: string | null = null;
      if (form.customer_name && form.customer_phone) {
        const { data: cust } = await supabase
          .from('customers')
          .upsert(
            { name: form.customer_name, phone: form.customer_phone, email: form.customer_email },
            { onConflict: 'phone' }
          )
          .select('id')
          .single();
        customerId = cust?.id || null;
      }

      // Build structured notes with vehicle and driver info
      let composedNotes = form.notes || '';
      if (form.vehicle_name && !composedNotes.includes('Vehicle:')) {
        composedNotes = `Vehicle: ${form.vehicle_name}\n${composedNotes}`;
      }
      if (form.vehicle_number && !composedNotes.includes('Reg:')) {
        composedNotes = `Reg: ${form.vehicle_number}\n${composedNotes}`;
      }
      if (form.balance_payment_mode && !composedNotes.includes('Balance Mode:')) {
        composedNotes = `Balance Mode: ${form.balance_payment_mode}\n${composedNotes}`;
      }

      const bookingData = {
        customer_id: customerId,
        booking_type: form.booking_type,
        status: form.status,
        pickup_location: form.pickup_location,
        drop_location: form.drop_location,
        pickup_date: form.pickup_date || null,
        return_date: form.return_date || null,
        passengers: form.passengers,
        total_amount: form.total_amount,
        advance_amount: form.advance_amount,
        balance_amount: form.balance_amount,
        notes: composedNotes.trim(),
        driver_id: form.driver_id || null,
      };

      if (editId) {
        await supabase.from('bookings').update(bookingData).eq('id', editId);
        toast.success('Booking & Driver details updated successfully');
      } else {
        const bn = `SZT-${Date.now().toString().slice(-6)}`;
        await supabase.from('bookings').insert({ ...bookingData, booking_number: bn });
        toast.success(`Booking ${bn} created successfully`);
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save booking');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    await supabase.from('bookings').delete().eq('id', deleteId);
    toast.success('Booking deleted');
    setDeleteId(null);
    fetchAll();
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('bookings').update({ status }).eq('id', id);
    toast.success(`Status updated to ${status}`);
    fetchAll();
  }

  function openEdit(b: Booking) {
    setEditId(b.id);
    const assignedDriver = driversList.find(d => d.id === b.driver_id) || b.drivers;

    let vName = 'Toyota Innova Crysta';
    let vReg = '';
    let dName = assignedDriver?.name || '';
    let dPhone = assignedDriver?.phone || '';
    let dLic = assignedDriver?.license_number || '';
    let cName = b.customers?.name || '';
    let cPhone = b.customers?.phone || '';
    let cEmail = b.customers?.email || '';

    let bPayMode = 'Cash to Driver at Trip End';

    if (b.notes) {
      if (b.notes.includes('Vehicle:')) vName = b.notes.split('Vehicle:')[1]?.split('\n')[0]?.trim() || vName;
      if (b.notes.includes('Reg:')) vReg = b.notes.split('Reg:')[1]?.split('\n')[0]?.trim() || '';
      if (!dName && b.notes.includes('Driver:')) dName = b.notes.split('Driver:')[1]?.split('\n')[0]?.trim() || '';
      if (!dPhone && b.notes.includes('Driver Phone:')) dPhone = b.notes.split('Driver Phone:')[1]?.split('\n')[0]?.trim() || '';
      if (!cName && b.notes.includes('Customer:')) {
        const custLine = b.notes.split('Customer:')[1]?.split('\n')[0]?.trim() || '';
        cName = custLine.split('(')[0]?.trim() || '';
        cPhone = custLine.split('(')[1]?.replace(')', '')?.trim() || '';
      }
      if (b.notes.includes('Balance Mode:')) {
        bPayMode = b.notes.split('Balance Mode:')[1]?.split('\n')[0]?.trim() || bPayMode;
      }
    }

    const total = b.total_amount || 0;
    const advance = b.advance_amount || 0;
    const balance = b.balance_amount !== undefined && b.balance_amount !== null ? b.balance_amount : Math.max(0, total - advance);

    setForm({
      customer_name: cName,
      customer_phone: cPhone,
      customer_email: cEmail,
      booking_type: b.booking_type || 'Outstation Round Trip',
      pickup_location: b.pickup_location || '',
      drop_location: b.drop_location || '',
      pickup_date: b.pickup_date ? b.pickup_date.slice(0, 10) : '',
      pickup_time: '06:00',
      return_date: b.return_date ? b.return_date.slice(0, 10) : '',
      passengers: b.passengers || 4,
      total_amount: total,
      advance_amount: advance,
      balance_amount: balance,
      balance_payment_mode: bPayMode,
      notes: b.notes || '',
      status: b.status || 'Confirmed',
      driver_id: b.driver_id || '',
      driver_name: dName,
      driver_phone: dPhone,
      driver_license: dLic,
      vehicle_name: vName,
      vehicle_number: vReg,
    });
    setDialogOpen(true);
  }

  function handleDriverSelect(driverId: string) {
    if (driverId === 'none') {
      setForm(f => ({ ...f, driver_id: '', driver_name: '', driver_phone: '', driver_license: '' }));
      return;
    }
    const found = driversList.find(d => d.id === driverId);
    if (found) {
      setForm(f => ({
        ...f,
        driver_id: found.id,
        driver_name: found.name,
        driver_phone: found.phone,
        driver_license: found.license_number || '',
        status: f.status === 'New' || f.status === 'Pending' ? 'Driver Assigned' : f.status,
      }));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Bookings & Fleet Operations</h1>
          <p className="text-sm text-gray-500">Manage client bookings, assign drivers & generate PDF trip tickets</p>
        </div>
        <Button
          onClick={() => {
            setForm(emptyForm);
            setEditId(null);
            setDialogOpen(true);
          }}
          className="bg-orange-500 hover:bg-orange-600 gap-2"
        >
          <Plus size={16} /> New Booking
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Bookings', value: counts.total, icon: CalendarDays, color: 'text-blue-500' },
          { label: 'Pending Requests', value: counts.pending, icon: Clock, color: 'text-yellow-500' },
          { label: 'Confirmed / Assigned', value: counts.confirmed, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Completed Trips', value: counts.completed, icon: CheckCircle, color: 'text-gray-500' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon size={22} className={s.color} />
              <div>
                <div className="text-xl font-bold">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search booking#, customer, driver or route..."
            className="pl-9"
            value={search}
            onChange={e => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={v => {
            setStatusFilter(v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="animate-spin text-orange-500" size={28} />
            </div>
          ) : paged.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <CalendarDays className="mx-auto mb-2 opacity-30" size={36} />
              <p>No bookings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Booking #</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Trip Route</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Assigned Driver</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Date</th>
                    <th className="text-left px-4 py-3">Fare / Balance</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions & PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paged.map(b => {
                    const ticketData = createTicketData(b);
                    const isDriverAssigned = Boolean(b.drivers?.name || (b.notes && b.notes.includes('Driver:')));

                    return (
                      <tr key={b.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-mono text-xs text-orange-600 font-semibold">
                          {b.booking_number}
                          <div className="text-[10px] text-gray-400 font-normal">{b.booking_type}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{ticketData.customerName}</div>
                          <div className="text-xs text-gray-500">{ticketData.customerPhone || '—'}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">
                          <div className="font-medium">{b.pickup_location} → {b.drop_location}</div>
                          <div className="text-[11px] text-gray-400">{b.passengers} Passengers</div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs">
                          {isDriverAssigned ? (
                            <div className="flex items-center gap-1.5 text-purple-700 bg-purple-50 px-2 py-1 rounded w-fit">
                              <UserCheck size={13} className="shrink-0" />
                              <div>
                                <div className="font-semibold">{ticketData.driverName}</div>
                                {ticketData.driverPhone && <div className="text-[10px] text-purple-600">{ticketData.driverPhone}</div>}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-xs italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600">
                          {b.pickup_date ? new Date(b.pickup_date).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="font-bold text-gray-900">₹{(b.total_amount || 0).toLocaleString('en-IN')}</div>
                          <div className="text-[10px] text-amber-700">Bal: ₹{((b.total_amount || 0) - (b.advance_amount || 0)).toLocaleString('en-IN')}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Select value={b.status} onValueChange={v => updateStatus(b.id, v)}>
                            <SelectTrigger className="h-6 text-xs border-0 p-0 focus:ring-0">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[b.status] || 'bg-gray-100 text-gray-600'}`}>
                                {b.status}
                              </span>
                            </SelectTrigger>
                            <SelectContent>
                              {STATUSES.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end items-center gap-1">
                            {/* Download PDF Ticket */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                              onClick={() => {
                                downloadTripTicketPdf(ticketData);
                                toast.success(`PDF Ticket downloaded for ${b.booking_number}`);
                              }}
                              title="Download PDF Ticket / Voucher"
                            >
                              <Download size={12} /> Ticket
                            </Button>

                            {/* Share on WhatsApp */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                              onClick={() => {
                                const msg = generateTicketWhatsAppShare(ticketData);
                                const phoneClean = b.customers?.phone?.replace(/\D/g, '') || '';
                                window.open(
                                  `https://wa.me/${phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`}?text=${encodeURIComponent(msg)}`,
                                  '_blank'
                                );
                              }}
                              title="Share Confirmation Ticket on WhatsApp"
                            >
                              <MessageCircle size={12} /> Share
                            </Button>

                            {/* Edit Booking */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-600 hover:text-orange-600"
                              onClick={() => openEdit(b)}
                              title="Edit Booking & Driver"
                            >
                              <Edit2 size={13} />
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => setDeleteId(b.id)}
                              title="Delete Booking"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-500">
          <span>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Edit Booking & Assign Driver Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Car className="text-orange-500" size={20} />
              {editId ? 'Edit Booking & Assign Driver' : 'Create New Booking'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Customer Details */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">1. Customer Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Customer Name *</Label>
                  <Input value={form.customer_name} onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))} placeholder="e.g. Ramesh Kumar" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone Number *</Label>
                  <Input value={form.customer_phone} onChange={e => setForm(f => ({ ...f, customer_phone: e.target.value }))} placeholder="e.g. +91 98450 12345" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Email (Optional)</Label>
                  <Input value={form.customer_email} onChange={e => setForm(f => ({ ...f, customer_email: e.target.value }))} placeholder="client@example.com" />
                </div>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-gray-50 p-3 rounded-lg border">
              <h3 className="text-xs font-bold uppercase text-gray-500 mb-2">2. Trip Itinerary & Schedule</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Booking Type *</Label>
                  <Select value={form.booking_type} onValueChange={v => setForm(f => ({ ...f, booking_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BOOKING_TYPES.map(t => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pickup Location *</Label>
                  <Input value={form.pickup_location} onChange={e => setForm(f => ({ ...f, pickup_location: e.target.value }))} placeholder="Airport / Hotel / City" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Drop / Destination *</Label>
                  <Input value={form.drop_location} onChange={e => setForm(f => ({ ...f, drop_location: e.target.value }))} placeholder="Destination city" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pickup Date</Label>
                  <Input type="date" value={form.pickup_date} onChange={e => setForm(f => ({ ...f, pickup_date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pickup Time</Label>
                  <Input type="time" value={form.pickup_time} onChange={e => setForm(f => ({ ...f, pickup_time: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Return Date (Optional)</Label>
                  <Input type="date" value={form.return_date} onChange={e => setForm(f => ({ ...f, return_date: e.target.value }))} />
                </div>
              </div>
            </div>

            {/* Driver & Vehicle Assignment */}
            <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
              <h3 className="text-xs font-bold uppercase text-purple-800 mb-2 flex items-center gap-1.5">
                <UserCheck size={14} /> 3. Assign Driver & Vehicle (Appears on PDF Ticket)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-purple-900">Select Available Driver</Label>
                  <Select value={form.driver_id || 'none'} onValueChange={handleDriverSelect}>
                    <SelectTrigger className="bg-white"><SelectValue placeholder="Choose Driver" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">-- Custom / Unassigned --</SelectItem>
                      {driversList.map(d => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.phone})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-purple-900">Driver Name</Label>
                  <Input className="bg-white" value={form.driver_name} onChange={e => setForm(f => ({ ...f, driver_name: e.target.value }))} placeholder="Driver Full Name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-purple-900">Driver Mobile / WhatsApp</Label>
                  <Input className="bg-white" value={form.driver_phone} onChange={e => setForm(f => ({ ...f, driver_phone: e.target.value }))} placeholder="+91 98450..." />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-purple-900">Assigned Vehicle Model</Label>
                  <Input className="bg-white" value={form.vehicle_name} onChange={e => setForm(f => ({ ...f, vehicle_name: e.target.value }))} placeholder="Innova Crysta / Dzire" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-purple-900">Vehicle Registration Number</Label>
                  <Input className="bg-white uppercase font-mono" value={form.vehicle_number} onChange={e => setForm(f => ({ ...f, vehicle_number: e.target.value.toUpperCase() }))} placeholder="e.g. KA 04 MP 5678" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold text-purple-900">Commercial License No.</Label>
                  <Input className="bg-white uppercase font-mono" value={form.driver_license} onChange={e => setForm(f => ({ ...f, driver_license: e.target.value }))} placeholder="KA042015000..." />
                </div>
              </div>
            </div>

            {/* Fare & Status */}
            <div className="bg-gray-50 p-3.5 rounded-lg border space-y-3">
              <h3 className="text-xs font-bold uppercase text-gray-700 flex items-center gap-1.5">
                <Coins size={15} className="text-amber-600" />
                4. Fare, Advance & Trip-End Balance Collection
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">Total Trip Fare (₹) *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.total_amount}
                    onChange={e => {
                      const tot = +e.target.value;
                      setForm(f => ({
                        ...f,
                        total_amount: tot,
                        balance_amount: Math.max(0, tot - f.advance_amount),
                      }));
                    }}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Advance Received (₹)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.advance_amount}
                    onChange={e => {
                      const adv = +e.target.value;
                      setForm(f => ({
                        ...f,
                        advance_amount: adv,
                        balance_amount: Math.max(0, f.total_amount - adv),
                      }));
                    }}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-1 bg-amber-50/80 p-1.5 rounded-md border border-amber-200">
                  <Label className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <IndianRupee size={12} /> Balance to Receive After Trip *
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    className="bg-white font-bold text-amber-900 border-amber-300"
                    value={form.balance_amount}
                    onChange={e => setForm(f => ({ ...f, balance_amount: +e.target.value }))}
                    placeholder="0"
                  />
                  <div className="text-[10px] text-amber-700 font-medium">Payable at drop</div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium">Booking Status</Label>
                  <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUSES.map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1">
                  <Label className="text-xs font-medium">Trip-End Balance Collection Mode</Label>
                  <Select value={form.balance_payment_mode} onValueChange={v => setForm(f => ({ ...f, balance_payment_mode: v }))}>
                    <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {BALANCE_MODES.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-1 sm:col-span-2 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-emerald-800 uppercase">Driver Collection Summary</div>
                    <div className="text-xs text-emerald-700">
                      Collect at Drop: <span className="font-bold font-mono text-sm">₹{form.balance_amount.toLocaleString('en-IN')}</span> ({form.balance_payment_mode})
                    </div>
                  </div>
                </div>

                <div className="col-span-1 sm:col-span-4 space-y-1">
                  <Label className="text-xs font-medium">Special Instructions / Remarks</Label>
                  <Textarea
                    rows={2}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                    placeholder="Luggage carrier needed, pet travelling, pickup near gate 2..."
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex gap-2 w-full sm:w-auto">
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-300"
                  onClick={() => {
                    const ticketData: TripTicketData = {
                      bookingNumber: editId ? (bookings.find(b => b.id === editId)?.booking_number || 'SZT-TICKET') : 'SZT-TICKET',
                      customerName: form.customer_name,
                      customerPhone: form.customer_phone,
                      customerEmail: form.customer_email,
                      pickupLocation: form.pickup_location,
                      dropLocation: form.drop_location,
                      pickupDate: form.pickup_date,
                      pickupTime: form.pickup_time,
                      returnDate: form.return_date,
                      passengers: form.passengers,
                      vehicleName: form.vehicle_name,
                      vehicleNumber: form.vehicle_number,
                      driverName: form.driver_name,
                      driverPhone: form.driver_phone,
                      driverLicense: form.driver_license,
                      totalAmount: form.total_amount,
                      advanceAmount: form.advance_amount,
                      balanceAmount: form.balance_amount,
                      notes: form.notes,
                    };
                      downloadTripTicketPdf(ticketData);
                    toast.success('Generated PDF ticket voucher');
                  }}
                >
                  <Download size={14} /> Download PDF Ticket
                </Button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
                {saving ? <><Loader2 size={14} className="animate-spin mr-1" />Saving...</> : 'Save & Update Booking'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone. The booking will be permanently removed.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

