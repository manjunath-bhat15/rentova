import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import CustomerSidebar from '../components/CustomerSidebar';
import Header from '../components/Header';

const pageTitles = {
  '/dashboard': 'Overview',
  '/dashboard/services': 'Browse Services',
  '/dashboard/bookings': 'My Bookings',
  '/dashboard/wallet': 'My Wallet',
  '/dashboard/chat': 'Customer Support Chat',
  '/dashboard/nearby': 'Nearby Vendors',
  '/dashboard/notifications': 'Notifications',
};

export default function CustomerLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  let title = pageTitles[location.pathname] || 'Customer Space';
  if (location.pathname.startsWith('/dashboard/bookings/') && location.pathname !== '/dashboard/bookings') {
    title = 'Booking Details';
  }

  return (
    <div className="dashboard customer-dashboard-layout">
      <CustomerSidebar />
      <div className="dashboard-content">
        <Header title={title} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
