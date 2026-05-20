import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import CustomerLayout from './CustomerLayout';
import VendorLayout from './VendorLayout';
import AdminLayout from './AdminLayout';

export default function DashboardLayout() {
  const { isAuthenticated, loading, user } = useAuth();
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

  const role = user?.role || 'CUSTOMER';

  if (role === 'ADMIN') {
    return <AdminLayout />;
  } else if (role === 'VENDOR') {
    return <VendorLayout />;
  } else {
    return <CustomerLayout />;
  }
}
