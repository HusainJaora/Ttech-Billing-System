import { useContext } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';


export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Persistent Sidebar - doesn't unmount on navigation */}
      <Sidebar
        onNavigate={handleNavigation}
        onLogout={handleLogout}
        currentUser={user}
        currentPath={location.pathname}
      />

      {/* Main Content Area - Only this part changes on navigation */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Outlet renders the current route's component */}
        <Outlet />
      </div>
    </div>
  );
}