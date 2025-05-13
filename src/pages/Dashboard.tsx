import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Server, Clock, ArrowRight } from 'lucide-react';
import { fetchServers } from '../services/api';
import ServerCard from '../components/ui/ServerCard';
import UptimeChart from '../components/ui/UptimeChart';

const Dashboard: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<30 | 90 | 365>(30);
  
  const { data: serversData = {}, isLoading, error } = useQuery({
    queryKey: ['servers'],
    queryFn: fetchServers,
  });

  // Calculate total number of servers across all categories
  const totalServers = Object.values(serversData).reduce((acc, servers) => acc + servers.length, 0);
  
  // Calculate online, degraded, and offline counts
  const serverCounts = Object.values(serversData).reduce((acc, servers) => {
    servers.forEach(server => {
      if (server.status === 'online') acc.online++;
      else if (server.status === 'degraded') acc.degraded++;
      else acc.offline++;
    });
    return acc;
  }, { online: 0, degraded: 0, offline: 0 });
  
  // Calculate overall system health percentage
  const overallHealth = React.useMemo(() => {
    if (totalServers === 0) return 0;
    return ((serverCounts.online + serverCounts.degraded * 0.5) / totalServers) * 100;
  }, [totalServers, serverCounts]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-rose-500">Hiba történt az adatok betöltésekor. Kérjük, próbálja újra később.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Vezérlőpult</h1>
          <p className="mt-1 text-sm text-slate-400">
            Figyelje szervereit és teljesítményüket
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link 
            to="/admin/settings" 
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Beállítások
            <ArrowRight className="ml-2 -mr-1 h-4 w-4" />
          </Link>
        </div>
      </div>
      
      {/* Állapot áttekintő kártyák */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-emerald-500/10">
              <Server className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-slate-400">Összes Szerver</h2>
              <p className="text-2xl font-semibold text-white">{totalServers}</p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-400">Online</span>
                <span className="ml-2 text-sm font-semibold text-emerald-500">
                  {serverCounts.online}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-400">Részleges</span>
                <span className="ml-2 text-sm font-semibold text-amber-500">
                  {serverCounts.degraded}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-slate-400">Offline</span>
                <span className="ml-2 text-sm font-semibold text-rose-500">
                  {serverCounts.offline}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-500/10">
              <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-slate-400">Rendszer Állapot</h2>
              <p className="text-2xl font-semibold text-white">{Math.round(overallHealth)}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full h-2 bg-slate-800 rounded-full">
              <motion.div 
                className="h-2 rounded-full bg-blue-500" 
                style={{ width: `${overallHealth}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${overallHealth}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
        >
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-amber-500/10">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div className="ml-4">
              <h2 className="text-sm font-medium text-slate-400">Rendelkezésre állás (30 nap)</h2>
              <p className="text-2xl font-semibold text-white">
                {totalServers > 0 ? 
                  Math.round(
                    Object.values(serversData).reduce((acc, servers) => {
                      return acc + servers.reduce((sum, server) => {
                        return sum + (server.uptime || 0);
                      }, 0);
                    }, 0) / Math.max(totalServers, 1)
                  ) : 0}%
              </p>
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Utolsó 24ó</span>
              <span className="text-slate-400">Utolsó 7n</span>
              <span className="text-slate-400">Utolsó 30n</span>
              <span className="text-slate-400">Utolsó 90n</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Kiemelt szerverek */}
      {totalServers > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-5">Kiemelt Szerverek</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.values(serversData).flat().slice(0, 3).map((server) => (
              <ServerCard 
                key={server.id} 
                server={server}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;