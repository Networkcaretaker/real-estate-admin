// src/components/layout/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Building2, Settings, Users, Globe, Users2 } from 'lucide-react';
import { authService } from '../../services/firebase/auth';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" /> },
  { path: '/properties', label: 'Properties', icon: <Building2 className="w-5 h-5" /> },
  { path: '/websites', label: 'Websites', icon: <Globe className="w-5 h-5" /> },
  { path: '/clients', label: 'Clients', icon: <Users className="w-5 h-5" /> },
  { path: '/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  { path: '/users', label: 'Users', icon: <Users2 className="w-5 h-5" /> },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-auto mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <img src="/house.svg" alt="Real Estate" className="h-8 w-auto" />
              <span className="text-3xl font-bold px-4">REAL ESTATE</span>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    location.pathname.startsWith(item.path)
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
            
          </div>
          <div className="ml-32 flex items-center justify-end">
            {user?.email && (
              <>
                <span className="user-email px-4">{user.email}</span>
                <button onClick={handleLogout} className="logout-button px-4">
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;