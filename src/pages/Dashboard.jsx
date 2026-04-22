import { ArrowUpRight, CarFront, CircleDollarSign, ParkingMeter, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWorkspace } from '../contexts/WorkspaceContext';

const icons = [ParkingMeter, Users, CarFront, CircleDollarSign];

function formatTimestamp(value) {
  if (!value) return 'Just now';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(value);
}

export default function Dashboard() {
  const { dashboardStats, recentActivity, loading, error } = useWorkspace();

  if (loading) {
    return <div className="page-shell space-y-6 pb-10"><div className="control-card">Loading dashboard...</div></div>;
  }

  return (
    <div className="page-shell space-y-6 pb-10">
      <section className="hero-panel">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1 className="page-title mt-4">Operational overview</h1>
            <p className="page-subtitle">A fast summary of occupancy, slot availability, and revenue at a glance.</p>
          </div>
          <Link className="btn-primary" to="/entry">New vehicle entry <ArrowUpRight size={16} className="ml-2" /></Link>
        </div>

        <div className="mt-8 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.map((stat, index) => {
            const Icon = icons[index];
            return (
              <div key={stat.label} className="inner-panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted">{stat.label}</div>
                    <div className="mt-3 font-display text-3xl font-bold text-text">{stat.value}</div>
                  </div>
                  <div className="state-icon"><Icon size={18} /></div>
                </div>
                <div className="mt-2 text-sm text-muted">{stat.detail}</div>
              </div>
            );
          })}
        </div>
        {error ? <div className="mt-4 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="control-card">
          <div className="section-title">Recent activity</div>
          <div className="mt-4 space-y-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="inner-panel px-4 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-semibold text-text">{item.label}</div>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{(item.type || 'event').replace('-', ' ')}</span>
                </div>
                <div className="mt-1 text-sm text-muted">{item.detail}</div>
                <div className="mt-2 text-xs text-muted">{formatTimestamp(item.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="control-card">
          <div className="section-title">Quick actions</div>
          <div className="mt-4 grid gap-3">
            <Link to="/grid" className="btn-secondary justify-between">Open slot grid <ArrowUpRight size={16} /></Link>
            <Link to="/billing" className="btn-secondary justify-between">Process exit billing <ArrowUpRight size={16} /></Link>
            <Link to="/analytics" className="btn-secondary justify-between">Review analytics <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </section>
    </div>
  );
}