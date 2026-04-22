import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Grid3X3, CarFront, ReceiptText, ChartColumn, Settings, LogOut, X } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/grid', label: 'Parking Grid', icon: Grid3X3 },
  { to: '/entry', label: 'Vehicle Entry', icon: CarFront },
  { to: '/billing', label: 'Billing', icon: ReceiptText },
  { to: '/analytics', label: 'Analytics', icon: ChartColumn },
  { to: '/settings', label: 'Settings', icon: Settings },
];

function navClass({ isActive }) {
  return [
    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition',
    isActive
      ? 'border-[rgba(239,95,76,0.28)] bg-[rgba(239,95,76,0.1)] text-text shadow-[0_12px_26px_rgba(0,0,0,0.28)]'
      : 'border-transparent bg-white/0 text-muted hover:border-border hover:bg-white/[0.03] hover:text-text',
  ].join(' ');
}

export default function Sidebar({ mobileOpen, onClose }) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login', { replace: true });
    } catch {
      // Auth errors are surfaced on the login page after redirect.
      navigate('/login', { replace: true });
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition lg:hidden ${mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[280px] border-r border-border bg-[#0b1016]/95 p-4 shadow-[24px_0_50px_rgba(0,0,0,0.32)] surface-blur transition-transform duration-300 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between gap-3 rounded-[24px] border border-border bg-white/[0.03] p-4">
          <BrandLogo subtitle="Operations suite" />
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-border text-muted transition hover:text-text lg:hidden"
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-4 rounded-[28px] border border-border bg-[rgba(255,255,255,0.02)] p-3">
          <div className="mb-3 px-2 text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Navigation</div>
          <nav className="space-y-2">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} className={navClass} onClick={onClose}>
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-4 rounded-[28px] border border-border bg-[linear-gradient(180deg,rgba(239,95,76,0.08),rgba(255,255,255,0.02))] p-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">Session</div>
          <div className="mt-2 text-sm font-semibold text-text">{user?.email || 'Admin operator'}</div>
          <p className="mt-1 text-sm leading-6 text-muted">Live slot control, entry handling, billing, and analytics from one dashboard.</p>
          <button type="button" onClick={handleLogout} className="btn-secondary mt-4 w-full">
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}