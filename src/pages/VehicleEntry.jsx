import { useEffect, useMemo, useState } from 'react';
import { ScanLine, CarFront, ArrowRight, Upload, Sparkles } from 'lucide-react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { checkAnprHealth, recognizePlate } from '../lib/anprClient';

function normalizePlate(value) {
  return (value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

export default function VehicleEntry() {
  const { slots, createVehicleEntry, loading, error, logAnprAccepted } = useWorkspace();
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [slotId, setSlotId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [anprFile, setAnprFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [anprMessage, setAnprMessage] = useState('');
  const [processingMs, setProcessingMs] = useState(0);
  const [anprAvailable, setAnprAvailable] = useState(true);
  const [entrySource, setEntrySource] = useState('manual');

  const freeSlots = useMemo(() => slots.filter((slot) => slot.status === 'available'), [slots]);
  const canAutoAssign = freeSlots.length > 0;

  useEffect(() => {
    let active = true;

    checkAnprHealth()
      .then((result) => {
        if (!active) return;
        setAnprAvailable(Boolean(result?.ready));
        if (!result?.ready) {
          setAnprMessage(result?.message || 'ANPR sidecar is unavailable. Use manual entry.');
        }
      })
      .catch(() => {
        if (!active) return;
        setAnprAvailable(false);
        setAnprMessage('ANPR sidecar is not running. Start the local API service to enable scanning.');
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  }, [previewUrl]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] || null;
    setAnprFile(selected);
    setCandidates([]);
    setAnprMessage('');
    setProcessingMs(0);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (!selected) {
      setPreviewUrl('');
      return;
    }

    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleScan = async () => {
    if (!anprFile) {
      setAnprMessage('Choose an image before scanning.');
      return;
    }

    setScanning(true);
    setAnprMessage('');

    try {
      const response = await recognizePlate(anprFile);
      const nextCandidates = Array.isArray(response?.candidates) ? response.candidates : [];
      setCandidates(nextCandidates);
      setProcessingMs(response?.processingMs || 0);

      if (!nextCandidates.length) {
        setAnprMessage(response?.error || 'No readable plate found. Try a clearer image.');
      }
    } catch (scanError) {
      setAnprMessage(scanError.message || 'ANPR scan failed.');
    } finally {
      setScanning(false);
    }
  };

  const applyCandidate = async (candidate) => {
    const normalized = normalizePlate(candidate?.plate || '');
    if (!normalized) {
      return;
    }

    setPlateNumber(normalized);
    setEntrySource('anpr');
    setMessage(`ANPR candidate ${normalized} applied to form.`);

    try {
      await logAnprAccepted({
        plateNumber: normalized,
        confidence: candidate.confidence || 0,
        processingMs,
      });
    } catch {
      // Entry flow should continue even if activity logging fails.
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!plateNumber.trim()) {
      setMessage('Vehicle number is required.');
      return;
    }

    if (!slotId && !canAutoAssign) {
      setMessage('No free slots are available right now.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      await createVehicleEntry({
        plateNumber,
        vehicleType,
        slotId: slotId || null,
        entrySource,
      });

      setPlateNumber('');
      setVehicleType('Car');
      setSlotId('');
      setEntrySource('manual');
      setCandidates([]);
      setAnprFile(null);
      setProcessingMs(0);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl('');
      }
      setMessage('Vehicle entry saved successfully.');
    } catch (submitError) {
      setMessage(submitError.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="page-shell space-y-6 pb-10"><div className="control-card">Loading entry form...</div></div>;
  }

  return (
    <div className="page-shell space-y-6 pb-10">
      <section className="hero-panel">
        <span className="eyebrow">Vehicle entry</span>
        <h1 className="page-title mt-4">Register incoming vehicles</h1>
        <p className="page-subtitle">Capture the plate, pick the vehicle type, optionally use the ANPR assist, and assign a slot.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <form className="control-card" onSubmit={handleSubmit}>
          <div className="section-title">Entry form</div>
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="field-label">Vehicle number</span>
              <input className="control-input" placeholder="MH 12 AB 2431" value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} required />
            </label>
            <label className="block">
              <span className="field-label">Vehicle type</span>
              <select className="control-input" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
                <option>Car</option>
                <option>SUV</option>
                <option>Bike</option>
                <option>Van</option>
              </select>
            </label>
            <label className="block">
              <span className="field-label">Slot</span>
              <select className="control-input" value={slotId} onChange={(event) => setSlotId(event.target.value)}>
                <option value="">Auto-assign</option>
                {freeSlots.map((slot) => (
                  <option key={slot.id} value={slot.id}>{slot.id} - {slot.zone}</option>
                ))}
              </select>
            </label>
            <button className="btn-primary md:col-span-2" disabled={submitting || (!slotId && !canAutoAssign)}>{submitting ? 'Saving...' : 'Create entry'} <ArrowRight size={16} className="ml-2" /></button>
          </div>
          {message ? <div className="mt-4 rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-muted">{message}</div> : null}
          {error ? <div className="mt-4 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
          {!canAutoAssign ? <div className="mt-4 rounded-[20px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">All slots are occupied. Free a slot before creating a new entry.</div> : null}
        </form>

        <div className="control-card">
          <div className="section-title">ANPR assist</div>
          <p className="page-subtitle">Upload or capture a plate image to suggest a number, or continue manually if the scan is unavailable.</p>
          <div className="mt-5 inner-panel space-y-4 p-5">
            <label className="block rounded-2xl border border-dashed border-border bg-white/[0.02] p-4">
              <span className="field-label mb-2 inline-flex items-center gap-2"><Upload size={14} /> Upload plate image</span>
              <input className="control-input" type="file" accept="image/*" onChange={handleFileChange} />
            </label>

            {previewUrl ? (
              <img src={previewUrl} alt="Plate preview" className="max-h-52 w-full rounded-2xl border border-border object-contain" />
            ) : (
              <div className="flex min-h-44 items-center justify-center rounded-2xl border border-border bg-white/[0.02] text-muted">
                No image selected
              </div>
            )}

            <button type="button" className="btn-secondary w-full" onClick={handleScan} disabled={scanning || !anprFile || !anprAvailable}>
              {scanning ? 'Scanning plate...' : 'Scan with ANPR'}
              <ScanLine size={16} className="ml-2" />
            </button>

            {candidates.length ? (
              <div className="space-y-2">
                <div className="field-label inline-flex items-center gap-2"><Sparkles size={14} /> Candidates</div>
                {candidates.map((candidate) => (
                  <button
                    key={`${candidate.plate}-${candidate.confidence}`}
                    type="button"
                    onClick={() => applyCandidate(candidate)}
                    className="flex w-full items-center justify-between rounded-xl border border-border bg-white/[0.02] px-3 py-2 text-left text-sm hover:bg-white/[0.06]"
                  >
                    <span className="font-semibold tracking-wide text-text">{candidate.plate}</span>
                    <span className="text-muted">{Math.round((candidate.confidence || 0) * 100)}%</span>
                  </button>
                ))}
              </div>
            ) : null}

            {anprMessage ? <div className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-muted">{anprMessage}</div> : null}
            {processingMs > 0 ? <div className="text-xs text-muted">Processing time: {processingMs} ms</div> : null}
          </div>
          <div className="mt-4 flex items-center gap-3 text-sm text-muted">
            <CarFront size={16} className="text-accent" />
            {anprAvailable ? 'Manual input remains available as fallback.' : 'ANPR offline: manual input is active.'}
          </div>
          {!anprAvailable ? (
            <div className="mt-3 rounded-[20px] border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
              Start the ANPR service under services/alpr-api to enable scan.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}