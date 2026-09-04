import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Wrench,
  Loader2,
  Edit2,
  Trash2,
  Eye,
  DollarSign,
  FileText,
  ListPlus,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  Car,
  Tag,
  Star,
  Layers,
  Upload,
  HelpCircle,
  ShieldCheck,
  ArrowRight,
  FileQuestion,
  ListOrdered,
} from 'lucide-react';
import { serviceCategories, setDynamicServices, mapDbServiceToRecord } from '@/content/services';

export const Route = createFileRoute('/admin/products/services')({
  validateSearch: (search: Record<string, unknown>) => ({
    edit: typeof search.edit === 'string' ? search.edit : undefined,
  }),
  component: ServicesAdminPage,
});

export type PricingRowItem = {
  id: string;
  label: string;
  unit: string;
  price: string;
  note?: string;
};

export type ProcessStepItem = {
  id: string;
  title: string;
  description: string;
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type AdminService = {
  id: string;
  name: string;
  slug: string;
  category_slug: string;
  icon?: string;
  price_from?: string;
  show_pricing: boolean;
  featured: boolean;
  short_description?: string;
  full_description?: string;
  main_image?: string;
  image_alt?: string;
  active: boolean;
  display_order: number;
  features?: string[];
  benefits?: string[];
  pricing_rows?: PricingRowItem[];
  pricing_note?: string;
  process_steps?: ProcessStepItem[];
  terms?: string[];
  faqs?: FaqItem[];
  modules?: any[];
  created_at?: string;
};

const emptyForm: {
  name: string;
  slug: string;
  category_slug: string;
  icon: string;
  price_from: string;
  show_pricing: boolean;
  featured: boolean;
  short_description: string;
  full_description: string;
  main_image: string;
  image_alt: string;
  active: boolean;
  display_order: number;
  features: string[];
  benefits: string[];
  pricing_rows: PricingRowItem[];
  pricing_note: string;
  process_steps: ProcessStepItem[];
  terms: string[];
  faqs: FaqItem[];
  modules: any[];
} = {
  name: '',
  slug: '',
  category_slug: 'cabs',
  icon: '🚕',
  price_from: '₹14 / km',
  show_pricing: true,
  featured: false,
  short_description: '',
  full_description: '',
  main_image: '',
  image_alt: '',
  active: true,
  display_order: 1,
  features: [],
  benefits: [],
  pricing_rows: [],
  pricing_note: 'Quoted fares include fuel, driver allowance, and vehicle maintenance. Tolls and state taxes at actuals.',
  process_steps: [],
  terms: [],
  faqs: [],
  modules: [],
};

const PRESET_IMAGES = [
  { label: 'Local City Taxi', url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Outstation Highway', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Airport Terminal', url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Tempo & Group Tour', url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Temple & Pilgrimage', url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Wedding Bridal Car', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Resorts & Stays', url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Scenic Tour Planning', url: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80' },
];

const PRESET_ICONS = ['🚕', '🛣️', '✈️', '💼', '👥', '🛕', '💐', '🏨', '✨', '🎫', '🛟', 'Car', 'Route', 'Plane', 'Briefcase', 'Users', 'Landmark', 'HeartHandshake', 'BedDouble', 'Sparkles', 'Ticket', 'LifeBuoy'];

function ServicesAdminPage() {
  const searchParams = Route.useSearch();
  const [services, setServices] = useState<AdminService[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');

  // Input states for bullet points & rate rows
  const [newFeature, setNewFeature] = useState('');
  const [newBenefit, setNewBenefit] = useState('');
  const [newStepTitle, setNewStepTitle] = useState('');
  const [newStepDesc, setNewStepDesc] = useState('');
  const [newTerm, setNewTerm] = useState('');
  const [newFaqQ, setNewFaqQ] = useState('');
  const [newFaqA, setNewFaqA] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function fetchServices() {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('services').select('*').order('display_order');
      if (!error && data) {
        setServices(data);
        const mapped = data.map(mapDbServiceToRecord);
        setDynamicServices(mapped);
        return data;
      }
    } catch (e) {
      console.error('Error fetching services:', e);
    } finally {
      setLoading(false);
    }
    return [];
  }

  useEffect(() => {
    fetchServices().then((list) => {
      if (searchParams.edit && list && list.length > 0) {
        const found = list.find((s) => s.slug === searchParams.edit || s.id === searchParams.edit);
        if (found) openEditModal(found);
      }
    });
  }, [searchParams.edit]);

  const filtered = services.filter((s) => {
    const matchesCategory = categoryFilter === 'all' || s.category_slug === categoryFilter;
    const matchesSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.slug.toLowerCase().includes(search.toLowerCase()) ||
      (s.short_description && s.short_description.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const counts = {
    total: services.length,
    active: services.filter((s) => s.active).length,
    featured: services.filter((s) => s.featured).length,
  };

  function openEditModal(service?: AdminService) {
    if (service) {
      setEditId(service.id);
      let parsedRows: PricingRowItem[] = [];
      if (service.pricing_rows) {
        if (typeof service.pricing_rows === 'string') {
          try {
            parsedRows = JSON.parse(service.pricing_rows);
          } catch {}
        } else if (Array.isArray(service.pricing_rows)) {
          parsedRows = service.pricing_rows;
        }
      }

      let parsedSteps: ProcessStepItem[] = [];
      if (service.process_steps) {
        if (typeof service.process_steps === 'string') {
          try { parsedSteps = JSON.parse(service.process_steps); } catch {}
        } else if (Array.isArray(service.process_steps)) {
          parsedSteps = service.process_steps;
        }
      }

      let parsedTerms: string[] = [];
      if (service.terms) {
        if (Array.isArray(service.terms)) {
          parsedTerms = service.terms;
        } else if (typeof service.terms === 'string') {
          try { parsedTerms = JSON.parse(service.terms); } catch {}
        }
      }

      let parsedFaqs: FaqItem[] = [];
      if (service.faqs) {
        if (typeof service.faqs === 'string') {
          try { parsedFaqs = JSON.parse(service.faqs); } catch {}
        } else if (Array.isArray(service.faqs)) {
          parsedFaqs = service.faqs;
        }
      }

      setForm({
        name: service.name || '',
        slug: service.slug || '',
        category_slug: service.category_slug || 'cabs',
        icon: service.icon || '🚕',
        price_from: service.price_from || '₹14 / km',
        show_pricing: service.show_pricing !== false,
        featured: service.featured || false,
        short_description: service.short_description || '',
        full_description: service.full_description || '',
        main_image: service.main_image || '',
        image_alt: service.image_alt || '',
        active: service.active !== false,
        display_order: service.display_order || 1,
        features: Array.isArray(service.features) ? [...service.features] : [],
        benefits: Array.isArray(service.benefits) ? [...service.benefits] : [],
        pricing_rows: parsedRows,
        pricing_note: service.pricing_note || 'Quoted fares include fuel, driver allowance, and vehicle maintenance. Tolls and state taxes at actuals.',
        process_steps: parsedSteps,
        terms: parsedTerms,
        faqs: parsedFaqs,
        modules: Array.isArray(service.modules) ? service.modules : [],
      });
    } else {
      setEditId(null);
      setForm({
        ...emptyForm,
        display_order: services.length + 1,
      });
    }
    setActiveTab('general');
    setDialogOpen(true);
  }

  function addFeature() {
    if (!newFeature.trim()) return;
    setForm((f) => ({ ...f, features: [...f.features, newFeature.trim()] }));
    setNewFeature('');
  }

  function removeFeature(idx: number) {
    setForm((f) => ({ ...f, features: f.features.filter((_, i) => i !== idx) }));
  }

  function addBenefit() {
    if (!newBenefit.trim()) return;
    setForm((f) => ({ ...f, benefits: [...f.benefits, newBenefit.trim()] }));
    setNewBenefit('');
  }

  function removeBenefit(idx: number) {
    setForm((f) => ({ ...f, benefits: f.benefits.filter((_, i) => i !== idx) }));
  }

  function addStep() {
    if (!newStepTitle.trim()) return;
    const newStep: ProcessStepItem = {
      id: `step-${Date.now()}`,
      title: newStepTitle.trim(),
      description: newStepDesc.trim(),
    };
    setForm((f) => ({ ...f, process_steps: [...f.process_steps, newStep] }));
    setNewStepTitle('');
    setNewStepDesc('');
  }

  function removeStep(idx: number) {
    setForm((f) => ({ ...f, process_steps: f.process_steps.filter((_, i) => i !== idx) }));
  }

  function addTerm() {
    if (!newTerm.trim()) return;
    setForm((f) => ({ ...f, terms: [...f.terms, newTerm.trim()] }));
    setNewTerm('');
  }

  function removeTerm(idx: number) {
    setForm((f) => ({ ...f, terms: f.terms.filter((_, i) => i !== idx) }));
  }

  function addFaq() {
    if (!newFaqQ.trim() || !newFaqA.trim()) return;
    const newFaq: FaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQ.trim(),
      answer: newFaqA.trim(),
    };
    setForm((f) => ({ ...f, faqs: [...f.faqs, newFaq] }));
    setNewFaqQ('');
    setNewFaqA('');
  }

  function removeFaq(idx: number) {
    setForm((f) => ({ ...f, faqs: f.faqs.filter((_, i) => i !== idx) }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setForm((f) => ({ ...f, main_image: dataUrl }));
      toast.success('Image loaded successfully');
    };
    reader.readAsDataURL(file);
  }

  function addPricingRow() {
    const newRow: PricingRowItem = {
      id: `pr-${Date.now()}`,
      label: 'New Rate Option',
      unit: 'per km',
      price: '₹14',
      note: 'Extra km & hr at standard rate',
    };
    setForm((f) => ({ ...f, pricing_rows: [...f.pricing_rows, newRow] }));
  }

  function updatePricingRow(idx: number, field: keyof PricingRowItem, value: string) {
    setForm((f) => {
      const rows = [...f.pricing_rows];
      rows[idx] = { ...rows[idx], [field]: value };
      return { ...f, pricing_rows: rows };
    });
  }

  function removePricingRow(idx: number) {
    setForm((f) => ({ ...f, pricing_rows: f.pricing_rows.filter((_, i) => i !== idx) }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Service name is required');
      return;
    }
    setSaving(true);
    try {
      const slug = form.slug.trim() || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const payload = {
        name: form.name.trim(),
        slug,
        category_slug: form.category_slug || 'cabs',
        icon: form.icon.trim() || '🚕',
        price_from: form.price_from.trim() || '₹14 / km',
        show_pricing: form.show_pricing,
        featured: form.featured,
        short_description: form.short_description.trim(),
        full_description: form.full_description.trim(),
        main_image: form.main_image.trim(),
        image_alt: form.image_alt.trim() || form.name.trim(),
        active: form.active,
        display_order: +form.display_order || 1,
        features: form.features,
        benefits: form.benefits,
        pricing_rows: form.pricing_rows,
        pricing_note: form.pricing_note.trim(),
        process_steps: form.process_steps,
        terms: form.terms,
        faqs: form.faqs,
        modules: form.modules,
      };

      if (editId) {
        const { error } = await supabase.from('services').update(payload).eq('id', editId);
        if (error) throw error;
        toast.success('Service updated successfully');
      } else {
        const { error } = await supabase.from('services').insert(payload);
        if (error) throw error;
        toast.success('Service added successfully');
      }

      setDialogOpen(false);
      setForm(emptyForm);
      setEditId(null);
      await fetchServices();
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to save service');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Layers className="text-orange-500" size={24} />
            Services Management
          </h1>
          <p className="text-sm text-gray-500">
            Complete editor for travel services, rate cards, categories, features, and public pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => openEditModal()} className="bg-orange-500 hover:bg-orange-600 font-bold gap-2">
            <Plus size={16} /> Add Service
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-orange-100 text-orange-600">
              <Layers size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{counts.total}</div>
              <div className="text-xs text-gray-500">Total Services</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-green-100 text-green-600">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{counts.active}</div>
              <div className="text-xs text-gray-500">Active / Published</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-yellow-100 text-yellow-600">
              <Star size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{counts.featured}</div>
              <div className="text-xs text-gray-500">Featured on Site</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, slug, or description..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="cabs">Cabs & Transfers</SelectItem>
            <SelectItem value="tours">Tours & Packages</SelectItem>
            <SelectItem value="stays">Stays & Hotels</SelectItem>
            <SelectItem value="business">Business & Events</SelectItem>
            <SelectItem value="support">Travel Support</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="animate-spin text-orange-500" size={32} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Wrench className="mx-auto mb-2 opacity-30" size={36} />
              <p className="text-base font-medium">No services found matching your criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500 font-semibold">
                    <th className="text-left px-4 py-3">Order</th>
                    <th className="text-left px-4 py-3">Service</th>
                    <th className="text-left px-4 py-3">Category</th>
                    <th className="text-left px-4 py-3">Starting Price</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Features & Benefits</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 font-bold">#{s.display_order}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {s.main_image ? (
                            <img
                              src={s.main_image}
                              alt={s.name}
                              className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center text-lg shrink-0">
                              {s.icon || '🚕'}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-gray-900 flex items-center gap-1.5">
                              <span>{s.name}</span>
                              {s.featured && <Star size={13} className="text-amber-500 fill-amber-500" />}
                            </div>
                            <div className="text-xs text-gray-400 font-mono">/services/{s.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="capitalize px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                          {s.category_slug || 'cabs'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {s.price_from || '₹14 / km'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                        <div className="flex gap-2">
                          <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {s.features?.length || 0} features
                          </span>
                          <span className="bg-purple-50 text-purple-700 px-1.5 py-0.5 rounded">
                            {s.benefits?.length || 0} benefits
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                            s.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {s.active ? 'Active' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <a
                            href={`/services/${s.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-500"
                            title="Preview Public Page"
                          >
                            <ExternalLink size={14} />
                          </a>
                          <button
                            className="p-1.5 rounded hover:bg-orange-50 text-orange-600 font-medium"
                            onClick={() => openEditModal(s)}
                            title="Edit Service"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            onClick={() => setDeleteId(s.id)}
                            title="Delete Service"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Complete Edit / Add Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Edit2 size={18} className="text-orange-500" />
              {editId ? `Edit Service: ${form.name}` : 'Add New Service'}
            </DialogTitle>
            <DialogDescription>
              Modify service identity, rate cards, public pricing, descriptions, process steps, policies, and FAQs.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-7 w-full h-auto p-1 bg-gray-100 rounded-lg">
              <TabsTrigger value="general" className="text-xs py-1.5 font-medium">
                General
              </TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs py-1.5 font-medium">
                Pricing & Rates
              </TabsTrigger>
              <TabsTrigger value="content" className="text-xs py-1.5 font-medium">
                Content & Media
              </TabsTrigger>
              <TabsTrigger value="features" className="text-xs py-1.5 font-medium">
                Features & Perks
              </TabsTrigger>
              <TabsTrigger value="process" className="text-xs py-1.5 font-medium">
                How It Works
              </TabsTrigger>
              <TabsTrigger value="terms" className="text-xs py-1.5 font-medium">
                Terms & Policies
              </TabsTrigger>
              <TabsTrigger value="faqs" className="text-xs py-1.5 font-medium">
                FAQs
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: General Info */}
            <TabsContent value="general" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Service Name *</Label>
                  <Input
                    placeholder="e.g. Outstation Cabs"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">URL Slug *</Label>
                  <Input
                    placeholder="e.g. outstation-trips"
                    className="font-mono text-xs"
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Select
                    value={form.category_slug}
                    onValueChange={(v) => setForm((f) => ({ ...f, category_slug: v }))}
                  >
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cabs">Cabs & Transfers</SelectItem>
                      <SelectItem value="tours">Tours & Packages</SelectItem>
                      <SelectItem value="stays">Stays & Hotels</SelectItem>
                      <SelectItem value="business">Business & Events</SelectItem>
                      <SelectItem value="support">Travel Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Display Icon / Emoji</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. 🚕 or Car"
                      className="w-24 text-center text-base"
                      value={form.icon}
                      onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-1 items-center">
                      {PRESET_ICONS.slice(0, 8).map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          className="px-2 py-1 text-sm rounded hover:bg-gray-100 border border-gray-200"
                          onClick={() => setForm((f) => ({ ...f, icon: ic }))}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Display Order</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) => setForm((f) => ({ ...f, display_order: +e.target.value }))}
                  />
                </div>

                <div className="flex flex-col justify-end space-y-3 pt-2">
                  <div className="flex items-center justify-between border rounded-lg p-2.5 bg-gray-50">
                    <Label className="text-xs font-semibold cursor-pointer" htmlFor="active-toggle">
                      Active on Public Website
                    </Label>
                    <Switch
                      id="active-toggle"
                      checked={form.active}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                    />
                  </div>
                  <div className="flex items-center justify-between border rounded-lg p-2.5 bg-gray-50">
                    <Label className="text-xs font-semibold cursor-pointer" htmlFor="featured-toggle">
                      Mark as Featured Service
                    </Label>
                    <Switch
                      id="featured-toggle"
                      checked={form.featured}
                      onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: Pricing & Rates */}
            <TabsContent value="pricing" className="space-y-4 pt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 border rounded-lg bg-orange-50/40 border-orange-200">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-gray-800">Starting Price Display *</Label>
                  <Input
                    placeholder="e.g. ₹12 / km or ₹1,800 / 4 hrs"
                    className="font-bold text-gray-900 bg-white"
                    value={form.price_from}
                    onChange={(e) => setForm((f) => ({ ...f, price_from: e.target.value }))}
                  />
                  <p className="text-[11px] text-gray-500">
                    Shown prominently on service cards as "From [Price]"
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-white rounded border self-center">
                  <div>
                    <div className="text-xs font-semibold text-gray-900">Show Pricing Tag</div>
                    <div className="text-[11px] text-gray-500">Toggle off to show "Quoted on request"</div>
                  </div>
                  <Switch
                    checked={form.show_pricing}
                    onCheckedChange={(v) => setForm((f) => ({ ...f, show_pricing: v }))}
                  />
                </div>

                <div className="col-span-1 sm:col-span-2 space-y-1.5 pt-1">
                  <Label className="text-xs font-semibold text-gray-800">Pricing Footnote & Terms Note</Label>
                  <Textarea
                    rows={2}
                    placeholder="e.g. Quoted fares include fuel, driver allowance, and vehicle maintenance. Tolls and state taxes at actuals."
                    className="text-xs bg-white"
                    value={form.pricing_note}
                    onChange={(e) => setForm((f) => ({ ...f, pricing_note: e.target.value }))}
                  />
                  <p className="text-[11px] text-gray-500">
                    Displayed below the rate card on the public service detail page.
                  </p>
                </div>
              </div>

              {/* Rate Card Rows Editor */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      <DollarSign size={15} className="text-orange-500" />
                      Detailed Rate Card Breakdown
                    </h3>
                    <p className="text-xs text-gray-500">
                      Vehicle-specific tariffs, package rates, and extra kilometre / hour rules
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={addPricingRow}
                    className="gap-1.5 text-xs text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <Plus size={14} /> Add Rate Row
                  </Button>
                </div>

                {form.pricing_rows.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50 text-xs text-gray-500">
                    No custom rate rows yet. Click "+ Add Rate Row" to create transparent vehicle price tiers.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {form.pricing_rows.map((row, idx) => (
                      <div
                        key={row.id || idx}
                        className="grid grid-cols-12 gap-2 p-2 rounded-lg border bg-white items-center text-xs"
                      >
                        <div className="col-span-4">
                          <Label className="text-[10px] text-gray-400">Option / Vehicle</Label>
                          <Input
                            placeholder="e.g. Sedan (Swift Dzire)"
                            value={row.label}
                            className="h-8 text-xs"
                            onChange={(e) => updatePricingRow(idx, 'label', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[10px] text-gray-400">Unit</Label>
                          <Input
                            placeholder="per km, package"
                            value={row.unit}
                            className="h-8 text-xs"
                            onChange={(e) => updatePricingRow(idx, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-[10px] text-gray-400">Price</Label>
                          <Input
                            placeholder="₹14"
                            value={row.price}
                            className="h-8 text-xs font-bold text-emerald-700"
                            onChange={(e) => updatePricingRow(idx, 'price', e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Label className="text-[10px] text-gray-400">Notes / Rules</Label>
                          <Input
                            placeholder="Extra km ₹14"
                            value={row.note || ''}
                            className="h-8 text-xs"
                            onChange={(e) => updatePricingRow(idx, 'note', e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 flex justify-center pt-3">
                          <button
                            type="button"
                            className="text-red-500 hover:text-red-700 p-1 rounded"
                            onClick={() => removePricingRow(idx)}
                            title="Remove Row"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 3: Content & Media */}
            <TabsContent value="content" className="space-y-4 pt-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Short Summary (Shown on Cards) *</Label>
                <Input
                  placeholder="e.g. Hourly and full-day city cabs with waiting time, fuel and driver charges included..."
                  value={form.short_description}
                  onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Full Detailed Description</Label>
                <Textarea
                  rows={4}
                  placeholder="Detailed multi-paragraph description outlining coverage, routes, vehicles, and booking terms..."
                  value={form.full_description}
                  onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Service Image</Label>
                  <div className="flex gap-2 items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-1.5 text-xs font-semibold text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <Upload size={14} /> Upload Image File...
                    </Button>
                    <span className="text-xs text-gray-400">or enter image URL:</span>
                  </div>
                  <Input
                    placeholder="https://images.unsplash.com/..."
                    value={form.main_image}
                    onChange={(e) => setForm((f) => ({ ...f, main_image: e.target.value }))}
                    className="mt-1"
                  />
                  <div className="text-[11px] text-gray-500">Or pick from curated presets:</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {PRESET_IMAGES.map((img) => (
                      <button
                        key={img.label}
                        type="button"
                        className="text-[10px] px-2 py-0.5 rounded bg-gray-100 hover:bg-orange-100 hover:text-orange-700 border"
                        onClick={() => setForm((f) => ({ ...f, main_image: img.url }))}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Image Preview</Label>
                  {form.main_image ? (
                    <div className="relative h-28 rounded-lg overflow-hidden border">
                      <img src={form.main_image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="h-28 rounded-lg border border-dashed flex items-center justify-center text-xs text-gray-400 bg-gray-50">
                      No image selected
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 4: Features & Benefits */}
            <TabsContent value="features" className="space-y-4 pt-3">
              {/* Features Editor */}
              <div className="space-y-2 p-3 border rounded-lg bg-gray-50/50">
                <Label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-blue-500" />
                  Key Features (What's Included)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 4h / 8h / 12h packages, Hatchback to SUV..."
                    value={newFeature}
                    className="text-xs"
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addFeature();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addFeature} className="bg-blue-600 hover:bg-blue-700 text-xs">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-blue-100 text-blue-800 font-medium"
                    >
                      {feat}
                      <button
                        type="button"
                        onClick={() => removeFeature(idx)}
                        className="text-blue-600 hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {form.features.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No features added yet.</span>
                  )}
                </div>
              </div>

              {/* Benefits Editor */}
              <div className="space-y-2 p-3 border rounded-lg bg-gray-50/50">
                <Label className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-500" />
                  Customer Benefits (Advantages)
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Zero surge pricing, Verified chauffeurs, GST Invoices..."
                    value={newBenefit}
                    className="text-xs"
                    onChange={(e) => setNewBenefit(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addBenefit();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addBenefit} className="bg-purple-600 hover:bg-purple-700 text-xs">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.benefits.map((ben, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-purple-100 text-purple-800 font-medium"
                    >
                      {ben}
                      <button
                        type="button"
                        onClick={() => removeBenefit(idx)}
                        className="text-purple-600 hover:text-red-600 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {form.benefits.length === 0 && (
                    <span className="text-xs text-gray-400 italic">No benefits added yet.</span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 5: How It Works / Process Steps */}
            <TabsContent value="process" className="space-y-4 pt-3">
              <div className="p-3 border rounded-lg bg-orange-50/40 border-orange-200 space-y-2">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <ListOrdered size={14} className="text-orange-500" />
                  Add a New Process Step ("How it works")
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Input
                    placeholder="Step Title (e.g. Share your plan)"
                    value={newStepTitle}
                    className="text-xs bg-white"
                    onChange={(e) => setNewStepTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Step Description (e.g. Send dates, pickup point, passengers...)"
                    value={newStepDesc}
                    className="text-xs bg-white"
                    onChange={(e) => setNewStepDesc(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addStep}
                  className="bg-orange-500 hover:bg-orange-600 text-xs font-bold gap-1.5 mt-1"
                >
                  <Plus size={14} /> Add Step
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700">Current Steps ({form.process_steps.length}):</div>
                {form.process_steps.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50 text-xs text-gray-400">
                    No custom process steps added yet. Standard 4-step workflow applies.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {form.process_steps.map((step, idx) => (
                      <div key={step.id || idx} className="flex items-start gap-3 p-3 border rounded-lg bg-white shadow-xs">
                        <span className="grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-xs text-gray-900">{step.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStep(idx)}
                          className="text-red-400 hover:text-red-600 p-1 rounded"
                          title="Remove Step"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 6: Terms & Policies */}
            <TabsContent value="terms" className="space-y-4 pt-3">
              <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <Label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  Add a Term / Policy / Cancellation Rule
                </Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Free cancellation up to 2 hours before scheduled pickup..."
                    value={newTerm}
                    className="text-xs bg-white"
                    onChange={(e) => setNewTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTerm();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={addTerm} className="bg-emerald-600 hover:bg-emerald-700 text-xs font-bold">
                    Add
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-bold text-gray-700">Published Terms & Policies ({form.terms.length}):</div>
                {form.terms.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50 text-xs text-gray-400">
                    No custom terms added yet. Standard commercial terms apply.
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {form.terms.map((term, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg border bg-white text-xs gap-3">
                        <span className="flex items-start gap-2 text-gray-800">
                          <span className="text-emerald-500 font-bold">•</span>
                          {term}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTerm(idx)}
                          className="text-red-400 hover:text-red-600 p-1 rounded shrink-0"
                          title="Remove Term"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* TAB 7: FAQs */}
            <TabsContent value="faqs" className="space-y-4 pt-3">
              <div className="p-3 border rounded-lg bg-blue-50/40 border-blue-200 space-y-2">
                <h4 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <FileQuestion size={14} className="text-blue-600" />
                  Add a Question & Answer for this Service
                </h4>
                <div className="space-y-2">
                  <Input
                    placeholder="Question (e.g. Can we make multiple stops along the route?)"
                    value={newFaqQ}
                    className="text-xs bg-white"
                    onChange={(e) => setNewFaqQ(e.target.value)}
                  />
                  <Textarea
                    rows={2}
                    placeholder="Answer (e.g. Yes, custom stops are accommodated with extra mileage billed at the per-km rate.)"
                    value={newFaqA}
                    className="text-xs bg-white"
                    onChange={(e) => setNewFaqA(e.target.value)}
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={addFaq}
                  className="bg-blue-600 hover:bg-blue-700 text-xs font-bold gap-1.5"
                >
                  <Plus size={14} /> Add FAQ
                </Button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-gray-700">Service FAQs ({form.faqs.length}):</div>
                {form.faqs.length === 0 ? (
                  <div className="text-center py-6 border border-dashed rounded-lg bg-gray-50 text-xs text-gray-400">
                    No custom FAQs added yet. Standard shared FAQs will be displayed.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {form.faqs.map((faq, idx) => (
                      <div key={faq.id || idx} className="p-3 border rounded-lg bg-white shadow-xs space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                            <span className="text-blue-600 font-extrabold">Q:</span>
                            {faq.question}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFaq(idx)}
                            className="text-red-400 hover:text-red-600 p-1 rounded shrink-0"
                            title="Remove FAQ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="text-xs text-gray-600 pl-4 border-l-2 border-blue-200 mt-1">
                          {faq.answer}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 font-bold"
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

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Service?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this service and remove it from the public travel catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await supabase.from('services').delete().eq('id', deleteId!);
                toast.success('Service deleted');
                setDeleteId(null);
                fetchServices();
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
