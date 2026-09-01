import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
  fetchAdminHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  createRoom,
  updateRoom,
  deleteRoom,
  toggleHotelFeatured,
  toggleHotelActive,
  type DbHotel,
  type DbRoom,
  type DbDestination,
} from '@/lib/hotel-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Plus,
  Search,
  Hotel,
  Loader2,
  Edit2,
  Trash2,
  Star,
  ChevronDown,
  ChevronUp,
  BedDouble,
  MapPin,
  Users,
  Image as ImageIcon,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Filter,
  RefreshCw,
} from 'lucide-react';

export const Route = createFileRoute('/admin/products/hotels')({
  component: HotelsPage,
});

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

const ROOM_TYPES = [
  'Standard Room',
  'Deluxe Room',
  'Executive Suite',
  'Family Suite',
  'Cottage / Villa',
  'Lake / Sea View Room',
  'Heritage Room',
  'Dormitory',
];

const emptyHotelForm = {
  name: '',
  destination_id: '',
  city: '',
  star_rating: 3,
  description: '',
  main_image: DEFAULT_IMAGE,
  active: true,
  featured: false,
};

const emptyRoomForm = {
  room_type: 'Deluxe Room',
  price_per_night: 3500,
  capacity_adults: 2,
  capacity_children: 1,
  amenities: 'Wi-Fi, AC, Hot Water, Free Breakfast',
  image_url: DEFAULT_IMAGE,
  active: true,
};

function HotelsPage() {
  const [hotels, setHotels] = useState<DbHotel[]>([]);
  const [destinations, setDestinations] = useState<DbDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');
  const [selectedRating, setSelectedRating] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'featured'>('all');

  // Expanded accordion per hotel
  const [expandedHotel, setExpandedHotel] = useState<string | null>(null);

  // Hotel modal
  const [hotelDialog, setHotelDialog] = useState(false);
  const [editHotelId, setEditHotelId] = useState<string | null>(null);
  const [hotelForm, setHotelForm] = useState(emptyHotelForm);
  const [savingHotel, setSavingHotel] = useState(false);

  // Delete hotel
  const [deleteHotelId, setDeleteHotelId] = useState<string | null>(null);
  const [deletingHotel, setDeletingHotel] = useState(false);

  // Room modal
  const [roomDialog, setRoomDialog] = useState(false);
  const [activeHotelForRoom, setActiveHotelForRoom] = useState<string | null>(null);
  const [editRoomId, setEditRoomId] = useState<string | null>(null);
  const [roomForm, setRoomForm] = useState(emptyRoomForm);
  const [savingRoom, setSavingRoom] = useState(false);

  // Delete room
  const [deleteRoomId, setDeleteRoomId] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    try {
      const [hotelsData, destRes] = await Promise.all([
        fetchAdminHotels(),
        supabase.from('destinations').select('id, name, state, slug').order('name'),
      ]);
      setHotels(hotelsData);
      setDestinations((destRes.data as DbDestination[]) || []);
    } catch (err: any) {
      toast.error('Failed to load hotel data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // Filtered hotels list
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchesSearch =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.city.toLowerCase().includes(search.toLowerCase()) ||
        (h.destinations?.name && h.destinations.name.toLowerCase().includes(search.toLowerCase()));

      const matchesDest =
        selectedDestination === 'all' || h.destination_id === selectedDestination;

      const matchesRating =
        selectedRating === 'all' || String(h.star_rating) === selectedRating;

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && h.active) ||
        (statusFilter === 'featured' && h.featured);

      return matchesSearch && matchesDest && matchesRating && matchesStatus;
    });
  }, [hotels, search, selectedDestination, selectedRating, statusFilter]);

  // Statistics
  const totalHotelsCount = hotels.length;
  const activeHotelsCount = hotels.filter((h) => h.active).length;
  const featuredHotelsCount = hotels.filter((h) => h.featured).length;
  const totalRoomsCount = hotels.reduce((sum, h) => sum + (h.hotel_rooms?.length || 0), 0);

  // Open add hotel modal
  function handleOpenAddHotel() {
    setEditHotelId(null);
    setHotelForm(emptyHotelForm);
    setHotelDialog(true);
  }

  // Open edit hotel modal
  function handleOpenEditHotel(h: DbHotel) {
    setEditHotelId(h.id);
    setHotelForm({
      name: h.name,
      destination_id: h.destination_id || '',
      city: h.city,
      star_rating: h.star_rating || 3,
      description: h.description || '',
      main_image: h.main_image || DEFAULT_IMAGE,
      active: h.active,
      featured: h.featured,
    });
    setHotelDialog(true);
  }

  // Save hotel (Create or Update)
  async function handleSaveHotel() {
    if (!hotelForm.name.trim() || !hotelForm.city.trim()) {
      toast.error('Hotel Name and City are required');
      return;
    }
    setSavingHotel(true);
    try {
      if (editHotelId) {
        await updateHotel(editHotelId, hotelForm);
        toast.success(`Hotel "${hotelForm.name}" updated successfully!`);
      } else {
        await createHotel(hotelForm);
        toast.success(`Hotel "${hotelForm.name}" added successfully!`);
      }
      setHotelDialog(false);
      setHotelForm(emptyHotelForm);
      setEditHotelId(null);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to save hotel: ' + err.message);
    } finally {
      setSavingHotel(false);
    }
  }

  // Confirm delete hotel
  async function handleConfirmDeleteHotel() {
    if (!deleteHotelId) return;
    setDeletingHotel(true);
    try {
      await deleteHotel(deleteHotelId);
      toast.success('Hotel and associated rooms removed successfully.');
      setDeleteHotelId(null);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to delete hotel: ' + err.message);
    } finally {
      setDeletingHotel(false);
    }
  }

  // Quick toggle featured
  async function handleToggleFeatured(h: DbHotel) {
    try {
      const next = await toggleHotelFeatured(h.id, h.featured);
      toast.success(
        next ? `"${h.name}" is now featured on Homepage!` : `"${h.name}" unfeatured.`
      );
      setHotels((prev) =>
        prev.map((item) => (item.id === h.id ? { ...item, featured: next } : item))
      );
    } catch (err: any) {
      toast.error('Failed to update featured status: ' + err.message);
    }
  }

  // Quick toggle active
  async function handleToggleActive(h: DbHotel) {
    try {
      const next = await toggleHotelActive(h.id, h.active);
      toast.success(
        next ? `"${h.name}" is now Active & Visible!` : `"${h.name}" set to Inactive.`
      );
      setHotels((prev) =>
        prev.map((item) => (item.id === h.id ? { ...item, active: next } : item))
      );
    } catch (err: any) {
      toast.error('Failed to update active status: ' + err.message);
    }
  }

  // Open add room modal
  function handleOpenAddRoom(hotelId: string) {
    setActiveHotelForRoom(hotelId);
    setEditRoomId(null);
    setRoomForm(emptyRoomForm);
    setRoomDialog(true);
  }

  // Open edit room modal
  function handleOpenEditRoom(hotelId: string, r: DbRoom) {
    setActiveHotelForRoom(hotelId);
    setEditRoomId(r.id);
    setRoomForm({
      room_type: r.room_type,
      price_per_night: Number(r.price_per_night) || 0,
      capacity_adults: Number(r.capacity_adults) || 2,
      capacity_children: Number(r.capacity_children) || 0,
      amenities: Array.isArray(r.amenities)
        ? r.amenities.join(', ')
        : (r.amenities as any) || 'Wi-Fi, AC, Hot Water',
      image_url: r.image_url || DEFAULT_IMAGE,
      active: r.active !== false,
    });
    setRoomDialog(true);
  }

  // Save room (Create or Update)
  async function handleSaveRoom() {
    if (!activeHotelForRoom) return;
    if (!roomForm.room_type.trim()) {
      toast.error('Room Type is required');
      return;
    }
    if (Number(roomForm.price_per_night) < 0) {
      toast.error('Price per night must be 0 or more');
      return;
    }

    setSavingRoom(true);
    try {
      const parsedAmenities = roomForm.amenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      const roomPayload = {
        hotel_id: activeHotelForRoom,
        room_type: roomForm.room_type,
        price_per_night: Number(roomForm.price_per_night),
        capacity_adults: Number(roomForm.capacity_adults),
        capacity_children: Number(roomForm.capacity_children),
        amenities: parsedAmenities,
        image_url: roomForm.image_url,
        active: roomForm.active,
      };

      if (editRoomId) {
        await updateRoom(editRoomId, roomPayload);
        toast.success(`Room "${roomForm.room_type}" updated!`);
      } else {
        await createRoom(roomPayload);
        toast.success(`Room "${roomForm.room_type}" added!`);
      }

      setRoomDialog(false);
      setRoomForm(emptyRoomForm);
      setEditRoomId(null);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to save room: ' + err.message);
    } finally {
      setSavingRoom(false);
    }
  }

  // Confirm delete room
  async function handleConfirmDeleteRoom() {
    if (!deleteRoomId) return;
    try {
      await deleteRoom(deleteRoomId);
      toast.success('Room removed.');
      setDeleteRoomId(null);
      await loadData();
    } catch (err: any) {
      toast.error('Failed to delete room: ' + err.message);
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Hotel className="h-6 w-6 text-orange-500" /> Hotel Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add, edit, manage partner hotels, room configurations and live inventory rates.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            disabled={loading}
            className="gap-2 h-9 text-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
          <Button
            onClick={handleOpenAddHotel}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2 shadow-sm h-9 text-xs"
          >
            <Plus size={16} /> Add Hotel
          </Button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <Hotel size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{totalHotelsCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Total Hotels</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-xl">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{activeHotelsCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Active & Bookable</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl">
              <Sparkles size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{featuredHotelsCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Featured (Homepage)</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <BedDouble size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight">{totalRoomsCount}</div>
              <div className="text-xs text-muted-foreground font-medium">Total Room Types</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border/60 bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by hotel name or city..."
                className="pl-9 h-9 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Destination Filter */}
            <div>
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Destinations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Destinations</SelectItem>
                  {destinations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Star Rating Filter */}
            <div>
              <Select value={selectedRating} onValueChange={setSelectedRating}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="All Star Ratings" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings (1–5 Star)</SelectItem>
                  <SelectItem value="5">5 Star Luxury</SelectItem>
                  <SelectItem value="4">4 Star Premium</SelectItem>
                  <SelectItem value="3">3 Star Standard</SelectItem>
                  <SelectItem value="2">2 Star Budget</SelectItem>
                  <SelectItem value="1">1 Star Economy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={statusFilter}
                onValueChange={(v: 'all' | 'active' | 'featured') => setStatusFilter(v)}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="featured">Featured on Homepage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hotel Cards List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="animate-spin text-orange-500" size={32} />
          <p className="text-sm text-muted-foreground">Loading hotel inventory...</p>
        </div>
      ) : filteredHotels.length === 0 ? (
        <Card className="border-dashed border-border/80 p-12 text-center">
          <Hotel className="mx-auto mb-3 opacity-20 text-muted-foreground" size={48} />
          <h3 className="font-semibold text-base">No hotels found</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
            {search || selectedDestination !== 'all' || statusFilter !== 'all'
              ? 'Try changing your search or filter criteria.'
              : 'Get started by creating your first partner hotel.'}
          </p>
          <Button
            onClick={handleOpenAddHotel}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            <Plus size={15} /> Add Hotel
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHotels.map((h) => {
            const hotelRooms = h.hotel_rooms || [];
            const isExpanded = expandedHotel === h.id;
            const lowestPrice =
              hotelRooms.length > 0
                ? Math.min(...hotelRooms.map((r) => Number(r.price_per_night) || 0))
                : 0;

            return (
              <Card
                key={h.id}
                className={`border transition-all duration-200 ${
                  h.active ? 'border-border/80' : 'border-border/40 opacity-75 bg-muted/20'
                }`}
              >
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Left: Thumbnail & Details */}
                    <div className="flex items-start gap-4">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border/60">
                        <img
                          src={h.main_image || DEFAULT_IMAGE}
                          alt={h.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                          }}
                        />
                        {h.featured && (
                          <div className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                            <Sparkles size={10} /> Featured
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base sm:text-lg font-bold text-foreground hover:text-orange-500 transition-colors">
                            {h.name}
                          </h3>
                          <div className="flex items-center">
                            {Array.from({ length: h.star_rating || 3 }).map((_, i) => (
                              <Star
                                key={i}
                                size={13}
                                className="fill-amber-400 text-amber-400"
                              />
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 font-medium text-foreground/80">
                            <MapPin size={13} className="text-orange-500" /> {h.city}
                          </span>
                          {h.destinations && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-[10px] px-2 py-0">
                                {h.destinations.name}
                              </Badge>
                            </>
                          )}
                          <span>•</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            {lowestPrice > 0 ? `Starts ₹${lowestPrice.toLocaleString('en-IN')}/night` : 'No rates set'}
                          </span>
                        </div>

                        {h.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-xl pt-0.5">
                            {h.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions & Status Toggles */}
                    <div className="flex flex-wrap items-center md:flex-col md:items-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                      <div className="flex items-center gap-3">
                        {/* Quick Featured Toggle */}
                        <button
                          onClick={() => handleToggleFeatured(h)}
                          title={h.featured ? 'Featured on Homepage (Click to unfeature)' : 'Click to feature on Homepage'}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                            h.featured
                              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                              : 'bg-muted/50 text-muted-foreground border-border hover:bg-muted'
                          }`}
                        >
                          <Star size={12} className={h.featured ? 'fill-amber-500 text-amber-500' : ''} />
                          {h.featured ? 'Featured' : 'Not Featured'}
                        </button>

                        {/* Quick Active Toggle */}
                        <button
                          onClick={() => handleToggleActive(h)}
                          title={h.active ? 'Active (Click to disable)' : 'Inactive (Click to enable)'}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                            h.active
                              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30'
                              : 'bg-red-500/10 text-red-500 border-red-500/30'
                          }`}
                        >
                          {h.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                          {h.active ? 'Active' : 'Inactive'}
                        </button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditHotel(h)}
                          className="h-8 px-2.5 text-xs gap-1.5"
                        >
                          <Edit2 size={13} /> Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteHotelId(h.id)}
                          className="h-8 px-2.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5"
                        >
                          <Trash2 size={13} /> Delete
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedHotel(isExpanded ? null : h.id)}
                          className="h-8 px-2.5 text-xs gap-1 text-muted-foreground hover:text-foreground"
                        >
                          <BedDouble size={14} className="text-orange-500" />
                          <span>Rooms ({hotelRooms.length})</span>
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Rooms Panel */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-border/60 pt-4 bg-muted/10 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 p-4 sm:p-5 rounded-b-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <BedDouble size={16} className="text-orange-500" />
                          <h4 className="font-semibold text-sm">
                            Room Types & Pricing ({hotelRooms.length})
                          </h4>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleOpenAddRoom(h.id)}
                          className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white gap-1.5"
                        >
                          <Plus size={13} /> Add Room Type
                        </Button>
                      </div>

                      {hotelRooms.length === 0 ? (
                        <div className="text-center py-6 border border-dashed rounded-lg bg-background/50">
                          <BedDouble className="mx-auto mb-1 text-muted-foreground opacity-30" size={24} />
                          <p className="text-xs text-muted-foreground">
                            No rooms added yet. Add rooms to make this hotel bookable on the site.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {hotelRooms.map((r) => (
                            <div
                              key={r.id}
                              className="bg-card border border-border/80 rounded-xl p-3.5 flex flex-col justify-between shadow-xs hover:border-orange-500/50 transition-colors"
                            >
                              <div>
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                  <div className="font-semibold text-sm text-foreground">
                                    {r.room_type}
                                  </div>
                                  <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                      r.active !== false
                                        ? 'bg-green-500/10 text-green-600'
                                        : 'bg-gray-200 text-gray-600'
                                    }`}
                                  >
                                    {r.active !== false ? 'Active' : 'Inactive'}
                                  </span>
                                </div>

                                <div className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-1">
                                  ₹{Number(r.price_per_night).toLocaleString('en-IN')}
                                  <span className="text-xs font-normal text-muted-foreground"> / night</span>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <span className="flex items-center gap-1">
                                    <Users size={12} /> {r.capacity_adults} Adults, {r.capacity_children} Kids
                                  </span>
                                </div>

                                {r.amenities && r.amenities.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {(Array.isArray(r.amenities) ? r.amenities : [r.amenities]).map(
                                      (am: string, idx: number) => (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-[9px] px-1.5 py-0 font-normal"
                                        >
                                          {am}
                                        </Badge>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-end gap-1.5 pt-2 border-t border-border/40">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenEditRoom(h.id, r)}
                                  className="h-7 px-2 text-xs gap-1 hover:bg-orange-500/10 hover:text-orange-600"
                                >
                                  <Edit2 size={12} /> Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteRoomId(r.id)}
                                  className="h-7 px-2 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600 gap-1"
                                >
                                  <Trash2 size={12} /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Hotel Create / Edit Dialog */}
      <Dialog open={hotelDialog} onOpenChange={setHotelDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Hotel className="h-5 w-5 text-orange-500" />
              {editHotelId ? 'Edit Hotel Details' : 'Add New Partner Hotel'}
            </DialogTitle>
            <DialogDescription>
              Configure hotel information, city location, star rating, and visual assets.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
            {/* Hotel Name */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Hotel Name *</Label>
              <Input
                placeholder="e.g. Hillview Mountain Resort"
                value={hotelForm.name}
                onChange={(e) => setHotelForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* City */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">City / Town *</Label>
              <Input
                placeholder="e.g. Ooty, Munnar, Bengaluru"
                value={hotelForm.city}
                onChange={(e) => setHotelForm((f) => ({ ...f, city: e.target.value }))}
              />
            </div>

            {/* Destination Link */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Destination Association</Label>
              <Select
                value={hotelForm.destination_id || 'none'}
                onValueChange={(v) =>
                  setHotelForm((f) => ({ ...f, destination_id: v === 'none' ? null : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Destination" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Direct City</SelectItem>
                  {destinations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name} ({d.state})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Star Rating</Label>
              <Select
                value={String(hotelForm.star_rating)}
                onValueChange={(v) => setHotelForm((f) => ({ ...f, star_rating: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">★★★★★ 5 Star Luxury</SelectItem>
                  <SelectItem value="4">★★★★ 4 Star Premium</SelectItem>
                  <SelectItem value="3">★★★ 3 Star Standard</SelectItem>
                  <SelectItem value="2">★★ 2 Star Budget</SelectItem>
                  <SelectItem value="1">★ 1 Star Economy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Main Image URL */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Main Photo URL</Label>
              <div className="flex gap-2 items-center">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={hotelForm.main_image}
                  onChange={(e) => setHotelForm((f) => ({ ...f, main_image: e.target.value }))}
                />
                {hotelForm.main_image && (
                  <img
                    src={hotelForm.main_image}
                    alt="Preview"
                    className="w-10 h-10 rounded-lg object-cover border shrink-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = DEFAULT_IMAGE;
                    }}
                  />
                )}
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Description & Overview</Label>
              <Textarea
                rows={3}
                placeholder="Describe key highlights, surrounding views, connectivity, and amenities..."
                value={hotelForm.description}
                onChange={(e) => setHotelForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Active & Featured Toggles */}
            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
              <div>
                <div className="font-semibold text-xs text-foreground">Active & Bookable</div>
                <div className="text-[11px] text-muted-foreground">Visible on public hotel directory</div>
              </div>
              <Switch
                checked={hotelForm.active}
                onCheckedChange={(v) => setHotelForm((f) => ({ ...f, active: v }))}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
              <div>
                <div className="font-semibold text-xs text-foreground">Featured on Homepage</div>
                <div className="text-[11px] text-muted-foreground">Highlights property on main landing page</div>
              </div>
              <Switch
                checked={hotelForm.featured}
                onCheckedChange={(v) => setHotelForm((f) => ({ ...f, featured: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setHotelDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveHotel}
              disabled={savingHotel}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {savingHotel ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> Saving...
                </>
              ) : editHotelId ? (
                'Update Hotel'
              ) : (
                'Create Hotel'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Room Create / Edit Dialog */}
      <Dialog open={roomDialog} onOpenChange={setRoomDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <BedDouble className="h-5 w-5 text-orange-500" />
              {editRoomId ? 'Edit Room Type' : 'Add New Room Type'}
            </DialogTitle>
            <DialogDescription>
              Configure room name, price per night, guest capacity, and amenities.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-3">
            {/* Room Type */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Room Type / Category *</Label>
              <div className="space-y-2">
                <Select
                  value={
                    ROOM_TYPES.includes(roomForm.room_type) ? roomForm.room_type : 'custom'
                  }
                  onValueChange={(v) => {
                    if (v !== 'custom') setRoomForm((f) => ({ ...f, room_type: v }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select or type custom" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom Room Title...</SelectItem>
                  </SelectContent>
                </Select>
                {(!ROOM_TYPES.includes(roomForm.room_type) || roomForm.room_type === '') && (
                  <Input
                    placeholder="Enter custom room title (e.g. Presidential Valley Villa)"
                    value={roomForm.room_type}
                    onChange={(e) => setRoomForm((f) => ({ ...f, room_type: e.target.value }))}
                  />
                )}
              </div>
            </div>

            {/* Price Per Night */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Price / Night (₹) *</Label>
              <Input
                type="number"
                min={0}
                placeholder="3500"
                value={roomForm.price_per_night}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, price_per_night: Number(e.target.value) }))
                }
              />
            </div>

            {/* Capacity Adults */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Adults Capacity</Label>
              <Input
                type="number"
                min={1}
                max={20}
                value={roomForm.capacity_adults}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, capacity_adults: Number(e.target.value) }))
                }
              />
            </div>

            {/* Capacity Children */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Children Capacity</Label>
              <Input
                type="number"
                min={0}
                max={10}
                value={roomForm.capacity_children}
                onChange={(e) =>
                  setRoomForm((f) => ({ ...f, capacity_children: Number(e.target.value) }))
                }
              />
            </div>

            {/* Room Image URL */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Room Image URL</Label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={roomForm.image_url}
                onChange={(e) => setRoomForm((f) => ({ ...f, image_url: e.target.value }))}
              />
            </div>

            {/* Amenities (comma-separated) */}
            <div className="sm:col-span-2 space-y-1.5">
              <Label className="text-xs font-semibold">Amenities (comma separated)</Label>
              <Input
                placeholder="Wi-Fi, AC, Balcony, Free Breakfast, Hot Water"
                value={roomForm.amenities}
                onChange={(e) => setRoomForm((f) => ({ ...f, amenities: e.target.value }))}
              />
            </div>

            {/* Active Toggle */}
            <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl border bg-muted/20">
              <div>
                <div className="font-semibold text-xs text-foreground">Room Active</div>
                <div className="text-[11px] text-muted-foreground">Allows booking this room type</div>
              </div>
              <Switch
                checked={roomForm.active}
                onCheckedChange={(v) => setRoomForm((f) => ({ ...f, active: v }))}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRoomDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRoom}
              disabled={savingRoom}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {savingRoom ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" /> Saving...
                </>
              ) : editRoomId ? (
                'Update Room'
              ) : (
                'Add Room'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Hotel Alert Dialog */}
      <AlertDialog open={Boolean(deleteHotelId)} onOpenChange={() => setDeleteHotelId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 size={18} /> Delete Hotel & Rooms?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this hotel? All associated room types,
              pricing configurations, and inventory references will also be deleted from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteHotel}
              disabled={deletingHotel}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deletingHotel ? 'Deleting...' : 'Delete Hotel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Room Alert Dialog */}
      <AlertDialog open={Boolean(deleteRoomId)} onOpenChange={() => setDeleteRoomId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 flex items-center gap-2">
              <Trash2 size={18} /> Delete Room Type?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this room type? Customers will no longer be able to
              select or book this specific room.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteRoom}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
