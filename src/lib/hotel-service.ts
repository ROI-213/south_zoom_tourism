import { supabase } from "@/lib/supabase";
import { hotels as fallbackHotels } from "@/content/site";

export interface DbDestination {
  id: string;
  name: string;
  state?: string;
  slug?: string;
}

export interface DbRoom {
  id: string;
  hotel_id: string;
  room_type: string;
  price_per_night: number;
  capacity_adults: number;
  capacity_children: number;
  amenities?: string[] | null;
  image_url?: string | null;
  active: boolean;
  created_at?: string;
}

export interface DbHotel {
  id: string;
  name: string;
  destination_id?: string | null;
  city: string;
  star_rating: number;
  description?: string | null;
  main_image?: string | null;
  active: boolean;
  featured: boolean;
  created_at?: string;
  destinations?: DbDestination | null;
  hotel_rooms?: DbRoom[];
}

export interface DynamicHomeHotel {
  id: string;
  name: string;
  city: string;
  starRating: number;
  roomType: string;
  pricePerNight: number;
  image: string;
  alt: string;
  amenities: string[];
  active: boolean;
  featured: boolean;
  destinationName?: string;
}

export function slugify(str: string): string {
  return (str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const DEFAULT_HOTEL_IMG =
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80";

/**
 * Fetch all hotels with their destinations and rooms for Admin
 */
export async function fetchAdminHotels(): Promise<DbHotel[]> {
  try {
    const { data, error } = await supabase
      .from("hotels")
      .select("*, destinations(id, name, state, slug), hotel_rooms(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data as DbHotel[]) || [];
  } catch (err) {
    console.error("Error fetching admin hotels:", err);
    return [];
  }
}

/**
 * Fetch active hotels with active rooms for public site
 */
export async function fetchLiveHotels(): Promise<DbHotel[]> {
  try {
    const { data, error } = await supabase
      .from("hotels")
      .select("*, destinations(id, name, state, slug), hotel_rooms(*)")
      .eq("active", true)
      .order("featured", { ascending: false })
      .order("name", { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data as DbHotel[];
    }
    return [];
  } catch (err) {
    console.error("Error fetching live hotels, using fallback:", err);
    return [];
  }
}

/**
 * Maps Supabase hotels into the lightweight format expected by the homepage and cards
 */
export function mapDbHotelsToHomeList(dbHotels: DbHotel[]): DynamicHomeHotel[] {
  if (!dbHotels || dbHotels.length === 0) {
    return fallbackHotels.map((h) => ({
      id: h.id,
      name: h.name,
      city: h.city,
      starRating: h.starRating,
      roomType: h.roomType,
      pricePerNight: h.pricePerNight,
      image: h.image,
      alt: h.alt || `${h.name} in ${h.city}`,
      amenities: h.amenities || ["Wi-Fi", "Free breakfast"],
      active: true,
      featured: true,
    }));
  }

  return dbHotels.map((h) => {
    const activeRooms = (h.hotel_rooms || []).filter((r) => r.active !== false);
    const sortedRooms = [...activeRooms].sort((a, b) => Number(a.price_per_night) - Number(b.price_per_night));
    const lowestRoom = sortedRooms[0];

    const price = lowestRoom ? Number(lowestRoom.price_per_night) : 2500;
    const roomType = lowestRoom ? lowestRoom.room_type : "Standard Room";
    const roomAmenities = lowestRoom?.amenities && lowestRoom.amenities.length > 0 ? lowestRoom.amenities : [];
    const hotelAmenities = roomAmenities.length > 0 ? roomAmenities : ["Wi-Fi", "Parking", "Free breakfast"];

    return {
      id: h.id,
      name: h.name,
      city: h.city,
      starRating: h.star_rating || 3,
      roomType,
      pricePerNight: price,
      image: h.main_image || DEFAULT_HOTEL_IMG,
      alt: `${h.name} in ${h.city}`,
      amenities: hotelAmenities,
      active: h.active,
      featured: h.featured,
      destinationName: h.destinations?.name || h.city,
    };
  });
}

/**
 * Create a new Hotel
 */
export async function createHotel(payload: {
  name: string;
  city: string;
  destination_id?: string | null;
  star_rating?: number;
  description?: string;
  main_image?: string;
  active?: boolean;
  featured?: boolean;
}) {
  const insertData = {
    name: payload.name.trim(),
    city: payload.city.trim(),
    destination_id: payload.destination_id || null,
    star_rating: Number(payload.star_rating) || 3,
    description: payload.description || "",
    main_image: payload.main_image || DEFAULT_HOTEL_IMG,
    active: payload.active !== undefined ? payload.active : true,
    featured: payload.featured !== undefined ? payload.featured : false,
  };

  const { data, error } = await supabase.from("hotels").insert(insertData).select().single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing Hotel
 */
export async function updateHotel(
  id: string,
  payload: {
    name: string;
    city: string;
    destination_id?: string | null;
    star_rating?: number;
    description?: string;
    main_image?: string;
    active?: boolean;
    featured?: boolean;
  }
) {
  const updateData = {
    name: payload.name.trim(),
    city: payload.city.trim(),
    destination_id: payload.destination_id || null,
    star_rating: Number(payload.star_rating) || 3,
    description: payload.description || "",
    main_image: payload.main_image || DEFAULT_HOTEL_IMG,
    active: payload.active !== undefined ? payload.active : true,
    featured: payload.featured !== undefined ? payload.featured : false,
  };

  const { data, error } = await supabase.from("hotels").update(updateData).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

/**
 * Delete a Hotel and all its rooms
 */
export async function deleteHotel(id: string) {
  // Cascades room deletion
  const { error } = await supabase.from("hotels").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Create a new Room for a hotel
 */
export async function createRoom(payload: {
  hotel_id: string;
  room_type: string;
  price_per_night: number;
  capacity_adults?: number;
  capacity_children?: number;
  amenities?: string[];
  image_url?: string;
  active?: boolean;
}) {
  const insertData = {
    hotel_id: payload.hotel_id,
    room_type: payload.room_type.trim(),
    price_per_night: Number(payload.price_per_night) || 0,
    capacity_adults: Number(payload.capacity_adults) || 2,
    capacity_children: Number(payload.capacity_children) || 0,
    amenities: payload.amenities || ["Wi-Fi", "Hot Water", "Room Service"],
    image_url: payload.image_url || DEFAULT_HOTEL_IMG,
    active: payload.active !== undefined ? payload.active : true,
  };

  const { data, error } = await supabase.from("hotel_rooms").insert(insertData).select().single();
  if (error) throw error;
  return data;
}

/**
 * Update an existing Room
 */
export async function updateRoom(
  id: string,
  payload: {
    room_type: string;
    price_per_night: number;
    capacity_adults?: number;
    capacity_children?: number;
    amenities?: string[];
    image_url?: string;
    active?: boolean;
  }
) {
  const updateData = {
    room_type: payload.room_type.trim(),
    price_per_night: Number(payload.price_per_night) || 0,
    capacity_adults: Number(payload.capacity_adults) || 2,
    capacity_children: Number(payload.capacity_children) || 0,
    amenities: payload.amenities || ["Wi-Fi", "Hot Water", "Room Service"],
    image_url: payload.image_url || DEFAULT_HOTEL_IMG,
    active: payload.active !== undefined ? payload.active : true,
  };

  const { data, error } = await supabase.from("hotel_rooms").update(updateData).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

/**
 * Delete a Room
 */
export async function deleteRoom(id: string) {
  const { error } = await supabase.from("hotel_rooms").delete().eq("id", id);
  if (error) throw error;
  return true;
}

/**
 * Toggle featured status for a hotel
 */
export async function toggleHotelFeatured(id: string, currentFeatured: boolean) {
  const { error } = await supabase.from("hotels").update({ featured: !currentFeatured }).eq("id", id);
  if (error) throw error;
  return !currentFeatured;
}

/**
 * Toggle active status for a hotel
 */
export async function toggleHotelActive(id: string, currentActive: boolean) {
  const { error } = await supabase.from("hotels").update({ active: !currentActive }).eq("id", id);
  if (error) throw error;
  return !currentActive;
}
