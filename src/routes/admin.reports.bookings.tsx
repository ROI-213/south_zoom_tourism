import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Search, BarChart3, Loader2, Calendar } from 'lucide-react';

export const Route = createFileRoute('/admin/reports/bookings')({
  component: BookingReportsPage,
});

function BookingReportsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  async function fetchReport() {
    setLoading(true);
    let q = supabase
      .from('bookings')
      .select('*, customers(name, phone)')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      q = q.eq('status', statusFilter);
    }
    if (startDate) {
      q = q.gte('created_at', new Date(startDate).toISOString());
    }
    if (endDate) {
      q = q.lte('created_at', new Date(endDate + 'T23:59:59').toISOString());
    }

    const { data } = await q;
    setBookings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchReport();
  }, [statusFilter, startDate, endDate]);

  const totalValue = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const totalAdvance = bookings.reduce((sum, b) => sum + (b.advance_amount || 0), 0);

  const exportCSV = () => {
    if (bookings.length === 0) {
      toast.error('No data to export');
      return;
    }
    const headers = ['Booking Number', 'Customer Name', 'Phone', 'Type', 'Pickup', 'Drop', 'Status', 'Total (INR)', 'Advance (INR)', 'Date'];
    const rows = bookings.map((b) => [
      b.booking_number,
      b.customers?.name || '',
      b.customers?.phone || '',
      b.booking_type,
      b.pickup_location,
      b.drop_location,
      b.status,
      b.total_amount,
      b.advance_amount,
      new Date(b.created_at).toLocaleDateString('en-IN'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `southzoom_bookings_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported to CSV');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Booking Analytics & Reports</h1>
          <p className="text-sm text-gray-500">Filter, summarize and export bookings data</p>
        </div>
        <Button onClick={exportCSV} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Download size={16} /> Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Filtered Bookings</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{bookings.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Total Bookings Value</div>
            <div className="text-2xl font-bold text-green-600 mt-1">₹{totalValue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Advance Collected</div>
            <div className="text-2xl font-bold text-blue-600 mt-1">₹{totalAdvance.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-500">From Date</label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">To Date</label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-500">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Confirmed">Confirmed</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <BarChart3 className="mx-auto mb-2 opacity-30" size={32} />
              <p>No bookings match criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Booking #</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Type</th>
                    <th className="text-left px-4 py-3">Route</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-orange-600">{b.booking_number}</td>
                      <td className="px-4 py-3 font-medium">{b.customers?.name || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{b.booking_type}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {b.pickup_location} → {b.drop_location}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span className="px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-700">{b.status}</span>
                      </td>
                      <td className="px-4 py-3 font-semibold">₹{(b.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(b.created_at).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
