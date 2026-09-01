import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Car,
  Edit2,
  Trash2,
  Upload,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
  FileText,
  ExternalLink,
  ShieldCheck,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  ShieldAlert,
} from 'lucide-react';
import {
  getFleetVehicles,
  addFleetVehicle,
  updateFleetVehicle,
  deleteFleetVehicle,
  resetFleetVehicles,
  vehicleCategories,
  tripTypeOptions,
  type FleetVehicle,
  type TripType,
} from '@/content/fleet';
import {
  getVehicleDetail,
  saveVehicleDetail,
  resetVehicleDetail,
  createDefaultVehicleDetail,
  priceGroupLabels,
  type VehicleDetail,
  type VehicleFeature,
  type VehiclePriceLine,
  type VehicleSpec,
  type DateBlock,
  type VehicleGalleryImage,
  type PriceGroup,
  type GalleryKind,
} from '@/content/vehicle-details';

import fleetWagonr from "@/assets/fleet-wagonr-ka.jpg";
import fleetDzire from "@/assets/fleet-dzire-new.png";
import fleetErtiga from "@/assets/fleet-ertiga-new.png";
import fleetInnova from "@/assets/fleet-innova-new.png";
import fleetTempo from "@/assets/fleet-tempo-new.png";
import fleetUrbania from "@/assets/fleet-urbania-ka.jpg";
import fleetBus from "@/assets/fleet-bus-ka.jpg";
import fleetBmw from "@/assets/fleet-bmw-new.png";

export const Route = createFileRoute('/admin/products/fleet')({
  component: FleetProductPage,
});

const FEATURE_ICONS = [
  { label: 'Air conditioning', value: 'Wind' },
  { label: 'GPS / Safety', value: 'ShieldCheck' },
  { label: 'Chauffeur / Driver', value: 'UserCheck' },
  { label: 'Mobile Charging', value: 'Zap' },
  { label: 'First Aid Kit', value: 'HeartPulse' },
  { label: 'Luggage Hold', value: 'Briefcase' },
  { label: 'Wi-Fi / Internet', value: 'Wifi' },
  { label: 'Audio / Music', value: 'Music' },
  { label: 'Premium Feature', value: 'Sparkles' },
  { label: 'Standard Check', value: 'Check' },
];

const FEATURE_PRESETS = [
  { label: 'Chauffeur driven', icon: 'UserCheck' },
  { label: 'GPS live tracking', icon: 'ShieldCheck' },
  { label: 'Mobile charging USB ports', icon: 'Zap' },
  { label: 'First aid kit equipped', icon: 'HeartPulse' },
  { label: 'Dual-zone air conditioning', icon: 'Wind' },
  { label: 'Pushback reclining seats', icon: 'Sparkles' },
  { label: 'Bluetooth audio system', icon: 'Music' },
  { label: 'Complimentary bottled water', icon: 'Check' },
  { label: 'Spacious boot / luggage space', icon: 'Briefcase' },
  { label: 'Sanitised interior before pickup', icon: 'ShieldCheck' },
];

// Built-in asset images that admins can pick from
const BUILTIN_IMAGES: { label: string; url: string }[] = [
  { label: 'Hatchback (WagonR)', url: fleetWagonr },
  { label: 'Sedan (Dzire)', url: fleetDzire },
  { label: 'Small SUV (Ertiga)', url: fleetErtiga },
  { label: 'Big SUV (Innova)', url: fleetInnova },
  { label: 'Tempo Traveller', url: fleetTempo },
  { label: 'Urbania Luxury Van', url: fleetUrbania },
  { label: 'Tourist Bus', url: fleetBus },
  { label: 'BMW Premium', url: fleetBmw },
];

const emptyForm: Omit<FleetVehicle, 'id' | 'slug'> = {
  name: '',
  brand: '',
  model: '',
  categorySlug: 'sedan',
  seats: 4,
  luggage: 3,
  ac: true,
  fuel: 'Petrol',
  pricePerKm: 14,
  priceFromLabel: '₹14 / km',
  available: true,
  availabilityText: 'Available today',
  allowEnquiryWhenUnavailable: true,
  tripTypes: ['local', 'outstation', 'airport'],
  features: [],
  image: fleetDzire,
  imageAlt: '',
  order: 99,
  published: true,
  featured: false,
  popular: 70,
};

function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function FleetProductPage() {
  const [fleetList, setFleetList] = useState<FleetVehicle[]>([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [form, setForm] = useState<Omit<FleetVehicle, 'id' | 'slug'>>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [imageTab, setImageTab] = useState<'builtin' | 'url' | 'upload'>('builtin');
  const [uploadedImageDataUrl, setUploadedImageDataUrl] = useState<string>('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Detail page editor state
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedVehicleForDetail, setSelectedVehicleForDetail] = useState<FleetVehicle | null>(null);
  const [detailForm, setDetailForm] = useState<VehicleDetail | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'pricing' | 'policies' | 'gallery'>('overview');
  const [priceGroupTab, setPriceGroupTab] = useState<PriceGroup>('local');
  const [resetDetailConfirm, setResetDetailConfirm] = useState(false);

  // New spec form
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // New feature form
  const [newFeatureLabel, setNewFeatureLabel] = useState('');
  const [newFeatureIcon, setNewFeatureIcon] = useState('Check');

  // New price line form
  const [newPriceLine, setNewPriceLine] = useState<{
    label: string;
    value: string;
    note: string;
    enquiryLabel: string;
    visible: boolean;
  }>({
    label: '',
    value: '',
    note: '',
    enquiryLabel: 'Contact for price',
    visible: true,
  });

  // New policy form
  const [newPolicyText, setNewPolicyText] = useState('');

  // New date block form
  const [newDateBlock, setNewDateBlock] = useState<{ from: string; to: string; reason: string }>({
    from: '',
    to: '',
    reason: '',
  });

  // New gallery image form
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryAlt, setNewGalleryAlt] = useState('');
  const [newGalleryKind, setNewGalleryKind] = useState<GalleryKind>('interior');
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  function loadFleet() {
    setFleetList(getFleetVehicles());
  }

  useEffect(() => {
    loadFleet();
    const handler = () => loadFleet();
    window.addEventListener('fleetDataUpdated', handler);
    return () => window.removeEventListener('fleetDataUpdated', handler);
  }, []);

  const filtered = fleetList.filter(
    (v) =>
      !search ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.categorySlug?.toLowerCase().includes(search.toLowerCase()) ||
      v.brand?.toLowerCase().includes(search.toLowerCase()),
  );

  function openAdd() {
    setForm({ ...emptyForm, image: fleetDzire });
    setEditId(null);
    setFeaturesInput('');
    setUploadedImageDataUrl('');
    setImageTab('builtin');
    setPreviewImage(fleetDzire);
    setDialogOpen(true);
  }

  function openEdit(v: FleetVehicle) {
    setEditId(v.id);
    setForm({
      name: v.name,
      brand: v.brand,
      model: v.model,
      categorySlug: v.categorySlug,
      seats: v.seats,
      luggage: v.luggage,
      ac: v.ac,
      fuel: v.fuel || 'Petrol',
      pricePerKm: v.pricePerKm,
      priceFromLabel: v.priceFromLabel,
      available: v.available,
      availabilityText: v.availabilityText,
      allowEnquiryWhenUnavailable: v.allowEnquiryWhenUnavailable,
      tripTypes: v.tripTypes,
      features: v.features,
      image: v.image,
      imageAlt: v.imageAlt,
      order: v.order,
      published: v.published,
      featured: v.featured,
      popular: v.popular,
    });
    setFeaturesInput(v.features.join('\n'));
    setUploadedImageDataUrl('');
    const isBuiltin = BUILTIN_IMAGES.some((b) => b.url === v.image);
    setImageTab(isBuiltin ? 'builtin' : v.image?.startsWith('data:') ? 'upload' : 'url');
    setPreviewImage(typeof v.image === 'string' ? v.image : '');
    setDialogOpen(true);
  }

  function openDetailEditor(v: FleetVehicle) {
    setSelectedVehicleForDetail(v);
    let detail = getVehicleDetail(v.slug);
    if (!detail) {
      detail = createDefaultVehicleDetail(v);
    }
    // Deep clone to allow safe editing
    setDetailForm(JSON.parse(JSON.stringify(detail)));
    setDetailTab('overview');
    setPriceGroupTab('local');
    setDetailDialogOpen(true);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setUploadedImageDataUrl(dataUrl);
      setForm((f) => ({ ...f, image: dataUrl }));
      setPreviewImage(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      toast.error('Image must be under 3 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setNewGalleryUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function handleTripTypeToggle(type: TripType) {
    setForm((f) => {
      const has = f.tripTypes.includes(type);
      return {
        ...f,
        tripTypes: has ? f.tripTypes.filter((t) => t !== type) : [...f.tripTypes, type],
      };
    });
  }

  function handleSave() {
    if (!form.name.trim()) {
      toast.error('Vehicle name is required');
      return;
    }
    if (!form.image) {
      toast.error('Please select or upload a vehicle image');
      return;
    }

    const priceLabel = `₹${form.pricePerKm} / km`;
    const features = featuresInput
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editId) {
      updateFleetVehicle(editId, {
        ...form,
        priceFromLabel: priceLabel,
        features,
      });
      toast.success('Vehicle updated successfully');
    } else {
      const id = `fv-${Date.now()}`;
      const slug = slugify(form.name) || id;
      addFleetVehicle({
        ...form,
        id,
        slug,
        priceFromLabel: priceLabel,
        features,
        imageAlt: form.imageAlt || `${form.name} cab`,
      });
      toast.success('Vehicle added successfully');
    }
    setDialogOpen(false);
    loadFleet();
  }

  function handleDelete(id: string) {
    deleteFleetVehicle(id);
    toast.success('Vehicle deleted');
    setDeleteId(null);
    loadFleet();
  }

  function handleTogglePublish(v: FleetVehicle) {
    updateFleetVehicle(v.id, { published: !v.published });
    loadFleet();
    toast.success(v.published ? 'Vehicle hidden from public' : 'Vehicle published');
  }

  function handleToggleFeatured(v: FleetVehicle) {
    updateFleetVehicle(v.id, { featured: !v.featured });
    loadFleet();
    toast.success(v.featured ? 'Removed from featured' : 'Marked as featured');
  }

  function handleReset() {
    resetFleetVehicles();
    loadFleet();
    setResetConfirm(false);
    toast.success('Fleet reset to defaults');
  }

  // --- Detail Form Action Handlers ---
  function handleSaveDetail() {
    if (!selectedVehicleForDetail || !detailForm) return;
    saveVehicleDetail(selectedVehicleForDetail.slug, detailForm);
    toast.success(`Page details for "${selectedVehicleForDetail.name}" saved!`);
    setDetailDialogOpen(false);
  }

  function handleResetDetail() {
    if (!selectedVehicleForDetail) return;
    resetVehicleDetail(selectedVehicleForDetail.slug);
    const fresh = getVehicleDetail(selectedVehicleForDetail.slug) || createDefaultVehicleDetail(selectedVehicleForDetail);
    setDetailForm(JSON.parse(JSON.stringify(fresh)));
    setResetDetailConfirm(false);
    toast.success(`Reset page details for "${selectedVehicleForDetail.name}" to default.`);
  }

  function handleAddSpec() {
    if (!newSpecLabel.trim() || !newSpecValue.trim()) {
      toast.error('Enter both spec name and value');
      return;
    }
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        specs: [...prev.specs, { label: newSpecLabel.trim(), value: newSpecValue.trim() }],
      };
    });
    setNewSpecLabel('');
    setNewSpecValue('');
  }

  function handleRemoveSpec(index: number) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      const specs = [...prev.specs];
      specs.splice(index, 1);
      return { ...prev, specs };
    });
  }

  function handleAddFeature() {
    if (!newFeatureLabel.trim()) {
      toast.error('Enter feature name');
      return;
    }
    setDetailForm((prev) => {
      if (!prev) return prev;
      const newFeat: VehicleFeature = {
        id: `${prev.vehicleSlug}-feat-${Date.now()}`,
        label: newFeatureLabel.trim(),
        icon: newFeatureIcon,
        order: prev.features.length + 1,
        visible: true,
      };
      return {
        ...prev,
        features: [...prev.features, newFeat],
      };
    });
    setNewFeatureLabel('');
  }

  function handleAddPresetFeature(preset: { label: string; icon: string }) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      if (prev.features.some((f) => f.label.toLowerCase() === preset.label.toLowerCase())) {
        toast.info('Feature already added');
        return prev;
      }
      const newFeat: VehicleFeature = {
        id: `${prev.vehicleSlug}-feat-${Date.now()}`,
        label: preset.label,
        icon: preset.icon,
        order: prev.features.length + 1,
        visible: true,
      };
      return {
        ...prev,
        features: [...prev.features, newFeat],
      };
    });
  }

  function handleToggleFeatureVisible(id: string) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        features: prev.features.map((f) => (f.id === id ? { ...f, visible: !f.visible } : f)),
      };
    });
  }

  function handleRemoveFeature(id: string) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        features: prev.features.filter((f) => f.id !== id),
      };
    });
  }

  function handleAddPriceLine() {
    if (!newPriceLine.label.trim()) {
      toast.error('Enter pricing line label');
      return;
    }
    setDetailForm((prev) => {
      if (!prev) return prev;
      const newLine: VehiclePriceLine = {
        id: `${prev.vehicleSlug}-${priceGroupTab}-${Date.now()}`,
        group: priceGroupTab,
        label: newPriceLine.label.trim(),
        value: newPriceLine.value.trim(),
        note: newPriceLine.note.trim() || undefined,
        enquiryLabel: newPriceLine.enquiryLabel.trim() || 'Contact for price',
        visible: newPriceLine.visible,
      };
      return {
        ...prev,
        pricing: [...prev.pricing, newLine],
      };
    });
    setNewPriceLine({
      label: '',
      value: '',
      note: '',
      enquiryLabel: 'Contact for price',
      visible: true,
    });
  }

  function handleRemovePriceLine(id: string) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pricing: prev.pricing.filter((p) => p.id !== id),
      };
    });
  }

  function handleUpdatePriceLine(id: string, updates: Partial<VehiclePriceLine>) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        pricing: prev.pricing.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      };
    });
  }

  function handleAddPolicy() {
    if (!newPolicyText.trim()) return;
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        policies: [...prev.policies, newPolicyText.trim()],
      };
    });
    setNewPolicyText('');
  }

  function handleRemovePolicy(index: number) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      const policies = [...prev.policies];
      policies.splice(index, 1);
      return { ...prev, policies };
    });
  }

  function handleAddDateBlock() {
    if (!newDateBlock.from || !newDateBlock.to) {
      toast.error('Select both From and To dates');
      return;
    }
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        dateBlocks: [
          ...prev.dateBlocks,
          {
            from: newDateBlock.from,
            to: newDateBlock.to,
            reason: newDateBlock.reason.trim() || 'Reserved / Maintenance',
          },
        ],
      };
    });
    setNewDateBlock({ from: '', to: '', reason: '' });
  }

  function handleRemoveDateBlock(index: number) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      const dateBlocks = [...prev.dateBlocks];
      dateBlocks.splice(index, 1);
      return { ...prev, dateBlocks };
    });
  }

  function handleAddGalleryImage() {
    if (!newGalleryUrl.trim()) {
      toast.error('Enter image URL or choose image file');
      return;
    }
    setDetailForm((prev) => {
      if (!prev) return prev;
      const newImg: VehicleGalleryImage = {
        id: `${prev.vehicleSlug}-img-${Date.now()}`,
        url: newGalleryUrl.trim(),
        alt: newGalleryAlt.trim() || `${prev.vehicleSlug} photo`,
        kind: newGalleryKind,
        order: prev.gallery.length + 1,
      };
      return {
        ...prev,
        gallery: [...prev.gallery, newImg],
      };
    });
    setNewGalleryUrl('');
    setNewGalleryAlt('');
  }

  function handleRemoveGalleryImage(id: string) {
    setDetailForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        gallery: prev.gallery.filter((img) => img.id !== id),
      };
    });
  }

  return (
    <div className="space-y-5 max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Fleet Management</h1>
          <p className="text-sm text-gray-500">
            Add, edit, and fully customize vehicle cards and separate detail pages (/fleet/:slug).
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setResetConfirm(true)}
            className="gap-2 text-xs"
          >
            <RefreshCw size={13} /> Reset to Default
          </Button>
          <Button onClick={openAdd} className="bg-orange-500 hover:bg-orange-600 gap-2">
            <Plus size={16} /> Add Vehicle
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by name, brand, or category..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Fleet Table */}
      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Car className="mx-auto mb-2 opacity-30" size={32} />
              <p>{search ? 'No vehicles match your search' : 'No vehicles yet — click "Add Vehicle" to start'}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Vehicle</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 py-3 hidden md:table-cell">Capacity</th>
                    <th className="text-left px-4 py-3">Rate</th>
                    <th className="text-left px-4 py-3 hidden sm:table-cell">Status</th>
                    <th className="text-right px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      {/* Vehicle name + image thumbnail */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-14 rounded overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                            {v.image ? (
                              <img
                                src={typeof v.image === 'string' ? v.image : undefined}
                                alt={v.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <Car size={16} className="text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-semibold text-gray-900 leading-tight">{v.name}</p>
                              <a
                                href={`/fleet/${v.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                title="View public detail page"
                                className="text-gray-400 hover:text-primary transition-colors inline-flex items-center"
                              >
                                <ExternalLink size={12} />
                              </a>
                            </div>
                            <p className="text-xs text-gray-400">{v.brand} {v.model} · <span className="font-mono text-[11px] text-gray-400">/fleet/{v.slug}</span></p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs hidden sm:table-cell">
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded capitalize">
                          {vehicleCategories.find((c) => c.slug === v.categorySlug)?.label ?? v.categorySlug}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">
                        {v.seats} Seats · {v.luggage} Bags · {v.ac ? 'AC' : 'Non-AC'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-700">₹{v.pricePerKm}/km</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-col gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${
                              v.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {v.published ? 'Published' : 'Hidden'}
                          </span>
                          {v.featured && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium w-fit bg-amber-100 text-amber-700">
                              Featured
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Edit Public Page Details Button */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openDetailEditor(v)}
                            className="h-8 px-2.5 text-xs font-semibold border-primary/50 text-primary hover:bg-primary/10 gap-1"
                            title="Edit all content on the separate vehicle page"
                          >
                            <FileText size={13} />
                            <span>Edit Page Details</span>
                          </Button>

                          <button
                            title={v.published ? 'Hide from public' : 'Publish'}
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                            onClick={() => handleTogglePublish(v)}
                          >
                            {v.published ? <Eye size={13} /> : <EyeOff size={13} className="text-gray-400" />}
                          </button>
                          <button
                            title={v.featured ? 'Remove from featured' : 'Mark as featured'}
                            className={`p-1.5 rounded hover:bg-amber-50 ${v.featured ? 'text-amber-500' : 'text-gray-300'}`}
                            onClick={() => handleToggleFeatured(v)}
                          >
                            <Star size={13} />
                          </button>
                          <button
                            title="Edit Basic Listing"
                            className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                            onClick={() => openEdit(v)}
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            title="Delete"
                            className="p-1.5 rounded hover:bg-red-50 text-red-500"
                            onClick={() => setDeleteId(v.id)}
                          >
                            <Trash2 size={13} />
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Vehicle' : 'Add New Vehicle'}</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-2">
            {/* Vehicle Name */}
            <div className="col-span-2 space-y-1">
              <Label>Vehicle Name *</Label>
              <Input
                value={form.name}
                placeholder="e.g. Sedan (Swift Dzire or similar)"
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Brand */}
            <div className="space-y-1">
              <Label>Brand</Label>
              <Input
                value={form.brand}
                placeholder="e.g. Maruti Suzuki"
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
              />
            </div>

            {/* Model */}
            <div className="space-y-1">
              <Label>Model</Label>
              <Input
                value={form.model}
                placeholder="e.g. Swift Dzire ZXi"
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                value={form.categorySlug}
                onValueChange={(v) => setForm((f) => ({ ...f, categorySlug: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleCategories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fuel */}
            <div className="space-y-1">
              <Label>Fuel Type</Label>
              <Select
                value={form.fuel || 'Petrol'}
                onValueChange={(v) => setForm((f) => ({ ...f, fuel: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'].map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price per km */}
            <div className="space-y-1">
              <Label>Price / KM (₹) *</Label>
              <Input
                type="number"
                min={0}
                step={0.5}
                value={form.pricePerKm}
                onChange={(e) => setForm((f) => ({ ...f, pricePerKm: +e.target.value }))}
              />
            </div>

            {/* Seats */}
            <div className="space-y-1">
              <Label>Seats</Label>
              <Input
                type="number"
                min={1}
                value={form.seats}
                onChange={(e) => setForm((f) => ({ ...f, seats: +e.target.value }))}
              />
            </div>

            {/* Luggage */}
            <div className="space-y-1">
              <Label>Luggage Bags</Label>
              <Input
                type="number"
                min={0}
                value={form.luggage}
                onChange={(e) => setForm((f) => ({ ...f, luggage: +e.target.value }))}
              />
            </div>

            {/* Order */}
            <div className="space-y-1">
              <Label>Display Order</Label>
              <Input
                type="number"
                min={1}
                value={form.order}
                onChange={(e) => setForm((f) => ({ ...f, order: +e.target.value }))}
              />
            </div>

            {/* Popularity score */}
            <div className="space-y-1">
              <Label>Popularity Score (0–100)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.popular}
                onChange={(e) => setForm((f) => ({ ...f, popular: +e.target.value }))}
              />
            </div>

            {/* Trip Types */}
            <div className="col-span-2 space-y-2">
              <Label>Trip Types</Label>
              <div className="flex flex-wrap gap-2">
                {tripTypeOptions.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => handleTripTypeToggle(t.value)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      form.tripTypes.includes(t.value)
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-orange-400'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="col-span-2 space-y-1">
              <Label>Features (one per line)</Label>
              <Textarea
                rows={4}
                value={featuresInput}
                placeholder={'GPS tracked\nKA registered yellow board\nAC enabled'}
                onChange={(e) => setFeaturesInput(e.target.value)}
              />
            </div>

            {/* Availability Text */}
            <div className="col-span-2 space-y-1">
              <Label>Availability Text</Label>
              <Input
                value={form.availabilityText}
                onChange={(e) => setForm((f) => ({ ...f, availabilityText: e.target.value }))}
              />
            </div>

            {/* Image Alt */}
            <div className="col-span-2 space-y-1">
              <Label>Image Alt Text</Label>
              <Input
                value={form.imageAlt}
                placeholder="Describe the vehicle image for accessibility"
                onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.ac}
                onCheckedChange={(v) => setForm((f) => ({ ...f, ac: v }))}
              />
              <Label>AC Enabled</Label>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.available}
                onCheckedChange={(v) => setForm((f) => ({ ...f, available: v }))}
              />
              <Label>Available for Booking</Label>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.published}
                onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
              />
              <Label>Published (visible publicly)</Label>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.featured}
                onCheckedChange={(v) => setForm((f) => ({ ...f, featured: v }))}
              />
              <Label>Featured on home page</Label>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <Switch
                checked={form.allowEnquiryWhenUnavailable}
                onCheckedChange={(v) =>
                  setForm((f) => ({ ...f, allowEnquiryWhenUnavailable: v }))
                }
              />
              <Label>Allow enquiry when unavailable</Label>
            </div>

            {/* Image Picker */}
            <div className="col-span-2 space-y-3">
              <Label>Vehicle Image *</Label>

              {/* Tabs */}
              <div className="flex gap-2">
                {(['builtin', 'url', 'upload'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setImageTab(tab)}
                    className={`px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                      imageTab === tab
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400'
                    }`}
                  >
                    {tab === 'builtin' ? '📦 Built-in' : tab === 'url' ? '🔗 URL' : '⬆ Upload'}
                  </button>
                ))}
              </div>

              {/* Built-in image grid */}
              {imageTab === 'builtin' && (
                <div className="grid grid-cols-4 gap-2">
                  {BUILTIN_IMAGES.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, image: img.url }));
                        setPreviewImage(img.url);
                      }}
                      className={`relative rounded border-2 overflow-hidden aspect-video transition-all bg-white ${
                        form.image === img.url
                          ? 'border-orange-500 shadow-md ring-2 ring-orange-400'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="h-full w-full object-cover"
                      />
                      <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                        {img.label}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {/* URL input */}
              {imageTab === 'url' && (
                <div className="space-y-2">
                  <Input
                    value={typeof form.image === 'string' && !form.image.startsWith('data:') && !form.image.startsWith('/') ? form.image : ''}
                    placeholder="https://example.com/vehicle.jpg"
                    onChange={(e) => {
                      setForm((f) => ({ ...f, image: e.target.value }));
                      setPreviewImage(e.target.value);
                    }}
                  />
                </div>
              )}

              {/* File upload */}
              {imageTab === 'upload' && (
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> Choose Image from Device (max 3 MB)
                  </Button>
                  {uploadedImageDataUrl && (
                    <p className="text-xs text-green-600">✓ Image uploaded</p>
                  )}
                </div>
              )}

              {/* Image preview */}
              {(previewImage || form.image) && (
                <div className="mt-2 rounded overflow-hidden border border-gray-200 bg-white h-36 flex items-center justify-center p-2">
                  <img
                    src={typeof form.image === 'string' ? form.image : previewImage}
                    alt="Preview"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600">
              {editId ? 'Save Changes' : 'Add Vehicle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* COMPREHENSIVE VEHICLE PAGE DETAIL EDITOR MODAL (/fleet/:slug)             */}
      {/* ========================================================================= */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[92vh] flex flex-col p-0 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 border-b bg-muted/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold">
                    Edit Detail Page: {selectedVehicleForDetail?.name}
                  </DialogTitle>
                  <Badge variant="outline" className="font-mono text-xs">
                    /fleet/{selectedVehicleForDetail?.slug}
                  </Badge>
                </div>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Customize the description, specifications, features, package rates, policies, and holds shown on the individual vehicle page.
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="gap-1.5 text-xs text-primary font-medium"
                >
                  <a href={`/fleet/${selectedVehicleForDetail?.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink size={13} /> View Live Page
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setResetDetailConfirm(true)}
                  className="text-xs text-muted-foreground hover:text-destructive gap-1"
                  title="Reset to default details"
                >
                  <RefreshCw size={12} /> Reset Defaults
                </Button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <Tabs
              value={detailTab}
              onValueChange={(val) => setDetailTab(val as typeof detailTab)}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-4 w-full h-10">
                <TabsTrigger value="overview" className="text-xs sm:text-sm font-semibold gap-1.5">
                  <FileText size={14} className="hidden sm:inline" /> Overview & Specs
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs sm:text-sm font-semibold gap-1.5">
                  <DollarSign size={14} className="hidden sm:inline" /> Rates & Packages
                </TabsTrigger>
                <TabsTrigger value="policies" className="text-xs sm:text-sm font-semibold gap-1.5">
                  <ShieldCheck size={14} className="hidden sm:inline" /> Policies & Dates
                </TabsTrigger>
                <TabsTrigger value="gallery" className="text-xs sm:text-sm font-semibold gap-1.5">
                  <ImageIcon size={14} className="hidden sm:inline" /> Photo Gallery
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {detailForm && (
              <>
                {/* TAB 1: OVERVIEW & SPECS */}
                {detailTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Summary Description */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-bold">Public Vehicle Summary Description</Label>
                        <span className="text-xs text-muted-foreground">
                          {detailForm.summary.length} characters
                        </span>
                      </div>
                      <Textarea
                        rows={3}
                        value={detailForm.summary}
                        placeholder="Detailed description shown directly under the vehicle title on the separate page..."
                        onChange={(e) =>
                          setDetailForm((prev) => prev && { ...prev, summary: e.target.value })
                        }
                        className="leading-relaxed"
                      />
                      <p className="text-xs text-muted-foreground">
                        This text appears at the top of the detail page right below the vehicle title and category badges.
                      </p>
                    </div>

                    {/* Extra Specs */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Specifications Grid</h3>
                          <p className="text-xs text-muted-foreground">
                            Key-value details rendered in the specifications section (in addition to Category, Passengers, Luggage, and AC).
                          </p>
                        </div>
                      </div>

                      {/* Specs Table */}
                      <div className="border rounded-lg overflow-hidden bg-card">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="bg-muted/50 border-b text-muted-foreground">
                              <th className="text-left px-3 py-2 font-medium w-1/3">Spec Label</th>
                              <th className="text-left px-3 py-2 font-medium">Value</th>
                              <th className="text-right px-3 py-2 font-medium w-16">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {detailForm.specs.map((spec, idx) => (
                              <tr key={idx} className="hover:bg-muted/20">
                                <td className="px-3 py-2 font-medium text-foreground">
                                  <Input
                                    value={spec.label}
                                    onChange={(e) => {
                                      const label = e.target.value;
                                      setDetailForm((prev) => {
                                        if (!prev) return prev;
                                        const specs = [...prev.specs];
                                        specs[idx] = { ...specs[idx], label };
                                        return { ...prev, specs };
                                      });
                                    }}
                                    className="h-7 text-xs"
                                  />
                                </td>
                                <td className="px-3 py-2">
                                  <Input
                                    value={spec.value}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      setDetailForm((prev) => {
                                        if (!prev) return prev;
                                        const specs = [...prev.specs];
                                        specs[idx] = { ...specs[idx], value };
                                        return { ...prev, specs };
                                      });
                                    }}
                                    className="h-7 text-xs"
                                  />
                                </td>
                                <td className="px-3 py-2 text-right">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSpec(idx)}
                                    className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                    title="Delete specification"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Add Spec Row */}
                      <div className="flex gap-2 items-center bg-muted/20 p-2.5 rounded-lg border">
                        <Input
                          placeholder="Spec Name (e.g. Fuel Type, Engine, Best For)"
                          value={newSpecLabel}
                          onChange={(e) => setNewSpecLabel(e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                        <Input
                          placeholder="Value (e.g. Petrol / Diesel, Family tours)"
                          value={newSpecValue}
                          onChange={(e) => setNewSpecValue(e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddSpec}
                          className="h-8 text-xs font-semibold gap-1 shrink-0"
                        >
                          <Plus size={13} /> Add Spec
                        </Button>
                      </div>
                    </div>

                    {/* On-Board Features */}
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">On-Board Features</h3>
                          <p className="text-xs text-muted-foreground">
                            Features with icons rendered in the "On-board features" section.
                          </p>
                        </div>
                      </div>

                      {/* Quick Presets */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                          Quick Add Presets:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {FEATURE_PRESETS.map((preset) => (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handleAddPresetFeature(preset)}
                              className="text-xs px-2.5 py-1 rounded-full border bg-card hover:bg-primary/10 hover:border-primary/50 text-foreground transition-colors inline-flex items-center gap-1"
                            >
                              <Plus size={11} className="text-primary" /> {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="grid sm:grid-cols-2 gap-2.5">
                        {detailForm.features.map((feat) => (
                          <div
                            key={feat.id}
                            className={`flex items-center justify-between gap-2 p-2.5 rounded-lg border transition-all ${
                              feat.visible
                                ? 'bg-card border-border shadow-xs'
                                : 'bg-muted/40 border-dashed border-border/70 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <Select
                                value={feat.icon}
                                onValueChange={(val) => {
                                  setDetailForm((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      features: prev.features.map((f) =>
                                        f.id === feat.id ? { ...f, icon: val } : f,
                                      ),
                                    };
                                  });
                                }}
                              >
                                <SelectTrigger className="h-7 w-24 text-[11px] p-1 shrink-0">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FEATURE_ICONS.map((ico) => (
                                    <SelectItem key={ico.value} value={ico.value} className="text-xs">
                                      {ico.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Input
                                value={feat.label}
                                onChange={(e) => {
                                  const label = e.target.value;
                                  setDetailForm((prev) => {
                                    if (!prev) return prev;
                                    return {
                                      ...prev,
                                      features: prev.features.map((f) =>
                                        f.id === feat.id ? { ...f, label } : f,
                                      ),
                                    };
                                  });
                                }}
                                className="h-7 text-xs font-medium flex-1 min-w-0"
                              />
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <Switch
                                checked={feat.visible}
                                onCheckedChange={() => handleToggleFeatureVisible(feat.id)}
                                title={feat.visible ? 'Visible on page' : 'Hidden from page'}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveFeature(feat.id)}
                                className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                title="Remove feature"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Custom Feature */}
                      <div className="flex gap-2 items-center bg-muted/20 p-2.5 rounded-lg border">
                        <Select value={newFeatureIcon} onValueChange={setNewFeatureIcon}>
                          <SelectTrigger className="h-8 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FEATURE_ICONS.map((ico) => (
                              <SelectItem key={ico.value} value={ico.value} className="text-xs">
                                {ico.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Custom feature name (e.g. Leather Seats, Mineral Water)"
                          value={newFeatureLabel}
                          onChange={(e) => setNewFeatureLabel(e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddFeature}
                          className="h-8 text-xs font-semibold gap-1 shrink-0"
                        >
                          <Plus size={13} /> Add Feature
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: RATES & PACKAGES */}
                {detailTab === 'pricing' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-foreground">Rates & Standard Packages Breakdown</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Manage tariff packages and rate items. You can set prices publicly or mark them as enquiry-only.
                      </p>
                    </div>

                    {/* Group Selector Sub-Tabs */}
                    <div className="flex flex-wrap gap-2 border-b pb-3">
                      {(['local', 'outstation', 'airport', 'extras'] as PriceGroup[]).map((group) => {
                        const count = detailForm.pricing.filter((p) => p.group === group).length;
                        return (
                          <button
                            key={group}
                            type="button"
                            onClick={() => setPriceGroupTab(group)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                              priceGroupTab === group
                                ? 'bg-primary text-primary-foreground shadow-xs'
                                : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                          >
                            <span>{priceGroupLabels[group]}</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {count}
                            </Badge>
                          </button>
                        );
                      })}
                    </div>

                    {/* Price Lines for Selected Group */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                          {priceGroupLabels[priceGroupTab]} Lines:
                        </span>
                      </div>

                      {detailForm.pricing.filter((p) => p.group === priceGroupTab).length === 0 ? (
                        <p className="text-xs text-muted-foreground py-6 text-center border border-dashed rounded-lg">
                          No price lines added for {priceGroupLabels[priceGroupTab]} yet. Add one below.
                        </p>
                      ) : (
                        <div className="space-y-2.5">
                          {detailForm.pricing
                            .filter((p) => p.group === priceGroupTab)
                            .map((line) => (
                              <div
                                key={line.id}
                                className={`p-3 rounded-lg border transition-all ${
                                  line.visible
                                    ? 'bg-card border-border shadow-xs'
                                    : 'bg-muted/40 border-dashed border-border/70'
                                }`}
                              >
                                <div className="grid sm:grid-cols-12 gap-2.5 items-center">
                                  {/* Label */}
                                  <div className="sm:col-span-4 space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase">
                                      Package / Rate Label
                                    </Label>
                                    <Input
                                      value={line.label}
                                      onChange={(e) =>
                                        handleUpdatePriceLine(line.id, { label: e.target.value })
                                      }
                                      className="h-8 text-xs font-semibold"
                                    />
                                  </div>

                                  {/* Public Rate Value */}
                                  <div className="sm:col-span-3 space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase">
                                      Public Rate Value
                                    </Label>
                                    <Input
                                      value={line.value}
                                      placeholder="e.g. ₹2,300, ₹14 / km"
                                      onChange={(e) =>
                                        handleUpdatePriceLine(line.id, { value: e.target.value })
                                      }
                                      className="h-8 text-xs font-bold text-primary"
                                    />
                                  </div>

                                  {/* Note */}
                                  <div className="sm:col-span-3 space-y-1">
                                    <Label className="text-[10px] text-muted-foreground uppercase">
                                      Note / Description
                                    </Label>
                                    <Input
                                      value={line.note || ''}
                                      placeholder="e.g. City limits, fuel included"
                                      onChange={(e) =>
                                        handleUpdatePriceLine(line.id, { note: e.target.value })
                                      }
                                      className="h-8 text-xs"
                                    />
                                  </div>

                                  {/* Actions */}
                                  <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-4 sm:pt-0">
                                    <div className="flex flex-col items-center">
                                      <Switch
                                        checked={line.visible}
                                        onCheckedChange={(val) =>
                                          handleUpdatePriceLine(line.id, { visible: val })
                                        }
                                        title={line.visible ? 'Visible rate' : 'Enquiry only'}
                                      />
                                      <span className="text-[9px] text-muted-foreground mt-0.5">
                                        {line.visible ? 'Public' : 'Enquiry'}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePriceLine(line.id)}
                                      className="p-1.5 rounded hover:bg-destructive/10 text-destructive"
                                      title="Remove price line"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>

                                {!line.visible && (
                                  <div className="mt-2 pt-2 border-t flex items-center gap-2">
                                    <span className="text-[10px] font-semibold text-muted-foreground">
                                      Enquiry Label Replacement:
                                    </span>
                                    <Input
                                      value={line.enquiryLabel}
                                      onChange={(e) =>
                                        handleUpdatePriceLine(line.id, { enquiryLabel: e.target.value })
                                      }
                                      className="h-6 text-xs max-w-xs"
                                    />
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Add Price Line Form */}
                      <div className="mt-4 p-3 bg-muted/20 border rounded-lg space-y-3">
                        <span className="text-xs font-bold text-foreground">
                          + Add New {priceGroupLabels[priceGroupTab]} Line
                        </span>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[10px]">Line Name *</Label>
                            <Input
                              placeholder="e.g. 12 hrs / 120 km package"
                              value={newPriceLine.label}
                              onChange={(e) =>
                                setNewPriceLine((prev) => ({ ...prev, label: e.target.value }))
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Rate Value</Label>
                            <Input
                              placeholder="e.g. ₹3,200 or ₹16 / km"
                              value={newPriceLine.value}
                              onChange={(e) =>
                                setNewPriceLine((prev) => ({ ...prev, value: e.target.value }))
                              }
                              className="h-8 text-xs font-medium"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px]">Note (optional)</Label>
                            <Input
                              placeholder="e.g. Driver bata included"
                              value={newPriceLine.note}
                              onChange={(e) =>
                                setNewPriceLine((prev) => ({ ...prev, note: e.target.value }))
                              }
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddPriceLine}
                            className="h-8 text-xs font-semibold gap-1"
                          >
                            <Plus size={13} /> Add Line to {priceGroupLabels[priceGroupTab]}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: POLICIES & BLOCKED DATES */}
                {detailTab === 'policies' && (
                  <div className="space-y-6">
                    {/* Rental Policies */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Rental Policies & Guidelines</h3>
                          <p className="text-xs text-muted-foreground">
                            Terms, billing rules, cancellation policies displayed on this vehicle's page.
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {detailForm.policies.map((policy, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-card p-2.5 rounded-lg border">
                            <ShieldAlert size={15} className="mt-1 text-primary shrink-0" />
                            <Textarea
                              rows={2}
                              value={policy}
                              onChange={(e) => {
                                const text = e.target.value;
                                setDetailForm((prev) => {
                                  if (!prev) return prev;
                                  const policies = [...prev.policies];
                                  policies[idx] = text;
                                  return { ...prev, policies };
                                });
                              }}
                              className="text-xs min-h-[42px] leading-relaxed flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePolicy(idx)}
                              className="p-1 rounded hover:bg-destructive/10 text-destructive mt-1"
                              title="Delete policy"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Policy */}
                      <div className="flex gap-2 items-center bg-muted/20 p-2.5 rounded-lg border">
                        <Input
                          placeholder="Add new policy term (e.g. Free cancellation up to 2 hours before pickup)..."
                          value={newPolicyText}
                          onChange={(e) => setNewPolicyText(e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddPolicy}
                          className="h-8 text-xs font-semibold gap-1 shrink-0"
                        >
                          <Plus size={13} /> Add Policy
                        </Button>
                      </div>
                    </div>

                    {/* Blocked Dates */}
                    <div className="space-y-3 pt-6 border-t">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-bold text-foreground">Inventory Date Holds (Blocked Dates)</h3>
                          <p className="text-xs text-muted-foreground">
                            Specify date ranges when this vehicle is booked, under maintenance, or unavailable.
                          </p>
                        </div>
                      </div>

                      {detailForm.dateBlocks.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                          No date blocks active. Vehicle is available on all unbooked dates.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {detailForm.dateBlocks.map((block, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between gap-3 bg-card p-2.5 rounded-lg border"
                            >
                              <div className="flex items-center gap-2 text-xs">
                                <Calendar size={14} className="text-amber-500 shrink-0" />
                                <span className="font-semibold text-foreground">
                                  {block.from} to {block.to}
                                </span>
                                <span className="text-muted-foreground">({block.reason})</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveDateBlock(idx)}
                                className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                title="Remove date block"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Date Block Form */}
                      <div className="grid sm:grid-cols-3 gap-2 bg-muted/20 p-2.5 rounded-lg border items-end">
                        <div>
                          <Label className="text-[10px]">From Date *</Label>
                          <Input
                            type="date"
                            value={newDateBlock.from}
                            onChange={(e) =>
                              setNewDateBlock((prev) => ({ ...prev, from: e.target.value }))
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px]">To Date *</Label>
                          <Input
                            type="date"
                            value={newDateBlock.to}
                            onChange={(e) =>
                              setNewDateBlock((prev) => ({ ...prev, to: e.target.value }))
                            }
                            className="h-8 text-xs"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Reason (e.g. Maintenance hold)"
                            value={newDateBlock.reason}
                            onChange={(e) =>
                              setNewDateBlock((prev) => ({ ...prev, reason: e.target.value }))
                            }
                            className="h-8 text-xs flex-1"
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleAddDateBlock}
                            className="h-8 text-xs font-semibold gap-1 shrink-0"
                          >
                            <Plus size={13} /> Hold
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: PHOTO GALLERY */}
                {detailTab === 'gallery' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-foreground">Extra Vehicle Photos & Gallery</h3>
                        <p className="text-xs text-muted-foreground">
                          Add multiple photos (Interior, Seating rows, Boot/Luggage space) to create an interactive gallery lightbox.
                        </p>
                      </div>
                    </div>

                    {/* Gallery List */}
                    <div className="grid sm:grid-cols-3 gap-3">
                      {detailForm.gallery.map((img) => (
                        <div
                          key={img.id}
                          className="group relative rounded-xl border bg-card overflow-hidden shadow-xs"
                        >
                          <div className="aspect-[16/10] w-full bg-muted overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="p-2.5">
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-[10px] capitalize">
                                {img.kind}
                              </Badge>
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(img.id)}
                                className="p-1 rounded hover:bg-destructive/10 text-destructive"
                                title="Remove photo"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1 truncate">{img.alt}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Gallery Photo Form */}
                    <div className="p-4 bg-muted/20 border rounded-xl space-y-3">
                      <span className="text-xs font-bold text-foreground">+ Add Photo to Gallery</span>
                      <div className="grid sm:grid-cols-3 gap-2.5">
                        <div>
                          <Label className="text-[10px]">Photo Kind</Label>
                          <Select
                            value={newGalleryKind}
                            onValueChange={(val) => setNewGalleryKind(val as GalleryKind)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="exterior">Exterior View</SelectItem>
                              <SelectItem value="interior">Interior Cabin</SelectItem>
                              <SelectItem value="seating">Seating Rows</SelectItem>
                              <SelectItem value="luggage">Luggage / Boot Space</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="sm:col-span-2">
                          <Label className="text-[10px]">Alt Text / Caption</Label>
                          <Input
                            placeholder="e.g. Clean 2x2 luxury seating with ample legroom"
                            value={newGalleryAlt}
                            onChange={(e) => setNewGalleryAlt(e.target.value)}
                            className="h-8 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 items-center">
                        <Input
                          placeholder="Image URL or data URL..."
                          value={newGalleryUrl}
                          onChange={(e) => setNewGalleryUrl(e.target.value)}
                          className="h-8 text-xs flex-1"
                        />
                        <input
                          ref={galleryFileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleGalleryUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => galleryFileInputRef.current?.click()}
                          className="h-8 text-xs gap-1 shrink-0"
                        >
                          <Upload size={13} /> Upload File
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddGalleryImage}
                          className="h-8 text-xs font-semibold gap-1 shrink-0 bg-primary"
                        >
                          <Plus size={13} /> Add Photo
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-muted/20 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSaveDetail}
              className="bg-primary hover:bg-primary/90 font-bold px-5"
            >
              Save Detail Page
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the vehicle from the public fleet listing. This action can be undone
              by using "Reset to Default" if it's a built-in vehicle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation */}
      <AlertDialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset fleet to defaults?</AlertDialogTitle>
            <AlertDialogDescription>
              This will discard all your custom additions and edits, restoring the original 8
              built-in vehicles.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReset} className="bg-orange-500 hover:bg-orange-600">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Detail Confirmation */}
      <AlertDialog open={resetDetailConfirm} onOpenChange={setResetDetailConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset page details to default?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset the summary description, specifications, features, package rates, and policies for "{selectedVehicleForDetail?.name}" back to original defaults.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDetail} className="bg-orange-500 hover:bg-orange-600">
              Reset Details
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
