import { createFileRoute, Link } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CalendarDays, Users, Car, TrendingUp, MessageSquare, UserCheck,
  CreditCard, Clock, Plus, Eye, Loader2, ArrowRight
} from 'lucide-react';

export const Route = createFileRoute('/admin/')({
  component: AdminDashboard,
});

type Stats = {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalCustomers: number;
  totalDrivers: number;
  totalVehicles: number;
  newEnquiries: number;
  totalRevenue: number;
  pendingPayments: number;
};

function StatCard({ title, value, icon: Icon, color, sub }: { title: string; value: string | number; icon: React.ElementType; color: string; sub?: string }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="mt-1.5 text-2xl font-bold text-gray-900">{value}</p>
            {sub && <p className="mt-0.5 text-xs text-gray-500">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${color}`}>
            <Icon size={18} className="text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const quickActions = [
  { label: 'New Booking', icon: Plus, href: '/admin/operations/bookings', color: 'bg-orange-500 hover:bg-orange-600' },
  { label: 'View Enquiries', icon: MessageSquare, href: '/admin/operations/enquiries', color: 'bg-blue-500 hover:bg-blue-600' },
  { label: 'Add Vehicle', icon: Car, href: '/admin/operations/vehicles', color: 'bg-green-500 hover:bg-green-600' },
  { label: 'Add Driver', icon: UserCheck, href: '/admin/operations/drivers', color: 'bg-purple-500 hover:bg-purple-600' },
  { label: 'Add Package', icon: CalendarDays, href: '/admin/products/packages', color: 'bg-indigo-500 hover:bg-indigo-600' },
  { label: 'Payments', icon: CreditCard, href: '/admin/operations/payments', color: 'bg-pink-500 hover:bg-pink-600' },
];

function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0, pendingBookings: 0, confirmedBookings: 0, completedBookings: 0,
    totalCustomers: 0, totalDrivers: 0, totalVehicles: 0, newEnquiries: 0,
    totalRevenue: 0, pendingPayments: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bookRes, custRes, driverRes, fleetRes, enquiryRes, payRes] = await Promise.all([
          supabase.from('bookings').select('status, total_amount'),
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('drivers').select('id', { count: 'exact', head: true }),
          supabase.from('fleets').select('id', { count: 'exact', head: true }),
          supabase.from('enquiries').select('id', { count: 'exact', head: true }).eq('status', 'New'),
          supabase.from('payments').select('amount, status'),
        ]);

        const bookings = bookRes.data || [];
        const payments = payRes.data || [];

        setStats({
          totalBookings: bookings.length,
          pendingBookings: bookings.filter(b => b.status === 'Pending').length,
          confirmedBookings: bookings.filter(b => b.status === 'Confirmed').length,
          completedBookings: bookings.filter(b => b.status === 'Completed').length,
          totalCustomers: custRes.count || 0,
          totalDrivers: driverRes.count || 0,
          totalVehicles: fleetRes.count || 0,
          newEnquiries: enquiryRes.count || 0,
          totalRevenue: payments.filter(p => p.status === 'Paid').reduce((s, p) => s + (p.amount || 0), 0),
          pendingPayments: payments.filter(p => p.status === 'Pending').reduce((s, p) => s + (p.amount || 0), 0),
        });

        const { data: recent } = await supabase
          .from('bookings')
          .select('booking_number, booking_type, status, total_amount, pickup_location, drop_location, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        setRecentBookings(recent || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statusColor: Record<string, string> = {
    New: 'bg-blue-100 text-blue-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Confirmed: 'bg-green-100 text-green-700',
    'Driver Assigned': 'bg-purple-100 text-purple-700',
    'In Progress': 'bg-orange-100 text-orange-700',
    Completed: 'bg-gray-100 text-gray-700',
    Cancelled: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-500">Live</span>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><div className="h-16 bg-gray-100 rounded animate-pulse" /></CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Total Bookings" value={stats.totalBookings} icon={CalendarDays} color="bg-orange-500" />
          <StatCard title="Pending" value={stats.pendingBookings} icon={Clock} color="bg-yellow-500" />
          <StatCard title="Confirmed" value={stats.confirmedBookings} icon={CalendarDays} color="bg-green-500" />
          <StatCard title="Completed" value={stats.completedBookings} icon={CalendarDays} color="bg-gray-500" />
          <StatCard title="Total Customers" value={stats.totalCustomers} icon={Users} color="bg-blue-500" />
          <StatCard title="Drivers" value={stats.totalDrivers} icon={UserCheck} color="bg-purple-500" />
          <StatCard title="Vehicles" value={stats.totalVehicles} icon={Car} color="bg-indigo-500" />
          <StatCard title="New Enquiries" value={stats.newEnquiries} icon={MessageSquare} color="bg-pink-500" />
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} icon={TrendingUp} color="bg-emerald-500" />
          <StatCard title="Pending Payments" value={`₹${stats.pendingPayments.toLocaleString('en-IN')}`} icon={CreditCard} color="bg-red-500" />
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <a
                  key={action.label}
                  href={action.href}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl text-white text-xs font-medium text-center transition-all ${action.color} hover:shadow-md`}
                >
                  <Icon size={20} />
                  {action.label}
                </a>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold">Recent Bookings</CardTitle>
          <Link to="/admin/operations/bookings" preload="intent" className="text-sm text-orange-500 hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentBookings.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <CalendarDays className="mx-auto mb-2 opacity-40" size={32} />
              <p className="text-sm">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Booking #</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Type</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500 hidden md:table-cell">Route</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Amount</th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentBookings.map((b) => (
                    <tr key={b.booking_number} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-orange-600">{b.booking_number}</td>
                      <td className="px-4 py-3">{b.booking_type}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                        {b.pickup_location} → {b.drop_location}
                      </td>
                      <td className="px-4 py-3 font-medium">₹{(b.total_amount || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {b.status}
                        </span>
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
