import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import TopNav from '../components/TopNav';
import BottomTabBar from '../components/BottomTabBar';

export default function CustomerLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="app-shell">
      <TopNav />
      <main className="app-content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>
      <BottomTabBar />
    </div>
  );
}
