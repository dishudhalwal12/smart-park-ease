import { CheckCircle2, CreditCard, TimerReset } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Billing() {
  const { activeVehicles, loading, error, settleVehicle, saveBillDraft, updateVehiclePayment, settings } = useWorkspace();
  const [selectedVehicleId, setSelectedVehicleId] = useState(activeVehicles[0]?.id || '');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentReference, setPaymentReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const selectedVehicle = activeVehicles.find((vehicle) => vehicle.id === selectedVehicleId) || activeVehicles[0] || null;

  useEffect(() => {
    if (!selectedVehicleId && activeVehicles[0]?.id) {
      setSelectedVehicleId(activeVehicles[0].id);
    }
  }, [activeVehicles, selectedVehicleId]);

  useEffect(() => {
    setPaymentMethod(selectedVehicle?.paymentMethod || 'cash');
    setPaymentReference(selectedVehicle?.paymentReference || '');
  }, [selectedVehicle?.id]);

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: settings.currency || 'USD', maximumFractionDigits: 0 }).format(amount || 0);

  const handleSettle = async () => {
    if (!selectedVehicle) return;

    setSubmitting(true);
    setMessage('');

    try {
      await updateVehiclePayment(selectedVehicle.id, { method: paymentMethod, reference: paymentReference });
      await settleVehicle(selectedVehicle.id);
      setMessage(`Processed ${selectedVehicle.plate} and released ${selectedVehicle.slot} via ${paymentMethod.toUpperCase()}.`);
    } catch (settleError) {
      setMessage(settleError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedVehicle) return;

    setSubmitting(true);
    setMessage('');

    try {
      await saveBillDraft(selectedVehicle.id);
      setMessage(`Draft bill saved for ${selectedVehicle.plate}.`);
    } catch (draftError) {
      setMessage(draftError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-shell space-y-6 pb-10"><div className="control-card">Loading billing...</div></div>;
  }

  if (!activeVehicles.length) {
    return (
      <div className="page-shell space-y-6 pb-10">
        <section className="hero-panel">
          <span className="eyebrow">Billing and exit</span>
          <h1 className="page-title mt-4">Process departures</h1>
          <p className="page-subtitle">There are no active vehicles to bill right now.</p>
        </section>
        <div className="control-card">
          <div className="section-title">No active vehicles</div>
          <p className="page-subtitle">Once a vehicle is entered, it will appear here for billing and release.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell space-y-6 pb-10">
      <section className="hero-panel">
        <span className="eyebrow">Billing and exit</span>
        <h1 className="page-title mt-4">Process departures</h1>
        <p className="page-subtitle">Select an active vehicle, review duration and total, then release the slot once payment is recorded.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="control-card">
          <div className="section-title">Active vehicles</div>
          <div className="mt-5 overflow-hidden rounded-[24px] border border-border">
            {activeVehicles.map((vehicle) => (
              <button key={vehicle.id} type="button" onClick={() => setSelectedVehicleId(vehicle.id)} className={`grid w-full gap-3 border-t border-border px-5 py-4 text-left first:border-t-0 md:grid-cols-[1.6fr_0.7fr_0.7fr_0.6fr_0.6fr] md:items-center ${selectedVehicle?.id === vehicle.id ? 'bg-white/[0.04]' : ''}`}>
                <div className="font-semibold text-text">{vehicle.plate}</div>
                <div className="text-sm text-muted">Slot {vehicle.slot}</div>
                <div className="text-sm text-muted">{vehicle.type}</div>
                <div className="inline-flex items-center gap-2 text-sm text-muted"><TimerReset size={14} /> {vehicle.duration}</div>
                <div className="text-sm font-semibold text-text">{vehicle.amount}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="control-card">
          <div className="section-title">Exit summary</div>
          <div className="mt-5 space-y-4">
            <div className="inner-panel px-4 py-4">
              <div className="text-sm text-muted">Vehicle</div>
              <div className="mt-1 font-semibold text-text">{selectedVehicle?.plate || 'No active vehicles'}</div>
            </div>
            <div className="inner-panel px-4 py-4">
              <div className="text-sm text-muted">Calculated total</div>
              <div className="mt-1 font-display text-3xl font-bold text-text">{formatCurrency(selectedVehicle?.amountRaw || 0)}</div>
            </div>
            <label className="block">
              <span className="field-label">Payment method</span>
              <select className="control-input" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="wallet">Wallet</option>
              </select>
            </label>
            <label className="block">
              <span className="field-label">Reference (optional)</span>
              <input
                className="control-input"
                placeholder="Txn ID / last 4 digits"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
              />
            </label>
            <button className="btn-primary w-full" disabled={!selectedVehicle || submitting} onClick={handleSettle}><CheckCircle2 size={16} className="mr-2" /> {submitting ? 'Processing...' : 'Mark paid and release slot'}</button>
            <button className="btn-secondary w-full" disabled={!selectedVehicle || submitting} onClick={handleSaveDraft}><CreditCard size={16} className="mr-2" /> Save bill only</button>
            {message ? <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted">{message}</div> : null}
            {error ? <div className="rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
          </div>
        </div>
      </section>
    </div>
  );
}