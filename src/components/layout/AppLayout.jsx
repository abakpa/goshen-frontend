import { Outlet } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { closeSidebar } from '../../store/uiSlice.js';
import MobileBottomNav from './MobileBottomNav.jsx';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';

export default function AppLayout() {
  const dispatch = useDispatch();
  const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Sidebar />
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close navigation"
          onClick={() => dispatch(closeSidebar())}
        />
      )}
      <div className="min-w-0 lg:pl-72">
        <Topbar />
        <main className="mx-auto w-full max-w-screen-2xl overflow-x-hidden px-4 pb-24 pt-4 sm:px-6 lg:px-8 lg:pb-8">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
