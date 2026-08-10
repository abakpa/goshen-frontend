import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { MdDashboard, MdInventory2, MdPointOfSale, MdSettings } from 'react-icons/md';
import { FaBoxesStacked } from 'react-icons/fa6';
import { hasPermission } from '../../utils/permissions.js';

const items = [
  { to: '/dashboard', label: 'Home', icon: MdDashboard, permissions: ['dashboard:read'] },
  { to: '/sales/pos', label: 'POS', icon: MdPointOfSale, permissions: ['sales:create'] },
  { to: '/products', label: 'Stock', icon: FaBoxesStacked, permissions: ['products:read'] },
  { to: '/inventory', label: 'Inventory', icon: MdInventory2, permissions: ['inventory:read'] },
  { to: '/settings', label: 'More', icon: MdSettings, permissions: ['settings:read'] }
];

export default function MobileBottomNav() {
  const user = useSelector((state) => state.auth.user);
  const visibleItems = items.filter((item) => hasPermission(user, item.permissions)).slice(0, 5);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 grid border-t border-black/5 bg-white px-2 py-2 shadow-soft lg:hidden"
      style={{ gridTemplateColumns: `repeat(${Math.max(visibleItems.length, 1)}, minmax(0, 1fr))` }}
    >
      {visibleItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            `flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-semibold focus-ring ${
              isActive ? 'bg-burgundy-50 text-burgundy-700' : 'text-stone-500'
            }`
          }
        >
          <item.icon className="h-5 w-5" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
