import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaMagnifyingGlass, FaRightFromBracket } from 'react-icons/fa6';
import { MdMenu } from 'react-icons/md';
import { toggleSidebar } from '../../store/uiSlice.js';
import { logout } from '../../features/auth/authSlice.js';

export default function Topbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-20 border-b border-black/5 bg-cream/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-screen-2xl items-center gap-3">
        <button className="grid h-11 w-11 place-items-center rounded-md bg-white shadow-soft focus-ring lg:hidden" onClick={() => dispatch(toggleSidebar())}>
          <MdMenu className="h-6 w-6" />
        </button>
        <div className="hidden min-h-11 flex-1 items-center gap-3 rounded-md bg-white px-4 shadow-soft md:flex">
          <FaMagnifyingGlass className="h-4 w-4 text-stone-400" />
          <input className="w-full bg-transparent text-sm outline-none" placeholder="Search products, sales, stores, customers..." />
        </div>
        <button className="grid h-11 w-11 place-items-center rounded-md bg-white shadow-soft focus-ring" aria-label="Notifications">
          <FaBell className="h-5 w-5 text-burgundy-600" />
        </button>
        <div className="min-w-0 rounded-md bg-white px-3 py-2 shadow-soft">
          <p className="truncate text-sm font-bold">{user?.fullName || 'Admin'}</p>
          <p className="truncate text-xs text-stone-500">{user?.role?.name || 'Super Admin'}</p>
        </div>
        <button
          onClick={handleLogout}
          aria-label="Log out"
          className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white shadow-soft focus-ring sm:min-h-11 sm:w-auto sm:inline-flex sm:items-center sm:gap-2 sm:px-3 sm:text-sm sm:font-bold"
        >
          <FaRightFromBracket className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
