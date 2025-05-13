import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Navbar from './Navbar';
import NotificationBanner from '../ui/NotificationBanner';
import { fetchNotifications, dismissNotification } from '../../services/api';

const Layout: React.FC = () => {
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleDelete = async (id: string) => {
    await dismissNotification(id);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Subtle animated grid background */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] opacity-[0.02]" />
      
      {/* Radial gradient overlays */}
      <div className="fixed inset-0 bg-gradient-to-b from-blue-500/5 via-transparent to-transparent" />
      <div className="fixed inset-0 bg-gradient-to-t from-blue-900/10 via-transparent to-transparent" />
      
      {/* Content */}
      <Navbar />
      <main className="flex-1 pt-16 relative">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NotificationBanner 
            notifications={notifications} 
            onDelete={isAdmin ? handleDelete : undefined}
          />
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;