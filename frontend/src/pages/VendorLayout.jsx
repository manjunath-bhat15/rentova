import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import VendorSidebar from '../components/VendorSidebar';
import Header from '../components/Header';

const pageTitles = {
  '/dashboard': 'Vendor Console',
  '/dashboard/services': 'My Listings',
  '/dashboard/services/create': 'Add New Listing',
  '/dashboard/bookings': 'Manage Bookings',
  '/dashboard/wallet': 'Vendor Wallet',
  '/dashboard/chat': 'Customer Messages',
  '/dashboard/notifications': 'Notifications',
};

export default function VendorLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  let title = pageTitles[location.pathname] || 'Vendor Space';
  if (location.pathname.startsWith('/dashboard/bookings/') && location.pathname !== '/dashboard/bookings') {
    title = 'Booking Details';
  }

  return (
    <div className="dashboard vendor-dashboard-layout">
      <VendorSidebar />
      <div className="dashboard-content">
        <Header title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
