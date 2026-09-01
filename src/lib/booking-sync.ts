import { supabase } from '@/lib/supabase';

export interface BookingSyncCustomer {
  name: string;
  phone: string;
  email?: string | null;
}

export interface VehicleBookingSyncData {
  reference: string;
  customerName: string;
  phone: string;
  email?: string | null;
  vehicleName: string;
  pickup: string;
  destination: string;
  pickupDate?: string | null;
  pickupTime?: string | null;
  returnDate?: string | null;
  passengers?: number;
  tripType?: string;
  totalAmount?: number;
  advanceAmount?: number;
  notes?: string;
}

export interface PackageBookingSyncData {
  bookingNumber: string;
  packageTitle: string;
  customerName: string;
  phone: string;
  email?: string | null;
  city?: string;
  travelDate?: string | null;
  adults?: number;
  children?: number;
  totalAmount?: number;
  advanceAmount?: number;
  pickupLocation?: string;
  hotelCategory?: string;
  vehicleCategory?: string;
  paymentMode?: string;
  notes?: string;
}

export interface HotelBookingSyncData {
  bookingNumber: string;
  hotelName: string;
  hotelCity: string;
  roomName?: string;
  customerName: string;
  phone: string;
  email?: string | null;
  checkIn?: string | null;
  checkOut?: string | null;
  rooms?: number;
  adults?: number;
  children?: number;
  totalAmount?: number;
  advanceAmount?: number;
  notes?: string;
}

export interface EnquirySyncData {
  name: string;
  phone: string;
  email?: string | null;
  serviceType: string;
  travelDate?: string | null;
  message?: string;
  reference?: string;
}

/**
 * Upserts a customer by phone number and returns the customer ID.
 */
async function getOrCreateCustomerId(cust: BookingSyncCustomer): Promise<string | null> {
  if (!cust.name && !cust.phone) return null;
  try {
    const cleanPhone = cust.phone ? cust.phone.trim() : '';
    if (!cleanPhone) return null;

    // Check if customer already exists by phone
    const { data: existing } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', cleanPhone)
      .maybeSingle();

    if (existing?.id) {
      if (cust.name || cust.email) {
        await supabase
          .from('customers')
          .update({
            name: cust.name || undefined,
            email: cust.email || undefined,
          })
          .eq('id', existing.id);
      }
      return existing.id;
    }

    // Insert new customer
    const { data: created, error } = await supabase
      .from('customers')
      .insert({
        name: cust.name || 'Valued Guest',
        phone: cleanPhone,
        email: cust.email || null,
      })
      .select('id')
      .maybeSingle();

    if (error) {
      console.warn('Customer insert warning:', error.message);
      return null;
    }
    return created?.id || null;
  } catch (e) {
    console.warn('Customer upsert error:', e);
    return null;
  }
}

/**
 * Safely saves any vehicle/cab booking directly to Supabase `bookings` table.
 */
export async function syncVehicleBookingToSupabase(data: VehicleBookingSyncData) {
  try {
    const customerId = await getOrCreateCustomerId({
      name: data.customerName,
      phone: data.phone,
      email: data.email,
    });

    const total = data.totalAmount || 3500;
    const adv = data.advanceAmount || Math.round(total * 0.15);
    const bal = total - adv;

    const formattedPickupDate = data.pickupDate ? data.pickupDate.slice(0, 10) : null;
    const formattedReturnDate = data.returnDate ? data.returnDate.slice(0, 10) : null;

    const payload = {
      booking_number: data.reference,
      customer_id: customerId,
      booking_type: data.tripType || 'Outstation Trip',
      pickup_location: data.pickup || 'Bengaluru',
      drop_location: data.destination || 'Destination',
      pickup_date: formattedPickupDate,
      return_date: formattedReturnDate,
      passengers: data.passengers || 4,
      total_amount: total,
      advance_amount: adv,
      balance_amount: bal,
      status: 'Confirmed',
      notes: `Vehicle: ${data.vehicleName}\nCustomer: ${data.customerName} (${data.phone})\n${data.pickupTime ? `Pickup Time: ${data.pickupTime}\n` : ''}${data.notes || ''}`.trim(),
    };

    const { error } = await supabase.from('bookings').upsert(payload, { onConflict: 'booking_number' });
    if (error) {
      console.error('Error syncing vehicle booking to Supabase:', error.message);
    } else {
      console.log(`✅ Synced Vehicle Booking ${data.reference} to Supabase!`);
    }
  } catch (err) {
    console.error('Failed to sync vehicle booking:', err);
  }
}

/**
 * Safely saves any Tour Package booking directly to Supabase `bookings` table.
 */
export async function syncPackageBookingToSupabase(data: PackageBookingSyncData) {
  try {
    const customerId = await getOrCreateCustomerId({
      name: data.customerName,
      phone: data.phone,
      email: data.email,
    });

    const total = data.totalAmount || 12000;
    const adv = data.advanceAmount || Math.round(total * 0.25);
    const bal = total - adv;
    const formattedTravelDate = data.travelDate ? data.travelDate.slice(0, 10) : null;

    const payload = {
      booking_number: data.bookingNumber,
      customer_id: customerId,
      booking_type: 'Tour Package',
      pickup_location: data.pickupLocation || 'Pickup City',
      drop_location: data.packageTitle,
      pickup_date: formattedTravelDate,
      return_date: null,
      passengers: (data.adults || 2) + (data.children || 0),
      total_amount: total,
      advance_amount: adv,
      balance_amount: bal,
      status: 'Confirmed',
      notes: `Package: ${data.packageTitle}\nHotel: ${data.hotelCategory || 'Standard'}\nVehicle: ${data.vehicleCategory || 'Sedan'}\nPayment Preference: ${data.paymentMode || 'Advance'}\n${data.notes || ''}`.trim(),
    };

    const { error } = await supabase.from('bookings').upsert(payload, { onConflict: 'booking_number' });
    if (error) {
      console.error('Error syncing tour package booking to Supabase:', error.message);
    } else {
      console.log(`✅ Synced Tour Package Booking ${data.bookingNumber} to Supabase!`);
    }
  } catch (err) {
    console.error('Failed to sync tour package booking:', err);
  }
}

/**
 * Safely saves any Hotel booking directly to Supabase `bookings` table.
 */
export async function syncHotelBookingToSupabase(data: HotelBookingSyncData) {
  try {
    const customerId = await getOrCreateCustomerId({
      name: data.customerName,
      phone: data.phone,
      email: data.email,
    });

    const total = data.totalAmount || 5000;
    const adv = data.advanceAmount || Math.round(total * 0.3);
    const bal = total - adv;
    const checkIn = data.checkIn ? data.checkIn.slice(0, 10) : null;
    const checkOut = data.checkOut ? data.checkOut.slice(0, 10) : null;

    const payload = {
      booking_number: data.bookingNumber,
      customer_id: customerId,
      booking_type: 'Hotel Booking',
      pickup_location: `${data.hotelName}, ${data.hotelCity}`,
      drop_location: data.hotelCity,
      pickup_date: checkIn,
      return_date: checkOut,
      passengers: (data.adults || 2) + (data.children || 0),
      total_amount: total,
      advance_amount: adv,
      balance_amount: bal,
      status: 'Confirmed',
      notes: `Hotel: ${data.hotelName} (${data.hotelCity})\nRoom: ${data.roomName || 'Standard'}\nRooms: ${data.rooms || 1}\n${data.notes || ''}`.trim(),
    };

    const { error } = await supabase.from('bookings').upsert(payload, { onConflict: 'booking_number' });
    if (error) {
      console.error('Error syncing hotel booking to Supabase:', error.message);
    } else {
      console.log(`✅ Synced Hotel Booking ${data.bookingNumber} to Supabase!`);
    }
  } catch (err) {
    console.error('Failed to sync hotel booking:', err);
  }
}

/**
 * Safely saves any custom tour or contact inquiry to Supabase `enquiries` table.
 */
export async function syncEnquiryToSupabase(data: EnquirySyncData) {
  try {
    await getOrCreateCustomerId({
      name: data.name,
      phone: data.phone,
      email: data.email,
    });

    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      service_type: data.serviceType || 'Custom Enquiry',
      travel_date: data.travelDate || null,
      message: `${data.reference ? `Ref: ${data.reference} — ` : ''}${data.message || ''}`.trim(),
      status: 'New',
    };

    const { error } = await supabase.from('enquiries').insert(payload);
    if (error) {
      console.error('Error syncing enquiry to Supabase:', error.message);
    } else {
      console.log(`✅ Synced Enquiry for ${data.name} to Supabase!`);
    }
  } catch (err) {
    console.error('Failed to sync enquiry:', err);
  }
}
