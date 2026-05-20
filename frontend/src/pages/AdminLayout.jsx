import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
import Header from '../components/Header';

const pageTitles = {
  '/dashboard': 'Admin Command Center',
  '/dashboard/admin/users': 'User Management Control',
  '/dashboard/services': 'All Registered Listings',
  '/dashboard/bookings': 'All Platform Bookings',
  '/dashboard/chat': 'Global Chat Audits',
  '/dashboard/notifications': 'Global Alerts',
};

export default function AdminLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  let title = pageTitles[location.pathname] || 'Admin HQ';
  if (location.pathname.startsWith('/dashboard/bookings/') && location.pathname !== '/dashboard/bookings') {
    title = 'Booking Details';
  }

  return (
    <div className="dashboard admin-dashboard-layout">
      <AdminSidebar />
      <div className="dashboard-content">
        <Header title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
