import { NavLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaBoxesStacked, FaChartLine, FaClipboardCheck, FaCreditCard, FaReceipt, FaRightFromBracket, FaShop, FaUserGear, FaUsers } from 'react-icons/fa6';
import { MdDashboard, MdInventory2, MdPointOfSale, MdSettings } from 'react-icons/md';
import { closeSidebar } from '../../store/uiSlice.js';
import { logout } from '../../features/auth/authSlice.js';
import { hasPermission } from '../../utils/permissions.js';
import Logo from '../common/Logo.jsx';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: MdDashboard, permissions: ['dashboard:read'] },
  { to: '/stores', label: 'Stores', icon: FaShop, permissions: ['stores:read'] },
  { to: '/products', label: 'Products', icon: FaBoxesStacked, permissions: ['products:read'] },
  { to: '/inventory', label: 'Inventory', icon: MdInventory2, permissions: ['inventory:read'] },
  { to: '/sales/pos', label: 'Point of Sale', icon: MdPointOfSale, permissions: ['sales:create'] },
  { to: '/sales/approvals', label: 'Sales Approvals', icon: FaClipboardCheck, permissions: ['system:*'] },
  { to: '/sales/history', label: 'Sales History', icon: FaReceipt, permissions: ['sales:read'] },
  { to: '/online-sales', label: 'Online Sales', icon: FaReceipt, permissions: ['online-orders:read'] },
  { to: '/customers', label: 'Customers', icon: FaUsers, permissions: ['customers:read'] },
  { to: '/credit-sales', label: 'Debtors', icon: FaCreditCard, permissions: ['credit-sales:read'] },
  { to: '/expenses', label: 'Expenses', icon: FaReceipt, permissions: ['expenses:read'] },
  { to: '/staff', label: 'Staff', icon: FaUserGear, permissions: ['users:read', 'roles:read'] },
  { to: '/reports', label: 'Reports', icon: FaChartLine, permissions: ['reports:read'] },
  { to: '/settings', label: 'Settings', icon: MdSettings, permissions: ['settings:read'] }
];

export default function Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);
  const user = useSelector((state) => state.auth.user);
  const visibleNavItems = navItems.filter((item) => hasPermission(user, item.permissions));

  const handleLogout = async () => {
    await dispatch(logout());
    dispatch(closeSidebar());
    navigate('/login', { replace: true });
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-black/5 bg-white px-4 py-5 shadow-soft transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <Logo />
      <nav className="mt-8 space-y-1">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => dispatch(closeSidebar())}
            className={({ isActive }) =>
              `flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold focus-ring ${
                isActive ? 'bg-burgundy-600 text-white' : 'text-stone-700 hover:bg-burgundy-50 hover:text-burgundy-700'
              }`
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-8 rounded-lg bg-cream p-4">
        <div className="flex items-center gap-3 text-sm font-semibold text-burgundy-700">
          <FaReceipt />
          Receipt ready
        </div>
        <p className="mt-2 text-xs leading-5 text-stone-600">Thermal and A4 receipt flows are prepared for sales integration.</p>
      </div>
      <div className="mt-4 rounded-lg bg-plum p-4 text-white">
        <div className="flex items-center gap-3 text-sm font-semibold">
          <FaUserGear />
          RBAC enabled
        </div>
        <p className="mt-2 text-xs leading-5 text-white/75">Only permitted modules are shown for the signed-in role.</p>
      </div>
      <button
        onClick={handleLogout}
        className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-red-100 bg-red-50 px-3 text-sm font-bold text-red-700 focus-ring"
      >
        <FaRightFromBracket className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
