import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const pageTitles = {
  '/dashboard': 'Overview',
  '/dashboard/services': 'Services',
  '/dashboard/services/create': 'Create Service',
  '/dashboard/bookings': 'Bookings',
  '/dashboard/wallet': 'Wallet',
  '/dashboard/chat': 'Chat',
  '/dashboard/nearby': 'Nearby Vendors',
  '/dashboard/notifications': 'Notifications',
  '/dashboard/admin': 'Admin Command Center',
  '/dashboard/admin/users': 'User Management',
};

export default function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  let title = pageTitles[location.pathname] || 'Dashboard';
  if (location.pathname.startsWith('/dashboard/bookings/') && location.pathname !== '/dashboard/bookings') {
    title = 'Booking Details';
  }

  return (
    <div className="dashboard">
      <Sidebar />
      <div className="dashboard-content">
        <Header title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
