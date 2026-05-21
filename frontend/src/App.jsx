import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeLanguageProvider } from './contexts/ThemeLanguageContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
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
import './index.css';

function RoleRedirect() {
  const location = useLocation();
  const [role, ...rest] = location.pathname.split('/').filter(Boolean);
  const normalized = role === 'admin' ? ['admin', ...rest] : rest;
  return <Navigate to={`/dashboard${normalized.length ? `/${normalized.join('/')}` : ''}`} replace />;
}

function DashboardHome() {
  const { user } = useAuth();
  return user?.role === 'ADMIN' ? <AdminPanel /> : <Overview />;
}

export default function App() {
  return (
    <ThemeLanguageProvider>
      <BrowserRouter>
        <AuthProvider>
          <SocketProvider>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/customer/*" element={<RoleRedirect />} />
              <Route path="/vendor/*" element={<RoleRedirect />} />
              <Route path="/admin/*" element={<RoleRedirect />} />
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
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="profile" element={<Profile />} />
                <Route path="admin" element={<AdminPanel />} />
                <Route path="admin/users" element={<AdminPanel defaultTab="users" />} />
              </Route>
            </Routes>
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeLanguageProvider>
  );
}
