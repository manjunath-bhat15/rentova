import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const pageTitles = {
  '/admin': 'Overview',
  '/admin/users': 'User Management',
  '/admin/services': 'All Services',
  '/admin/bookings': 'All Bookings',
  '/admin/wallet': 'Platform Wallet',
  '/admin/chat': 'Chat',
  '/admin/notifications': 'Notifications',
  '/admin/profile': 'Profile',
};

export default function AdminLayout() {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  let title = pageTitles[location.pathname] || 'Dashboard';
  if (location.pathname.startsWith('/admin/bookings/') && location.pathname !== '/admin/bookings') {
    title = 'Booking Details';
  }

  return (
    <div className="dashboard">
      <Sidebar role="ADMIN" basePath="/admin" />
      <div className="dashboard-content">
        <Header title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
