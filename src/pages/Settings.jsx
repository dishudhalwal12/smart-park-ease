import { BellRing, Building2, Clock3, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Settings() {
  const { settings, saveSettings, loading, error } = useWorkspace();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleSave = async (event) => {
    event.preventDefault();

    const totalSlots = Number(form.totalSlots);
    const hourlyRate = Number(form.hourlyRate);
    const gracePeriodMinutes = Number(form.gracePeriodMinutes);

    if (!form.lotName.trim()) {
      setMessage('Lot name is required.');
      return;
    }

    if (!Number.isInteger(totalSlots) || totalSlots <= 0) {
      setMessage('Total slots must be a positive whole number.');
      return;
    }

    if (!Number.isFinite(hourlyRate) || hourlyRate <= 0) {
      setMessage('Hourly rate must be a positive number.');
      return;
    }

    if (!Number.isInteger(gracePeriodMinutes) || gracePeriodMinutes < 0) {
      setMessage('Grace period must be zero or a positive whole number.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      await saveSettings(form);
      setMessage('Settings saved successfully.');
    } catch (saveError) {
      setMessage(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <div className="page-shell space-y-6 pb-10"><div className="control-card">Loading settings...</div></div>;
  }

  return (
    <div className="page-shell space-y-6 pb-10">
      <section className="hero-panel">
        <span className="eyebrow">Settings</span>
        <h1 className="page-title mt-4">Lot configuration</h1>
        <p className="page-subtitle">Adjust parking defaults, rates, and display preferences for the current site.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <form className="control-card space-y-5" onSubmit={handleSave}>
          <div className="section-title">Parking lot details</div>
          <label className="block"><span className="field-label">Lot name</span><input className="control-input" value={form.lotName} onChange={(event) => setForm((current) => ({ ...current, lotName: event.target.value }))} /></label>
          <label className="block"><span className="field-label">Total slots</span><input className="control-input" type="number" min="1" step="1" value={form.totalSlots} onChange={(event) => setForm((current) => ({ ...current, totalSlots: event.target.value }))} /></label>
          <label className="block"><span className="field-label">Hourly rate</span><input className="control-input" type="number" min="0.01" step="0.01" value={form.hourlyRate} onChange={(event) => setForm((current) => ({ ...current, hourlyRate: event.target.value }))} /></label>
          <label className="block"><span className="field-label">Grace period minutes</span><input className="control-input" type="number" min="0" step="1" value={form.gracePeriodMinutes} onChange={(event) => setForm((current) => ({ ...current, gracePeriodMinutes: event.target.value }))} /></label>
          <button className="btn-primary w-full" disabled={saving}>{saving ? 'Saving...' : 'Save settings'}</button>
          {message ? <div className="rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted">{message}</div> : null}
          {error ? <div className="rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </form>

        <div className="control-card space-y-4">
          <div className="section-title">Preferences</div>
          {[
            { icon: Building2, title: 'Operational mode', detail: 'Single-lot live configuration' },
            { icon: Clock3, title: 'Grace period', detail: `${form.gracePeriodMinutes} minutes before billing starts` },
            { icon: DollarSign, title: 'Billing cadence', detail: `Hourly rate ${form.currency} ${form.hourlyRate}` },
            { icon: BellRing, title: 'Notifications', detail: 'Slot status reminders enabled' },
          ].map(({ icon: Icon, title, detail }) => (
            <div key={title} className="inner-panel flex items-start gap-4 px-4 py-4">
              <div className="state-icon"><Icon size={18} /></div>
              <div>
                <div className="font-semibold text-text">{title}</div>
                <div className="mt-1 text-sm text-muted">{detail}</div>
              </div>
            </div>
          ))}
          {error ? <div className="rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </div>
      </section>
    </div>
  );
}