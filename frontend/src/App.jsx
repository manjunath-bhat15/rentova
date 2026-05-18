import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './pages/DashboardLayout';
import Overview from './pages/Overview';
import Services from './pages/Services';
import CreateService from './pages/CreateService';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';
import WalletPage from './pages/WalletPage';
import ChatPage from './pages/ChatPage';
import NotificationsPage from './pages/NotificationsPage';
import './index.css';

function ComingSoon({ title }) {
  return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '80px 20px' }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
      <h2 style={{ fontSize: 'var(--font-xl)', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: 'var(--text-secondary)' }}>This feature is coming in the next phase.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="services" element={<Services />} />
              <Route path="services/create" element={<CreateService />} />
              <Route path="bookings" element={<Bookings />} />
              <Route path="bookings/:id" element={<BookingDetail />} />
              <Route path="wallet" element={<WalletPage />} />
              <Route path="chat" element={<ChatPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="admin" element={<ComingSoon title="Admin Dashboard" />} />
              <Route path="admin/users" element={<ComingSoon title="User Management" />} />
            </Route>
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
