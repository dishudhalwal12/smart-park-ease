import { BarChart, Bar, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Analytics() {
  const { weeklyRevenue, occupancyTrend, occupancyByZone, loading, error } = useWorkspace();

  if (loading) {
    return <div className="page-shell space-y-6 pb-10"><div className="control-card">Loading analytics...</div></div>;
  }

  return (
    <div className="page-shell space-y-6 pb-10">
      <section className="hero-panel">
        <span className="eyebrow">Analytics</span>
        <h1 className="page-title mt-4">Revenue and usage trends</h1>
        <p className="page-subtitle">This view summarizes weekly earnings and gives management a quick read on parking activity.</p>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="control-card min-h-[440px]">
          <div className="section-title">Weekly revenue</div>
          <div className="mt-6 h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyRevenue}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(157,167,181,0.7)" tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(157,167,181,0.7)" tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0d1218',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    color: '#f7f8fb',
                  }}
                />
                <Bar dataKey="value" fill="#ef5f4c" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="control-card">
          <div className="section-title">Zone utilization</div>
          <div className="mt-4 space-y-3 text-sm text-muted">
            {occupancyByZone.map((zone) => (
              <div key={zone.zone} className="inner-panel px-4 py-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-text">Zone {zone.zone}</span>
                  <span>{zone.occupied}/{zone.total} occupied</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.round((zone.occupied / Math.max(zone.total, 1)) * 100)}%` }} />
                </div>
              </div>
            ))}
            {!occupancyByZone.length ? <div className="inner-panel px-4 py-4">Zone occupancy will appear after slots are loaded.</div> : null}
          </div>
          {error ? <div className="mt-4 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">{error}</div> : null}
        </div>
      </section>

      <section className="control-card min-h-[420px]">
        <div className="section-title">Entry vs exit trend</div>
        <p className="page-subtitle mt-2">Tracks weekly flow balance between incoming and departing vehicles.</p>
        <div className="mt-6 h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={occupancyTrend}>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" stroke="rgba(157,167,181,0.7)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(157,167,181,0.7)" tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: '#0d1218',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  color: '#f7f8fb',
                }}
              />
              <Line type="monotone" dataKey="entries" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="exits" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}