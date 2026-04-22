import { BadgeCheck, CircleDashed, SquareParking } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

function slotClass(status) {
  if (status === 'occupied') return 'border-red-400/30 bg-red-400/10 text-red-200';
  if (status === 'reserved') return 'border-amber-300/30 bg-amber-300/10 text-amber-100';
  return 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100';
}

export default function ParkingGrid() {
  const { slots, slotSummary, slotDetailMap, settings, loading, error } = useWorkspace();
  const [selectedSlotId, setSelectedSlotId] = useState('');

  if (loading) {
    return <div className="page-shell space-y-6 pb-10"><div className="control-card">Loading grid...</div></div>;
  }

  const slotGrid = slots;
  const selectedSlot = useMemo(() => {
    if (!selectedSlotId) return null;
    return slotDetailMap.get(selectedSlotId) || null;
  }, [selectedSlotId, slotDetailMap]);

  const formatCurrency = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: settings?.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(value || 0);

  return (
    <div className="page-shell space-y-6 pb-10">
      <section className="hero-panel">
        <span className="eyebrow">Parking grid</span>
        <h1 className="page-title mt-4">Live slot map</h1>
        <p className="page-subtitle">Use the grid to see which slots are free, occupied, or reserved before assigning a new vehicle.</p>

        <div className="mt-6 flex flex-wrap gap-3">
          {slotSummary.map((item) => (
            <div key={item.label} className="inner-panel flex items-center gap-3 px-4 py-3">
              <span className={`font-display text-xl font-bold ${item.tone}`}>{item.value}</span>
              <span className="text-sm text-muted">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="control-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="section-title">Slot status</div>
          <div className="flex flex-wrap gap-3 text-sm text-muted">
            <span className="inline-flex items-center gap-2"><CircleDashed size={14} className="text-emerald-300" /> Available</span>
            <span className="inline-flex items-center gap-2"><SquareParking size={14} className="text-amber-300" /> Reserved</span>
            <span className="inline-flex items-center gap-2"><BadgeCheck size={14} className="text-red-300" /> Occupied</span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {slotGrid.map((slot) => (
            <button
              key={slot.id}
              type="button"
              onClick={() => setSelectedSlotId(slot.id)}
              className={`slot-shift rounded-[22px] border p-4 text-left ${slotClass(slot.status)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-display text-xl font-bold">{slot.id}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] opacity-75">Zone {slot.zone}</div>
                </div>
                <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em]">{slot.status}</div>
              </div>
            </button>
          ))}
        </div>
        {error ? <div className="mt-4 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
      </section>

      {selectedSlot ? (
        <section className="control-card">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="section-title">Slot details: {selectedSlot.slot.id}</div>
              <p className="page-subtitle mt-2">Zone {selectedSlot.slot.zone} • Current state {selectedSlot.slot.status}</p>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setSelectedSlotId('')}>Close</button>
          </div>

          {selectedSlot.vehicle ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="inner-panel p-4">
                <div className="text-sm text-muted">Active vehicle</div>
                <div className="mt-1 font-semibold text-text">{selectedSlot.vehicle.plateNumber}</div>
                <div className="mt-2 text-sm text-muted">Type: {selectedSlot.vehicle.vehicleType}</div>
                <div className="text-sm text-muted">Entry source: {(selectedSlot.vehicle.entrySource || 'manual').toUpperCase()}</div>
              </div>
              <div className="inner-panel p-4">
                <div className="text-sm text-muted">Current session</div>
                <div className="mt-1 text-sm text-muted">Duration: {Math.floor(selectedSlot.elapsedMinutes / 60)}h {selectedSlot.elapsedMinutes % 60}m</div>
                <div className="mt-2 font-semibold text-text">Estimated due: {formatCurrency(selectedSlot.amountDue)}</div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[20px] border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100">
              No active vehicle assigned to this slot.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}