export default function BrandLogo({ compact = false, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="brand-mark flex h-12 w-12 items-center justify-center">
        <span className="brand-glyph text-xl">S</span>
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="font-display text-base font-bold tracking-tight text-text">SmartParkEase</div>
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-muted">
            {subtitle || 'Parking operations'}
          </div>
        </div>
      )}
      {compact && subtitle && (
        <div className="min-w-0">
          <div className="font-display text-base font-bold tracking-tight text-text">SmartParkEase</div>
          <div className="text-xs font-medium uppercase tracking-[0.24em] text-muted">{subtitle}</div>
        </div>
      )}
    </div>
  );
}