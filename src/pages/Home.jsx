import { ArrowRight, ShieldCheck, Gauge, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';

const highlights = [
  { icon: ShieldCheck, title: 'Operator-first flow', body: 'Designed for staff who need to move fast without losing visibility.' },
  { icon: Gauge, title: 'Live operations', body: 'Track active vehicles, free slots, and billing in one place.' },
  { icon: Sparkles, title: 'ANPR assist', body: 'Optional plate recognition keeps manual entry as a reliable fallback.' },
];

export default function Home() {
  return (
    <div className="page-shell min-h-screen overflow-hidden">
      <div className="soft-grid absolute inset-0 opacity-30" />
      <div className="hero-orb absolute left-[-8%] top-[-6%] h-72 w-72 bg-[rgba(239,95,76,0.18)]" />
      <div className="hero-orb absolute right-[-4%] top-[12%] h-64 w-64 bg-[rgba(74,222,128,0.1)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <header className="flex items-center justify-between gap-4 rounded-[28px] border border-white/8 bg-white/[0.03] px-4 py-4 surface-blur">
          <BrandLogo subtitle="Modern parking operations" />
          <div className="hidden items-center gap-3 sm:flex">
            <Link className="btn-secondary" to="/login">Operator login</Link>
            <Link className="btn-primary" to="/dashboard">
              Open dashboard
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </header>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.9fr] lg:items-stretch">
          <div className="hero-panel">
            <span className="eyebrow">Parking operations platform</span>
            <h1 className="page-title mt-5 max-w-3xl">One dashboard for live slots, vehicle entry, billing, and analytics.</h1>
            <p className="page-subtitle text-balance">
              SmartParkEase helps attendants and supervisors see the lot at a glance, assign slots faster, and keep exit billing clear without relying on paper records.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/dashboard">
                Go to dashboard
                <ArrowRight size={16} className="ml-2" />
              </Link>
              <Link className="btn-secondary" to="/grid">View slot grid</Link>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map(({ icon: Icon, title, body }) => (
              <div key={title} className="control-card">
                <div className="flex items-start gap-4">
                  <div className="state-icon shrink-0"><Icon size={18} /></div>
                  <div>
                    <div className="section-title">{title}</div>
                    <p className="page-subtitle !mt-2">{body}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="control-card">
              <div className="section-title">Route map</div>
              <div className="mt-4 grid gap-3 text-sm text-muted">
                <div className="inner-panel px-4 py-3">Dashboard, grid, entry, billing, analytics, and settings are ready.</div>
                <div className="inner-panel px-4 py-3">Use the sidebar to move between live operations screens.</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}