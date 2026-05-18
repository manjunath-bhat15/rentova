import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const pageTitles = {
  '/vendor': 'Overview',
  '/vendor/services': 'My Services',
  '/vendor/services/create': 'Create Service',
  '/vendor/bookings': 'Bookings',
  '/vendor/wallet': 'Wallet',
  '/vendor/chat': 'Chat',
  '/vendor/notifications': 'Notifications',
  '/vendor/profile': 'Profile',
};

export default function VendorLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'VENDOR') {
    return <Navigate to="/login" replace />;
  }

  let title = pageTitles[location.pathname] || 'Dashboard';
  if (location.pathname.startsWith('/vendor/bookings/') && location.pathname !== '/vendor/bookings') {
    title = 'Booking Details';
  }

  return (
    <div className="dashboard">
      <Sidebar role="VENDOR" basePath="/vendor" />
      <div className="dashboard-content">
        <Header title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
