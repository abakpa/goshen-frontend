import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa6';
import { login } from './authSlice.js';
import Logo from '../../components/common/Logo.jsx';
import { getDefaultRoute } from '../../utils/permissions.js';

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { status, error } = useSelector((state) => state.auth);
  const query = new URLSearchParams(location.search);
  const expired = query.get('expired') === '1';
  const from = query.get('from');
  const { register, handleSubmit } = useForm({
    defaultValues: {
      email: 'owner@goshencollection.local',
      password: 'ChangeMe123!'
    }
  });

  const onSubmit = async (values) => {
    const result = await dispatch(login(values));
    if (login.fulfilled.match(result)) {
      navigate(from || location.state?.from?.pathname || getDefaultRoute(result.payload.user), { replace: true });
    }
  };

  return (
    <main className="grid min-h-screen bg-cream lg:grid-cols-[1fr_1.1fr]">
      <section className="hidden bg-ink p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <p className="max-w-xl text-5xl font-bold leading-tight tracking-normal">Central control for every Goshen Collection store.</p>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/70">Manage physical stores, online channels, staff, stock, debtors, receipts, and reports from one secure business system.</p>
        </div>
        <p className="text-sm text-white/50">Premium fashion retail operations platform</p>
      </section>
      <section className="flex items-center justify-center px-4 py-10 sm:px-6">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft sm:p-8">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 text-2xl font-bold tracking-normal lg:mt-0">Sign in</h1>
          <p className="mt-2 text-sm text-stone-500">Use an authorized staff account to continue.</p>
          {expired && !error && <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">Your session expired. Sign in again to continue.</p>}
          {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}
          <label className="mt-6 block text-sm font-semibold" htmlFor="email">Email address</label>
          <div className="mt-2 flex min-h-12 items-center gap-3 rounded-md border border-stone-200 px-3 focus-within:border-burgundy-500">
            <FaEnvelope className="text-stone-400" />
            <input id="email" type="email" className="w-full outline-none" {...register('email', { required: true })} />
          </div>
          <label className="mt-4 block text-sm font-semibold" htmlFor="password">Password</label>
          <div className="mt-2 flex min-h-12 items-center gap-3 rounded-md border border-stone-200 px-3 focus-within:border-burgundy-500">
            <FaLock className="text-stone-400" />
            <input id="password" type="password" className="w-full outline-none" {...register('password', { required: true })} />
          </div>
          <div className="mt-4 flex items-center justify-between gap-4 text-sm">
            <label className="flex items-center gap-2 text-stone-600">
              <input type="checkbox" className="h-4 w-4 rounded border-stone-300 text-burgundy-600" />
              Remember
            </label>
            <Link className="font-semibold text-burgundy-600" to="/forgot-password">Forgot password?</Link>
          </div>
          <button className="mt-6 min-h-12 w-full rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring disabled:opacity-60" disabled={status === 'loading'}>
            {status === 'loading' ? 'Signing in...' : 'Sign in securely'}
          </button>
        </form>
      </section>
    </main>
  );
}
