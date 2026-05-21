import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeLanguageProvider } from './contexts/ThemeLanguageContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import AdminRootLayout from './pages/AdminRootLayout';
import Overview from './pages/Overview';
import Services from './pages/Services';
import CreateService from './pages/CreateService';
import EditService from './pages/EditService';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import CheckoutPage from './pages/CheckoutPage';
import BookingConfirmation from './pages/BookingConfirmation';
import WalletPage from './pages/WalletPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import NearbyVendors from './pages/NearbyVendors';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import VendorAnalytics from './pages/VendorAnalytics';
import './index.css';

function RoleRedirect() {
  const location = useLocation();
  const [role, ...rest] = location.pathname.split('/').filter(Boolean);
  return <Navigate to={`/dashboard${rest.length ? `/${rest.join('/')}` : ''}`} replace />;
}

import { Toaster } from 'react-hot-toast';

function DashboardHome() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <Navigate to="/admin" replace /> : <Overview />;
}

export default function App() {
  return (
    <ThemeLanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Toaster position="bottom-right" />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/customer/*" element={<RoleRedirect />} />
              <Route path="/vendor/*" element={<RoleRedirect />} />
              
              {/* ADMIN ROUTES */}
              <Route path="/admin" element={<AdminRootLayout />}>
                <Route index element={<AdminPanel defaultTab="overview" />} />
                <Route path="users" element={<AdminPanel defaultTab="users" />} />
                <Route path="services" element={<AdminPanel defaultTab="services" />} />
                <Route path="bookings" element={<AdminPanel defaultTab="bookings" />} />
                <Route path="verifications" element={<AdminPanel defaultTab="verifications" />} />
              </Route>
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<DashboardHome />} />
                <Route path="services" element={<Services />} />
                <Route path="services/create" element={<CreateService />} />
                <Route path="services/edit/:id" element={<EditService />} />
                <Route path="bookings" element={<Bookings />} />
                <Route path="bookings/:id" element={<BookingDetail />} />
                <Route path="checkout" element={<CheckoutPage />} />
                <Route path="booking-confirmation" element={<BookingConfirmation />} />
                <Route path="wallet" element={<WalletPage />} />
                <Route path="chat" element={<ChatPage />} />
                <Route path="nearby" element={<NearbyVendors />} />
                <Route path="analytics" element={<VendorAnalytics />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<Profile />} />
              </Route>
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeLanguageProvider>
  );
}
