import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo.jsx';

export default function ForgotPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold">Forgot password</h1>
        <p className="mt-2 text-sm text-stone-500">Enter your account email. The backend endpoint is ready for a secure reset-token email provider.</p>
        <input className="mt-6 min-h-12 w-full rounded-md border border-stone-200 px-3 outline-none focus:border-burgundy-500" placeholder="Email address" />
        <button className="mt-4 min-h-12 w-full rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">Request reset link</button>
        <Link className="mt-4 block text-center text-sm font-semibold text-burgundy-600" to="/login">Back to login</Link>
      </section>
    </main>
  );
}
