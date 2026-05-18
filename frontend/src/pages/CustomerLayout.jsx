import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const pageTitles = {
  '/customer': 'Overview',
  '/customer/services': 'Services',
  '/customer/bookings': 'Bookings',
  '/customer/wallet': 'Wallet',
  '/customer/chat': 'Chat',
  '/customer/notifications': 'Notifications',
  '/customer/profile': 'Profile',
};

export default function CustomerLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'CUSTOMER') {
    return <Navigate to="/login" replace />;
  }

  let title = pageTitles[location.pathname] || 'Dashboard';
  if (location.pathname.startsWith('/customer/bookings/') && location.pathname !== '/customer/bookings') {
    title = 'Booking Details';
  }

  return (
    <div className="dashboard">
      <Sidebar role="CUSTOMER" basePath="/customer" />
      <div className="dashboard-content">
        <Header title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
