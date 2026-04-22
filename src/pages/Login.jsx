import { ArrowRight, LockKeyhole, UserRound } from 'lucide-react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import BrandLogo from '../components/BrandLogo';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, signIn, error, setError, firebaseConfigError, hasFirebaseConfig } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = useMemo(() => location.state?.from?.pathname || '/dashboard', [location.state]);

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!hasFirebaseConfig) {
      setError(firebaseConfigError);
      return;
    }

    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate(redirectTo, { replace: true });
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell min-h-screen px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="hero-panel">
          <BrandLogo subtitle="Operator access" />
          <h1 className="page-title mt-6">Sign in to the parking operations console.</h1>
          <p className="page-subtitle">Sign in with a Firebase email/password account to access the live workspace for slot control, entry handling, and billing.</p>
          {error ? (
            <div className="mt-5 rounded-[20px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-secondary" to="/">Back to home</Link>
            <Link className="btn-secondary" to="/signup">Create account</Link>
            <Link className="btn-primary" to="/dashboard">Enter dashboard <ArrowRight size={16} className="ml-2" /></Link>
          </div>
        </div>

        <form className="control-card" onSubmit={handleSubmit}>
          <div className="section-title">Login form</div>
          <div className="mt-6 space-y-5">
            <label className="block">
              <span className="field-label">Email</span>
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input className="control-input pl-11" type="email" placeholder="operator@smartparkease.com" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
              </div>
            </label>
            <label className="block">
              <span className="field-label">Password</span>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input className="control-input pl-11" type="password" placeholder="Enter password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
              </div>
            </label>
            <button className="btn-primary w-full" disabled={submitting || !hasFirebaseConfig}>
              {submitting ? 'Signing in...' : 'Sign in'}
            </button>
            {!hasFirebaseConfig ? (
              <p className="text-sm text-muted">Firebase env vars are missing, so sign-in is disabled until the project is configured.</p>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}