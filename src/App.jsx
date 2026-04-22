import { Suspense, lazy, useState } from 'react';
import { Menu } from 'lucide-react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BrandLogo from './components/BrandLogo';
import { LoadingCard } from './components/SurfaceStates';
import RequireAuth from './components/RequireAuth';
import { useAuth } from './contexts/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ParkingGrid = lazy(() => import('./pages/ParkingGrid'));
const VehicleEntry = lazy(() => import('./pages/VehicleEntry'));
const Billing = lazy(() => import('./pages/Billing'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Settings = lazy(() => import('./pages/Settings'));

function RouteLoader() {
  return (
    <LoadingCard title="Preparing workspace" body="Loading the next screen with current activity and polished UI states." />
  );
}

function PublicLayout() {
  return (
    <div className="min-h-screen bg-abyss text-text">
      <Suspense fallback={<RouteLoader />}>
        <Outlet />
      </Suspense>
    </div>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-abyss text-text">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <main className="min-h-screen px-4 py-4 sm:px-6 lg:ml-[280px] lg:px-8 lg:py-8">
        <div className="mb-4 flex items-center justify-between rounded-[28px] border border-accent/15 bg-[#10161f]/88 px-4 py-3 shadow-card surface-blur lg:hidden">
          <BrandLogo compact subtitle="Operations suite" />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-[#151515] text-text transition hover:border-accent/20 hover:text-accent"
            aria-label="Open navigation"
          >
            <Menu size={18} />
          </button>
        </div>

        <div className="mx-auto w-full max-w-[1640px]">
          <Suspense fallback={<RouteLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

function LoginRedirect() {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginRedirect />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/grid" element={<ParkingGrid />} />
          <Route path="/entry" element={<VehicleEntry />} />
          <Route path="/billing" element={<Billing />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
    </Routes>
  );
}
