import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from '@tanstack/react-router';
import { useState } from 'react';
import {
  LayoutDashboard, CalendarDays, MessageSquare, Users, Car, UserCheck,
  MapPin, CreditCard, FileText, Package, Hotel, Globe, Wrench, Settings,
  Image, Star, HelpCircle, Navigation, AlignLeft, BarChart3, TrendingUp,
  ChevronDown, ChevronRight, Menu, X, LogOut, Bell, User, Shield, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const Route = createFileRoute('/admin')({
  component: AdminLayout,
});

type NavItem = { label: string; path: string; icon: React.ElementType; badge?: string };
type NavGroup = { label: string; icon: React.ElementType; items: NavItem[] };

const navGroups: NavGroup[] = [
  {
    label: 'OPERATIONS',
    icon: Activity,
    items: [
      { label: 'Bookings', path: '/admin/operations/bookings', icon: CalendarDays },
      { label: 'Enquiries', path: '/admin/operations/enquiries', icon: MessageSquare },
      { label: 'Customers', path: '/admin/operations/customers', icon: Users },
      { label: 'Drivers', path: '/admin/operations/drivers', icon: UserCheck },
      { label: 'Routes', path: '/admin/operations/routes', icon: MapPin },
      { label: 'Payments', path: '/admin/operations/payments', icon: CreditCard },
    ],
  },
  {
    label: 'PRODUCTS',
    icon: Package,
    items: [
      { label: 'Tour Packages', path: '/admin/products/packages', icon: Package },
      { label: 'Destinations', path: '/admin/products/destinations', icon: Globe },
      { label: 'Hotels', path: '/admin/products/hotels', icon: Hotel },
      { label: 'Fleet', path: '/admin/products/fleet', icon: Car },
      { label: 'Services', path: '/admin/products/services', icon: Wrench },
    ],
  },
  {
    label: 'CONTENT',
    icon: FileText,
    items: [
      { label: 'Home Page', path: '/admin/content/homepage', icon: LayoutDashboard },
      { label: 'Hero Slides', path: '/admin/content/hero', icon: Image },
      { label: 'Gallery', path: '/admin/content/gallery', icon: Image },
      { label: 'Testimonials', path: '/admin/content/testimonials', icon: Star },
      { label: 'FAQs', path: '/admin/content/faqs', icon: HelpCircle },
      { label: 'Navigation', path: '/admin/content/navigation', icon: Navigation },
      { label: 'Footer', path: '/admin/content/footer', icon: AlignLeft },
    ],
  },
  {
    label: 'REPORTS',
    icon: BarChart3,
    items: [
      { label: 'Booking Reports', path: '/admin/reports/bookings', icon: BarChart3 },
      { label: 'Revenue Reports', path: '/admin/reports/revenue', icon: TrendingUp },
    ],
  },
  {
    label: 'SETTINGS',
    icon: Settings,
    items: [
      { label: 'General', path: '/admin/settings/general', icon: Settings },
      { label: 'Contact Info', path: '/admin/settings/contact', icon: MessageSquare },
      { label: 'Payment & QR', path: '/admin/settings/payment', icon: CreditCard },
      { label: 'Booking Rules', path: '/admin/settings/booking', icon: FileText },
    ],
  },
  {
    label: 'ADMINISTRATION',
    icon: Shield,
    items: [
      { label: 'Admin Users', path: '/admin/administration/users', icon: Users },
      { label: 'Activity Logs', path: '/admin/administration/logs', icon: Activity },
    ],
  },
];

function NavLink({ item, onClick }: { item: NavItem; onClick?: () => void }) {
  const router = useRouterState();
  const currentPath = router.location.pathname;
  const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
  const Icon = item.icon;

  return (
    <Link
      to={item.path as any}
      preload="intent"
      onClick={onClick}
      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
        isActive
          ? 'bg-orange-500/15 text-orange-600 font-semibold border-l-2 border-orange-500'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon size={15} className={isActive ? 'text-orange-500' : ''} />
      <span>{item.label}</span>
      {item.badge && (
        <Badge className="ml-auto bg-orange-100 text-orange-700 text-xs px-1.5 py-0">{item.badge}</Badge>
      )}
    </Link>
  );
}

function NavGroupSection({ group, defaultOpen = true, onNavClick }: { group: NavGroup; defaultOpen?: boolean; onNavClick?: () => void }) {
  const [open, setOpen] = useState(defaultOpen);
  const GroupIcon = group.icon;

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors"
      >
        <span>{group.label}</span>
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>
      {open && (
        <div className="space-y-0.5 mt-0.5">
          {group.items.map((item) => (
            <NavLink key={item.path} item={item} onClick={onNavClick} />
          ))}
        </div>
      )}
    </div>
  );
}

function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouterState();
  const currentPath = router.location.pathname;

  // Auth check
  if (typeof window !== 'undefined') {
    const auth = localStorage.getItem('admin_auth');
    if (!auth && !currentPath.includes('/admin/login')) {
      navigate({ to: '/admin/login' });
      return null;
    }
  }

  if (currentPath === '/admin/login') {
    return <Outlet />;
  }

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    navigate({ to: '/admin/login' });
  };

  const Sidebar = ({ onNavClick }: { onNavClick?: () => void }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-lg flex items-center justify-center shadow-sm">
            <Car size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-none">South Zoom</div>
            <div className="text-xs text-orange-500 font-medium">Admin Control</div>
          </div>
        </div>
      </div>

      {/* Dashboard link */}
      <div className="px-3 pt-4 pb-2">
        <a
          href="/admin"
          onClick={onNavClick}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all ${
            currentPath === '/admin'
              ? 'bg-orange-500 text-white font-semibold shadow-sm'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <LayoutDashboard size={15} />
          <span>Dashboard</span>
        </a>
      </div>

      {/* Nav Groups */}
      <nav className="flex-1 px-3 overflow-y-auto pb-4 space-y-2">
        {navGroups.map((group) => (
          <NavGroupSection key={group.label} group={group} onNavClick={onNavClick} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          <LogOut size={15} />
          <span>Logout</span>
        </button>
        <div className="mt-3 text-center text-xs text-gray-400">South Zoom Tourism · v1.0</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed inset-y-0 left-0 z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <span className="font-bold text-orange-600">South Zoom Admin</span>
              <button onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Sidebar onNavClick={() => setSidebarOpen(false)} />
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-gray-100"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:block">
              <nav className="flex items-center gap-1 text-sm text-gray-500">
                <span>Admin</span>
                <ChevronRight size={14} />
                <span className="text-gray-900 font-medium capitalize">
                  {currentPath.split('/').filter(Boolean).slice(1).join(' › ') || 'Dashboard'}
                </span>
              </nav>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded-lg hover:bg-gray-100 relative">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 pl-2 border-l">
              <div className="w-7 h-7 bg-orange-100 rounded-full flex items-center justify-center">
                <User size={14} className="text-orange-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">Super Admin</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
