import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { firebaseDb, hasFirebaseConfig } from '../lib/firebase';
import {
  bootstrapWorkspace,
  createVehicleEntry,
  DEFAULT_SETTINGS,
  logAnprAccepted,
  saveBillDraft,
  saveSettings,
  settleVehicle,
  subscribeWorkspace,
  updateVehiclePayment,
} from '../lib/parkingWorkspace';
import { useAuth } from './AuthContext';

const WorkspaceContext = createContext(null);

function normalizeDate(value) {
  if (!value) return null;
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
}

function formatAmount(rate, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(rate || 0);
}

function translateWorkspaceError(message) {
  if (!message) return '';

  const normalized = message.toLowerCase();
  if (normalized.includes('missing or insufficient permissions') || normalized.includes('permission')) {
    return 'Database permission denied. Sign in again and verify Firestore rules are deployed for this project.';
  }

  if (normalized.includes('network') || normalized.includes('unavailable')) {
    return 'Database connection is unavailable. Check your network and try again.';
  }

  return message;
}

function buildDashboardStats(settings, slots, vehicles, activity) {
  const totalSlots = settings?.totalSlots ?? slots.length;
  const occupied = slots.filter((slot) => slot.status === 'occupied').length;
  const available = Math.max(0, totalSlots - occupied);
  const today = new Date();
  const todayKey = today.toDateString();

  const todaysRevenue = vehicles
    .filter((vehicle) => vehicle.status === 'closed' && normalizeDate(vehicle.paidAt)?.toDateString() === todayKey)
    .reduce((sum, vehicle) => sum + Number(vehicle.amountPaid || vehicle.amountDue || 0), 0);

  return [
    { label: 'Total slots', value: String(totalSlots), detail: `${settings?.lotName || DEFAULT_SETTINGS.lotName}` },
    { label: 'Occupied', value: String(occupied), detail: `${Math.round((occupied / Math.max(totalSlots, 1)) * 100)}% utilization` },
    { label: 'Available', value: String(available), detail: 'Ready for allocation' },
    { label: "Today's revenue", value: formatAmount(todaysRevenue, settings?.currency || 'USD'), detail: `${activity.length} recent events` },
  ];
}

function buildSlotSummary(slots) {
  const available = slots.filter((slot) => slot.status === 'available').length;
  const reserved = slots.filter((slot) => slot.status === 'reserved').length;
  const occupied = slots.filter((slot) => slot.status === 'occupied').length;

  return [
    { label: 'Available', value: available, tone: 'text-emerald-400' },
    { label: 'Reserved', value: reserved, tone: 'text-amber-300' },
    { label: 'Occupied', value: occupied, tone: 'text-red-400' },
  ];
}

function buildActiveVehicles(vehicles, settings) {
  return vehicles
    .filter((vehicle) => vehicle.status === 'active')
    .slice(0, 6)
    .map((vehicle) => {
      const entryDate = normalizeDate(vehicle.entryAt);
      const elapsedMinutes = entryDate ? Math.max(0, Math.round((Date.now() - entryDate.getTime()) / 60000)) : 0;
      const amountDue = Number(vehicle.amountDue || 0) || Math.ceil(Math.max(0, elapsedMinutes - (settings?.gracePeriodMinutes || DEFAULT_SETTINGS.gracePeriodMinutes)) / 60) * (settings?.hourlyRate || DEFAULT_SETTINGS.hourlyRate);

      return {
        id: vehicle.id,
        plate: vehicle.plateNumber,
        slot: vehicle.slotId,
        type: vehicle.vehicleType,
        paymentMethod: vehicle.paymentMethod || 'cash',
        paymentReference: vehicle.paymentReference || '',
        duration: `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`,
        amount: formatAmount(amountDue, settings?.currency || 'USD'),
        amountRaw: amountDue,
      };
    });
}

function buildRecentActivity(activity) {
  return activity.slice(0, 6).map((item) => ({
    id: item.id,
    label: item.label,
    detail: item.detail,
    type: item.type,
    createdAt: normalizeDate(item.createdAt),
  }));
}

function buildWeeklyRevenue(vehicles, settings) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = labels.map((name) => ({ name, value: 0 }));

  vehicles
    .filter((vehicle) => vehicle.status === 'closed' && vehicle.paidAt)
    .forEach((vehicle) => {
      const paidDate = normalizeDate(vehicle.paidAt);
      if (!paidDate) return;
      const dayIndex = paidDate.getDay();
      buckets[dayIndex].value += Number(vehicle.amountPaid || vehicle.amountDue || 0);
    });

  return buckets;
}

function buildOccupancyTrend(vehicles) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const buckets = labels.map((name) => ({ name, entries: 0, exits: 0 }));

  vehicles.forEach((vehicle) => {
    const entryDate = normalizeDate(vehicle.entryAt);
    if (entryDate) {
      buckets[entryDate.getDay()].entries += 1;
    }

    const exitDate = normalizeDate(vehicle.exitAt);
    if (exitDate) {
      buckets[exitDate.getDay()].exits += 1;
    }
  });

  return buckets;
}

function buildOccupancyByZone(slots) {
  const zoneMap = new Map();

  slots.forEach((slot) => {
    const zone = slot.zone || 'Unknown';
    const current = zoneMap.get(zone) || { zone, total: 0, occupied: 0, available: 0 };
    current.total += 1;
    if (slot.status === 'occupied') {
      current.occupied += 1;
    } else {
      current.available += 1;
    }
    zoneMap.set(zone, current);
  });

  return Array.from(zoneMap.values()).sort((left, right) => left.zone.localeCompare(right.zone));
}

function buildVehicleTable(vehicles) {
  return vehicles
    .filter((vehicle) => vehicle.status === 'active')
    .slice(0, 8)
    .map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plateNumber,
      slot: vehicle.slotId,
      type: vehicle.vehicleType,
      duration: vehicle.entryAt ? `${Math.max(0, Math.round((Date.now() - normalizeDate(vehicle.entryAt).getTime()) / 60000))}m` : '0m',
      amountDue: vehicle.amountDue || 0,
      entryAt: normalizeDate(vehicle.entryAt),
    }));
}

function buildSlotDetailMap(slots, vehicles, settings) {
  const activeVehicles = vehicles.filter((vehicle) => vehicle.status === 'active');
  const map = new Map();

  slots.forEach((slot) => {
    const assignedVehicle = activeVehicles.find((vehicle) => vehicle.slotId === slot.id) || null;
    const entryDate = assignedVehicle ? normalizeDate(assignedVehicle.entryAt) : null;
    const elapsedMinutes = entryDate ? Math.max(0, Math.round((Date.now() - entryDate.getTime()) / 60000)) : 0;
    const amountDue = assignedVehicle
      ? Math.ceil(Math.max(0, elapsedMinutes - (settings?.gracePeriodMinutes || DEFAULT_SETTINGS.gracePeriodMinutes)) / 60) * (settings?.hourlyRate || DEFAULT_SETTINGS.hourlyRate)
      : 0;

    map.set(slot.id, {
      slot,
      vehicle: assignedVehicle,
      elapsedMinutes,
      amountDue,
    });
  });

  return map;
}

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [slots, setSlots] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    let active = true;
    let unsubscribe = () => {};

    if (!firebaseDb || !user) {
      bootstrappedRef.current = false;
      setSettings(null);
      setSlots([]);
      setVehicles([]);
      setActivity([]);
      setLoading(false);
      setError('');
      return undefined;
    }

    setLoading(true);
    setError('');

    (async () => {
      try {
        if (!bootstrappedRef.current) {
          await bootstrapWorkspace(firebaseDb, user);
          bootstrappedRef.current = true;
        }

        if (!active) {
          return;
        }

        unsubscribe = subscribeWorkspace(firebaseDb, {
          onSettings: (nextSettings) => {
            if (active) setSettings(nextSettings);
          },
          onSlots: (nextSlots) => {
            if (active) setSlots(nextSlots);
          },
          onVehicles: (nextVehicles) => {
            if (active) setVehicles(nextVehicles);
          },
          onActivity: (nextActivity) => {
            if (active) setActivity(nextActivity);
          },
        });

        if (active) {
          setLoading(false);
        }
      } catch (workspaceError) {
        if (active) {
          bootstrappedRef.current = false;
          setError(translateWorkspaceError(workspaceError.message));
          setLoading(false);
        }
      }
    })();

    return () => {
      active = false;
      unsubscribe();
    };
  }, [user]);

  const value = useMemo(() => {
    const currentSettings = settings || DEFAULT_SETTINGS;
    const currentSlots = slots.length ? slots : [];
    const currentVehicles = vehicles.length ? vehicles : [];
    const currentActivity = activity.length ? activity : [];

    return {
      settings: currentSettings,
      slots: currentSlots,
      vehicles: currentVehicles,
      activity: currentActivity,
      dashboardStats: buildDashboardStats(currentSettings, currentSlots, currentVehicles, currentActivity),
      slotSummary: buildSlotSummary(currentSlots),
      activeVehicles: buildActiveVehicles(currentVehicles, currentSettings),
      recentActivity: buildRecentActivity(currentActivity),
      weeklyRevenue: buildWeeklyRevenue(currentVehicles, currentSettings),
      occupancyTrend: buildOccupancyTrend(currentVehicles),
      occupancyByZone: buildOccupancyByZone(currentSlots),
      vehicleTable: buildVehicleTable(currentVehicles),
      slotDetailMap: buildSlotDetailMap(currentSlots, currentVehicles, currentSettings),
      loading,
      error,
      createVehicleEntry: (input) => createVehicleEntry(firebaseDb, user, input),
      settleVehicle: (vehicleId) => settleVehicle(firebaseDb, user, vehicleId),
      saveBillDraft: (vehicleId) => saveBillDraft(firebaseDb, user, vehicleId),
      updateVehiclePayment: (vehicleId, payment) => updateVehiclePayment(firebaseDb, user, vehicleId, payment),
      logAnprAccepted: (payload) => logAnprAccepted(firebaseDb, user, payload),
      saveSettings: (input) => saveSettings(firebaseDb, user, input),
      hasWorkspaceData: hasFirebaseConfig && Boolean(user),
    };
  }, [settings, slots, vehicles, activity, loading, error, user]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider.');
  }

  return context;
}
