import supabase from '@/lib/supabase';

export type PackageRecord = {
  id: string;
  slug: string;
  title: string;
  state: string;
  destination: string;
  category_slugs: string[];
  nights: number;
  days: number;
  starting_city: string;
  price: number;
  price_basis: 'per-person' | 'per-group' | 'starting';
  show_price: boolean;
  hotel_category: string;
  vehicle_category: string;
  includes_hotel: boolean;
  includes_vehicle: boolean;
  max_travellers: number;
  itinerary_summary: string[];
  badges: string[];
  available_from: string;
  available_to: string;
  sold_out: boolean;
  image: string;
  image_alt: string;
  display_order: number;
  published: boolean;
  featured: boolean;
  best_seller: boolean;
  active: boolean; // derived from published flag for admin UI
};

/** Fetch all tour packages */
export const fetchAllPackages = async (): Promise<PackageRecord[]> => {
  const { data, error } = await supabase.from('tour_packages').select('*');
  if (error) throw error;
  return data as PackageRecord[];
};

/** Fetch a single package by ID */
export const fetchPackageById = async (id: string): Promise<PackageRecord | null> => {
  const { data, error } = await supabase.from('tour_packages').select('*').eq('id', id).single();
  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data as PackageRecord;
};

/** Create a new package */
export const createPackage = async (pkg: Omit<PackageRecord, 'id' | 'active'>): Promise<PackageRecord> => {
  const { data, error } = await supabase.from('tour_packages').insert(pkg).select('*').single();
  if (error) throw error;
  return data as PackageRecord;
};

/** Update an existing package */
export const updatePackage = async (
  id: string,
  updates: Partial<Omit<PackageRecord, 'id' | 'active'>>,
): Promise<PackageRecord> => {
  const { data, error } = await supabase
    .from('tour_packages')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as PackageRecord;
};

/** Delete a package */
export const deletePackage = async (id: string): Promise<void> => {
  const { error } = await supabase.from('tour_packages').delete().eq('id', id);
  if (error) throw error;
};
