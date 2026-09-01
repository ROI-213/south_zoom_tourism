import { createFileRoute, useNavigate } from '@tanstack/react-router';
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
import { toast } from 'sonner';
import { Plus, Search, MessageSquare, Loader2, Edit2, Trash2, PhoneCall, MessageCircle, ArrowRightCircle, Download, FileText } from 'lucide-react';
import { downloadTripTicketPdf, type TripTicketData } from '@/lib/trip-ticket-pdf';

export const Route = createFileRoute('/admin/operations/enquiries')({
  component: EnquiriesPage,
});

const STATUSES = ['New', 'Contacted', 'Follow-up', 'Quoted', 'Converted', 'Lost'];
const SERVICE_TYPES = ['Local Taxi', 'Outstation', 'Airport Transfer', 'Tour Package', 'Hotel Booking', 'Corporate', 'Custom'];
const statusColors: Record<string, string> = {
  New: 'bg-blue-100 text-blue-700', Contacted: 'bg-yellow-100 text-yellow-700',
  'Follow-up': 'bg-purple-100 text-purple-700', Quoted: 'bg-orange-100 text-orange-700',
  Converted: 'bg-green-100 text-green-700', Lost: 'bg-gray-100 text-gray-600',
};

type Enquiry = { id: string; name: string; phone: string; email?: string; service_type?: string; travel_date?: string; message?: string; status: string; created_at: string; };
const emptyForm = { name: '', phone: '', email: '', service_type: 'Outstation', travel_date: '', message: '', status: 'New' };

function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
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
    let q = supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') q = q.eq('status', statusFilter);
    const { data } = await q;
    setEnquiries(data || []);
    setLoading(false);
  }

  useEffect(() => { fetch(); }, [statusFilter]);

  const filtered = enquiries.filter(e => !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search));

  async function handleSave() {
    if (!form.name || !form.phone) { toast.error('Name and phone required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await supabase.from('enquiries').update(form).eq('id', editId);
        toast.success('Enquiry updated');
      } else {
        await supabase.from('enquiries').insert(form);
        toast.success('Enquiry added');
      }
      setDialogOpen(false); setForm(emptyForm); setEditId(null); fetch();
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('enquiries').update({ status }).eq('id', id);
    toast.success(`Status → ${status}`);
    fetch();
  }

  async function convertToBooking(e: Enquiry) {
    try {
      // 1. Create or get customer
      const { data: cust } = await supabase
        .from('customers')
        .upsert({ name: e.name, phone: e.phone, email: e.email || '' }, { onConflict: 'phone' })
        .select('id')
        .single();

      const bn = `SZT-${Date.now().toString().slice(-6)}`;
      const bookingData = {
        booking_number: bn,
        customer_id: cust?.id || null,
        booking_type: e.service_type || 'Outstation Round Trip',
        pickup_location: 'City Center / Specified Location',
        drop_location: 'Destination',
        pickup_date: e.travel_date || new Date().toISOString().split('T')[0],
        passengers: 4,
        total_amount: 5000,
        advance_amount: 0,
        balance_amount: 5000,
        status: 'Confirmed',
        notes: `Converted from Enquiry: ${e.message || ''}`,
      };

      await supabase.from('bookings').insert(bookingData);
      await supabase.from('enquiries').update({ status: 'Converted' }).eq('id', e.id);

      toast.success(`Enquiry converted to Booking ${bn}! Opening Bookings panel...`);
      fetch();
      window.location.href = '/admin/operations/bookings';
    } catch (err: any) {
      toast.error(`Failed to convert: ${err.message}`);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Enquiries & Leads CRM</h1>
          <p className="text-sm text-gray-500">Manage client enquiries, send WhatsApp quotes, and convert to bookings</p>
        </div>
        <Button onClick={() => { setForm(emptyForm); setEditId(null); setDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Plus size={16} /> Add Enquiry
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {STATUSES.map(s => (
          <Card key={s} className="cursor-pointer hover:shadow-sm" onClick={() => setStatusFilter(s)}>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-bold">{enquiries.filter(e => e.status === s).length}</div>
              <div className={`text-xs mt-0.5 px-2 py-0.5 rounded-full inline-block ${statusColors[s]}`}>{s}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search by name, phone or message..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="All Statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin text-orange-500" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400"><MessageSquare className="mx-auto mb-2 opacity-30" size={32}/><p>No enquiries found</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Service</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Travel Date</th>
                    <th className="text-left px-4 py-3 hidden lg:table-cell">Message / Requirement</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Received</th>
                    <th className="text-right px-4 py-3">Actions & Quote</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map(e => {
                    const phoneClean = e.phone.replace(/\D/g, '');
                    const waPhone = phoneClean.startsWith('91') ? phoneClean : `91${phoneClean}`;
                    const quoteMsg = `Hello ${e.name},\nThank you for reaching out to *South Zoom Tourism* regarding your travel enquiry for ${e.service_type || 'Cab / Tour Services'}.\nWe are pleased to assist you with the best rates and premium vehicles.\n\nCould you please confirm your pickup location and preferred timings?\n\nHelpline: +91 98450 12345\nhttps://southzoomtourism.com`;

                    return (
                      <tr key={e.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{e.name}</div>
                          <div className="text-xs text-gray-500">{e.phone}</div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-600 font-medium">{e.service_type || '—'}</td>
                        <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{e.travel_date || '—'}</td>
                        <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600 max-w-xs truncate">{e.message || '—'}</td>
                        <td className="px-4 py-3">
                          <Select value={e.status} onValueChange={v => updateStatus(e.id, v)}>
                            <SelectTrigger className="h-6 text-xs border-0 p-0 focus:ring-0">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[e.status]}`}>{e.status}</span>
                            </SelectTrigger>
                            <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-xs text-gray-400">{new Date(e.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end items-center gap-1">
                            {/* WhatsApp Quote */}
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                              onClick={() => window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(quoteMsg)}`, '_blank')}
                              title="Send Quote on WhatsApp"
                            >
                              <MessageCircle size={12} /> WhatsApp
                            </Button>

                            {/* Convert to Booking */}
                            {e.status !== 'Converted' && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 text-xs gap-1 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200"
                                onClick={() => convertToBooking(e)}
                                title="Convert Lead into Booking"
                              >
                                <ArrowRightCircle size={12} /> Book
                              </Button>
                            )}

                            {/* Edit */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-gray-600 hover:text-orange-600"
                              onClick={() => {
                                setEditId(e.id);
                                setForm({
                                  name: e.name,
                                  phone: e.phone,
                                  email: e.email || '',
                                  service_type: e.service_type || 'Outstation',
                                  travel_date: e.travel_date || '',
                                  message: e.message || '',
                                  status: e.status,
                                });
                                setDialogOpen(true);
                              }}
                              title="Edit Enquiry"
                            >
                              <Edit2 size={13} />
                            </Button>

                            {/* Delete */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-red-500 hover:text-red-600"
                              onClick={() => setDeleteId(e.id)}
                              title="Delete Enquiry"
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

      {/* Edit / Add Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editId ? 'Edit Enquiry / Lead' : 'Add Enquiry'}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-2">
            <div className="space-y-1"><Label>Customer Name *</Label><Input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Phone Number *</Label><Input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Email</Label><Input value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Service Required</Label>
              <Select value={form.service_type} onValueChange={v => setForm(f => ({...f, service_type: v}))}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>{SERVICE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Travel Date</Label><Input type="date" value={form.travel_date} onChange={e => setForm(f => ({...f, travel_date: e.target.value}))} /></div>
            <div className="space-y-1"><Label>Status</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({...f, status: v}))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-1"><Label>Customer Message / Requirement</Label><Textarea rows={3} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-orange-500 hover:bg-orange-600">
              {saving ? <><Loader2 size={14} className="animate-spin mr-1"/>Saving...</> : 'Save Enquiry'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Enquiry?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the enquiry record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { await supabase.from('enquiries').delete().eq('id', deleteId!); toast.success('Deleted'); setDeleteId(null); fetch(); }} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

