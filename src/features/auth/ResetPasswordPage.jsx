import { Link } from 'react-router-dom';
import Logo from '../../components/common/Logo.jsx';

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-cream px-4">
      <section className="w-full max-w-md rounded-lg bg-white p-6 shadow-soft">
        <Logo />
        <h1 className="mt-8 text-2xl font-bold">Reset password</h1>
        <input className="mt-6 min-h-12 w-full rounded-md border border-stone-200 px-3 outline-none focus:border-burgundy-500" type="password" placeholder="New password" />
        <input className="mt-3 min-h-12 w-full rounded-md border border-stone-200 px-3 outline-none focus:border-burgundy-500" type="password" placeholder="Confirm password" />
        <button className="mt-4 min-h-12 w-full rounded-md bg-burgundy-600 px-4 font-bold text-white focus-ring">Save password</button>
        <Link className="mt-4 block text-center text-sm font-semibold text-burgundy-600" to="/login">Back to login</Link>
      </section>
    </main>
  );
}
