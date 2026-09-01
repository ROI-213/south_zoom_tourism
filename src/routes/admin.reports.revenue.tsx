import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, TrendingUp, Loader2, DollarSign, ArrowUpRight } from 'lucide-react';

export const Route = createFileRoute('/admin/reports/revenue')({
  component: RevenueReportsPage,
});

function RevenueReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchRevenue() {
    setLoading(true);
    const { data } = await supabase
      .from('payments')
      .select('*, bookings(booking_number, booking_type, customers(name))')
      .order('created_at', { ascending: false });
    setPayments(data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchRevenue();
  }, []);

  const paidPayments = payments.filter((p) => p.status === 'Paid');
  const totalRevenue = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const upiRevenue = paidPayments
    .filter((p) => p.payment_method?.toLowerCase().includes('upi') || p.payment_method?.toLowerCase().includes('gpay') || p.payment_method?.toLowerCase().includes('phonepe'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const cashRevenue = paidPayments
    .filter((p) => p.payment_method?.toLowerCase().includes('cash'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const bankRevenue = paidPayments
    .filter((p) => p.payment_method?.toLowerCase().includes('bank') || p.payment_method?.toLowerCase().includes('card'))
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const exportCSV = () => {
    if (paidPayments.length === 0) {
      toast.error('No revenue data to export');
      return;
    }
    const headers = ['Transaction ID', 'Booking #', 'Customer', 'Method', 'Amount (INR)', 'Status', 'Date'];
    const rows = paidPayments.map((p) => [
      p.transaction_id || 'N/A',
      p.bookings?.booking_number || 'N/A',
      p.bookings?.customers?.name || 'N/A',
      p.payment_method,
      p.amount,
      p.status,
      new Date(p.created_at).toLocaleDateString('en-IN'),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `southzoom_revenue_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Revenue report exported');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Revenue & Financial Statements</h1>
          <p className="text-sm text-gray-500">Breakdown of earnings, payment methods, and cash flow</p>
        </div>
        <Button onClick={exportCSV} className="bg-orange-500 hover:bg-orange-600 gap-2">
          <Download size={16} /> Export Financial CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-200">
          <CardContent className="p-4">
            <div className="text-xs text-green-700 font-medium">Total Settled Revenue</div>
            <div className="text-2xl font-bold text-green-800 mt-1">₹{totalRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">UPI / QR Collections</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">₹{upiRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Cash Settlements</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">₹{cashRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-gray-500">Bank Transfer / Cards</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">₹{bankRevenue.toLocaleString('en-IN')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp size={16} /> Recent Paid Settlements
          </CardTitle>
          <CardDescription>Verified incoming payments credited to South Zoom accounts.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-orange-500" />
            </div>
          ) : paidPayments.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <TrendingUp className="mx-auto mb-2 opacity-30" size={32} />
              <p>No settled transactions recorded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Transaction Ref</th>
                    <th className="text-left px-4 py-3">Booking #</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Method</th>
                    <th className="text-left px-4 py-3">Amount</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {paidPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">{p.transaction_id || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-orange-600">
                        {p.bookings?.booking_number || 'Direct'}
                      </td>
                      <td className="px-4 py-3 font-medium">{p.bookings?.customers?.name || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">{p.payment_method}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">₹{(p.amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {new Date(p.created_at).toLocaleDateString('en-IN')}
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
