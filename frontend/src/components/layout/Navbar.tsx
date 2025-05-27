import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Server, Settings, Bell, Database } from 'lucide-react';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = sessionStorage.getItem('isAuthenticated') === 'true';

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-slate-800 fixed w-full top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="relative">
                <Server className="h-8 w-8 text-blue-500" />
                <div className="absolute inset-0 blur-lg bg-blue-500/20" />
              </div>
              <span className="ml-3 text-xl font-semibold text-white">U-Cloud Monitor</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/admin"
                  className={`text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin') ? 'bg-slate-800' : ''
                  }`}
                >
                  <Settings className="h-5 w-5 mr-2" />
                  Admin
                </Link>
                <Link
                  to="/admin/servers"
                  className={`text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin/servers') ? 'bg-slate-800' : ''
                  }`}
                >
                  <Database className="h-5 w-5 mr-2" />
                  Szerverek
                </Link>
                <Link
                  to="/admin/notifications"
                  className={`text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center ${
                    isActive('/admin/notifications') ? 'bg-slate-800' : ''
                  }`}
                >
                  <Bell className="h-5 w-5 mr-2" />
                  Értesítések
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Kijelentkezés
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Bejelentkezés
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;