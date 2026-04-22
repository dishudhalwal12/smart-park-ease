export const dashboardStats = [
  { label: 'Total slots', value: '128', detail: '12 zones across the lot' },
  { label: 'Occupied', value: '84', detail: '65.6% utilization' },
  { label: 'Available', value: '44', detail: 'Ready for allocation' },
  { label: 'Today\'s revenue', value: '$4,860', detail: '+8.4% vs yesterday' },
];

export const slotSummary = [
  { label: 'Available', value: 44, tone: 'text-emerald-400' },
  { label: 'Reserved', value: 9, tone: 'text-amber-300' },
  { label: 'Occupied', value: 84, tone: 'text-red-400' },
];

export const activeVehicles = [
  { plate: 'MH 12 AB 2431', slot: 'B-04', type: 'Car', duration: '2h 18m', amount: '$6.00' },
  { plate: 'KA 05 MK 9911', slot: 'C-08', type: 'SUV', duration: '1h 42m', amount: '$5.50' },
  { plate: 'DL 01 RT 8844', slot: 'A-11', type: 'Bike', duration: '35m', amount: '$1.25' },
];

export const recentActivity = [
  { label: 'Vehicle entry recorded', detail: 'MH 12 AB 2431 assigned to B-04' },
  { label: 'Slot released', detail: 'B-01 became available after exit billing' },
  { label: 'ANPR scan matched', detail: 'Plate recognition suggested KA 05 MK 9911' },
];

export const weeklyRevenue = [
  { name: 'Mon', value: 720 },
  { name: 'Tue', value: 640 },
  { name: 'Wed', value: 860 },
  { name: 'Thu', value: 920 },
  { name: 'Fri', value: 1180 },
  { name: 'Sat', value: 1320 },
  { name: 'Sun', value: 980 },
];

export const slotGrid = Array.from({ length: 24 }, (_, index) => {
  const occupiedIndexes = new Set([0, 1, 2, 4, 7, 8, 10, 11, 14, 15, 18, 20, 21, 22]);
  const reservedIndexes = new Set([5, 12, 17]);
  let status = 'available';

  if (occupiedIndexes.has(index)) {
    status = 'occupied';
  } else if (reservedIndexes.has(index)) {
    status = 'reserved';
  }

  return {
    id: `S-${String(index + 1).padStart(2, '0')}`,
    status,
    zone: index < 8 ? 'North' : index < 16 ? 'Central' : 'South',
  };
});

export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}