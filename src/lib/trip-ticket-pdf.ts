/**
 * Professional Trip Ticket & PDF Voucher Generator for South Zoom Tourism.
 * Uses jsPDF for rich layout with embedded company logo.
 */

import jsPDF from 'jspdf';
import { company } from '@/content/site';

export type TripTicketData = {
  bookingNumber: string;
  bookingType?: string;
  status?: string;
  createdAt?: string;

  // Customer Details
  customerName: string;
  customerPhone: string;
  customerEmail?: string;

  // Trip Itinerary
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string;
  pickupTime?: string;
  returnDate?: string;
  passengers: number;
  tripType?: string;

  // Vehicle Details
  vehicleName?: string;
  vehicleModel?: string;
  vehicleNumber?: string;
  vehicleCategory?: string;

  // Driver Details
  driverName?: string;
  driverPhone?: string;
  driverLicense?: string;

  // Fare & Payment
  totalAmount: number;
  advanceAmount?: number;
  balanceAmount?: number;
  paymentStatus?: string;
  notes?: string;
};

const inr = (amount?: number) => {
  if (amount === undefined || amount === null) return 'Rs. 0';
  return `Rs. ${Number(amount).toLocaleString('en-IN')}`;
};

/** Loads an image URL into a base64 data URL via canvas */
async function loadImageAsDataUrl(src: string): Promise<string | null> {
  if (typeof document === 'undefined') return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/** Downloads a complete trip ticket PDF with logo */
export async function downloadTripTicketPdf(data: TripTicketData) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const PAGE_W = 210;
  const MARGIN = 14;
  const CONTENT_W = PAGE_W - MARGIN * 2;
  let y = MARGIN;

  const advance = data.advanceAmount || 0;
  const total = data.totalAmount || 0;
  const balance = data.balanceAmount !== undefined ? data.balanceAmount : Math.max(0, total - advance);
  const isDriverAssigned = Boolean(data.driverName && data.driverName !== 'Unassigned');

  // ─── LOGO ───────────────────────────────────────────────────────────────────
  const logoDataUrl = await loadImageAsDataUrl('/szt-logo.png');
  const LOGO_W = 38;
  const LOGO_H = 25;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', MARGIN, y, LOGO_W, LOGO_H);
  }

  // Company name beside logo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(20, 80, 160);
  doc.text('SOUTH ZOOM TOURISM', MARGIN + LOGO_W + 4, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(180, 80, 20);
  doc.text('Govt. Registered MSME Enterprise | URN: UDYAM-KR-03-0750906', MARGIN + LOGO_W + 4, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(80, 80, 80);
  doc.text('Premier Cab, Tour & Outstation Travel Services across South India', MARGIN + LOGO_W + 4, y + 16);
  doc.text(`Phone: ${company.phone}  |  Email: ${company.email}`, MARGIN + LOGO_W + 4, y + 21);

  y += LOGO_H + 4;

  // ─── Header rule ─────────────────────────────────────────────────────────────
  doc.setDrawColor(20, 80, 160);
  doc.setLineWidth(0.6);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  // ─── Document title ───────────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text('CONFIRMED TRIP TICKET & BOOKING VOUCHER', PAGE_W / 2, y, { align: 'center' });
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  const issuedOn = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  doc.text(`Booking ID: ${data.bookingNumber || 'SZT-TRIP'}    Status: ${data.status || 'Confirmed'}    Issued: ${issuedOn}`, PAGE_W / 2, y, { align: 'center' });
  y += 4;

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  // ─── Helper: section header ───────────────────────────────────────────────────
  const sectionHeader = (title: string) => {
    doc.setFillColor(235, 245, 255);
    doc.setDrawColor(20, 80, 160);
    doc.roundedRect(MARGIN, y, CONTENT_W, 7, 1, 1, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(20, 80, 160);
    doc.text(title, MARGIN + 3, y + 4.8);
    y += 12.5;
  };

  // ─── Helper: key-value row ────────────────────────────────────────────────────
  const row = (label: string, value: string, bold = false) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(label, MARGIN + 2, y);
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setTextColor(20, 20, 20);
    const maxValW = CONTENT_W - 57;
    const lines = doc.splitTextToSize(value || '—', maxValW);
    doc.text(lines, MARGIN + 55, y);
    y += Math.max(lines.length * 5, 5.5);
  };

  const thinLine = () => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.2);
    doc.line(MARGIN, y, PAGE_W - MARGIN, y);
    y += 4.5;
  };

  // ─── 1. PASSENGER DETAILS ────────────────────────────────────────────────────
  sectionHeader('1.  PASSENGER / CUSTOMER DETAILS');
  row('Passenger Name', data.customerName);
  row('Contact Number', data.customerPhone);
  if (data.customerEmail) row('Email Address', data.customerEmail);
  row('Total Passengers', `${data.passengers || 1} Person(s)`);
  thinLine();

  // ─── 2. TRIP ITINERARY ───────────────────────────────────────────────────────
  sectionHeader('2.  TRIP ITINERARY & SCHEDULE');
  row('Service / Trip Type', data.tripType || data.bookingType || 'Outstation Cab');
  row('Pickup Location', data.pickupLocation);
  row('Destination / Drop', data.dropLocation);
  row('Pickup Date & Time', `${data.pickupDate || 'As scheduled'}${data.pickupTime ? '  at ' + data.pickupTime : ''}`);
  if (data.returnDate) row('Return Date', data.returnDate);
  thinLine();

  // ─── 3. VEHICLE & DRIVER ─────────────────────────────────────────────────────
  sectionHeader('3.  ASSIGNED VEHICLE & DRIVER DETAILS');
  row('Vehicle Category', data.vehicleName || data.vehicleCategory || 'Sedan / SUV');
  if (data.vehicleNumber) row('Vehicle Reg. No.', data.vehicleNumber, true);
  if (isDriverAssigned) {
    row('Driver Name', data.driverName!, true);
    if (data.driverPhone) row('Driver Contact', data.driverPhone, true);
    if (data.driverLicense) row('Commercial License', data.driverLicense);
  } else {
    row('Driver Allocation', 'Driver details dispatched 2 hrs before pickup');
  }
  thinLine();

  // ─── 4. FARE SUMMARY ─────────────────────────────────────────────────────────
  sectionHeader('4.  FARE & PAYMENT SUMMARY');

  // Fare box
  const fareBoxY = y - 2.5;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(200, 215, 230);
  doc.roundedRect(MARGIN, fareBoxY, CONTENT_W, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const col2 = MARGIN + 62;
  const col3 = MARGIN + 120;

  doc.text('Total Estimated Fare', MARGIN + 4, fareBoxY + 7);
  doc.text('Advance Paid', col2, fareBoxY + 7);
  doc.text('Balance to Driver', col3, fareBoxY + 7);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(inr(total), MARGIN + 4, fareBoxY + 16);

  doc.setTextColor(34, 139, 34);
  doc.text(inr(advance), col2, fareBoxY + 16);

  doc.setTextColor(balance > 0 ? 180 : 34, balance > 0 ? 40 : 139, balance > 0 ? 40 : 34);
  doc.text(inr(balance), col3, fareBoxY + 16);

  y = fareBoxY + 26;

  if (data.notes) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    const noteLines = doc.splitTextToSize(`Note: ${data.notes}`, CONTENT_W);
    doc.text(noteLines, MARGIN + 2, y);
    y += noteLines.length * 4 + 2;
  }

  // ─── Divider ──────────────────────────────────────────────────────────────────
  doc.setDrawColor(20, 80, 160);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  // ─── 5. TRAVEL GUIDELINES ────────────────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(20, 20, 20);
  doc.text('IMPORTANT TRAVEL GUIDELINES', MARGIN, y);
  y += 5;

  const guidelines = [
    '1. Please carry a valid government photo ID matching the passenger name.',
    '2. AC will remain on throughout the journey, except when stationary or on steep ghat slopes.',
    '3. State permit, toll fees & parking charges settled as per actual receipts unless included.',
    '4. Driver allowance applicable for night drives (10:00 PM – 06:00 AM).',
    `5. 24x7 Helpline: ${company.phone}  |  Emergency assistance on all routes.`,
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  for (const g of guidelines) {
    const lines = doc.splitTextToSize(g, CONTENT_W);
    doc.text(lines, MARGIN + 2, y);
    y += lines.length * 4.5;
  }

  // ─── Footer ───────────────────────────────────────────────────────────────────
  y += 3;
  doc.setDrawColor(20, 80, 160);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  y += 5;

  doc.setFont('helvetica', 'bolditalic');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 80, 160);
  doc.text('Thank you for choosing South Zoom Tourism! Have a safe & pleasant journey.', PAGE_W / 2, y, { align: 'center' });
  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text('South Zoom Tourism · Govt. Registered MSME Enterprise | URN: UDYAM-KR-03-0750906', PAGE_W / 2, y, { align: 'center' });

  // ─── Save ─────────────────────────────────────────────────────────────────────
  const fileName = `${data.bookingNumber || 'SZT-TICKET'}-trip-voucher.pdf`;
  doc.save(fileName);
}

/**
 * Creates a formatted WhatsApp share message for the ticket with driver details.
 */
export function generateTicketWhatsAppShare(ticketData: TripTicketData): string {
  const isDriverAssigned = Boolean(ticketData.driverName && ticketData.driverName !== 'Unassigned');
  const advance = ticketData.advanceAmount || 0;
  const total = ticketData.totalAmount || 0;
  const balance = ticketData.balanceAmount !== undefined ? ticketData.balanceAmount : Math.max(0, total - advance);

  const parts = [
    `*SOUTH ZOOM TOURISM - TRIP CONFIRMATION TICKET*`,
    `_Govt. Registered MSME Enterprise | URN: UDYAM-KR-03-0750906_`,
    `----------------------------------------`,
    `*Booking ID:* ${ticketData.bookingNumber}`,
    `*Customer:* ${ticketData.customerName} (${ticketData.customerPhone})`,
    `*Trip Type:* ${ticketData.tripType || ticketData.bookingType || 'Outstation Cab'}`,
    `*Pickup:* ${ticketData.pickupLocation}`,
    `*Drop:* ${ticketData.dropLocation}`,
    `*Date & Time:* ${ticketData.pickupDate} ${ticketData.pickupTime || ''}`,
    ticketData.returnDate ? `*Return Date:* ${ticketData.returnDate}` : null,
    `*Vehicle:* ${ticketData.vehicleName || 'Standard Fleet'}${ticketData.vehicleNumber ? ` (${ticketData.vehicleNumber})` : ''}`,
    `----------------------------------------`,
    isDriverAssigned ? `*DRIVER DETAILS:*` : `*Driver:* To be dispatched 2 hrs before pickup`,
    isDriverAssigned ? `👤 *Name:* ${ticketData.driverName}` : null,
    isDriverAssigned && ticketData.driverPhone ? `📞 *Phone:* ${ticketData.driverPhone}` : null,
    `----------------------------------------`,
    `*Total Fare:* Rs. ${total.toLocaleString('en-IN')}`,
    `*Advance Paid:* Rs. ${advance.toLocaleString('en-IN')}`,
    `*Balance to Driver:* Rs. ${balance.toLocaleString('en-IN')}`,
    `----------------------------------------`,
    `*24x7 Helpline:* ${company.phone}`,
    `*Govt. Registered MSME Enterprise | URN: UDYAM-KR-03-0750906*`,
    `*Website:* https://southzoomtourism.com`,
  ].filter(Boolean);

  return parts.join('\n');
}
