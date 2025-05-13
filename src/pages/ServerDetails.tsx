import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Server as ServerIcon, Clock, HardDrive, Cpu, MemoryStick as Memory } from 'lucide-react';
import { fetchServerDetails } from '../services/api';
import CircularProgress from '../components/ui/CircularProgress';
import StatusBadge from '../components/ui/StatusBadge';
import UptimeChart from '../components/ui/UptimeChart';

const ServerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [timeframe, setTimeframe] = useState<30 | 90 | 365>(30);
  
  const { data: server, isLoading, error } = useQuery({
    queryKey: ['server', id],
    queryFn: () => fetchServerDetails(id || ''),
    enabled: !!id,
  });
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error || !server) {
    return (
      <div className="text-center py-10">
        <p className="text-rose-500">Hiba történt a szerver adatainak betöltésekor. Kérjük, próbálja újra később.</p>
        <Link 
          to="/admin" 
          className="inline-flex items-center mt-4 text-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Vissza a szerverekhez
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Link 
          to="/admin" 
          className="mr-4 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">{server.name}</h1>
            <StatusBadge status={server.status} className="ml-3" />
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {server.location}
          </p>
        </div>
      </div>
      
      {/* Áttekintő metrikák */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">CPU</h2>
            <Cpu className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex items-center justify-center py-4">
            <CircularProgress 
              value={server.metrics?.cpu ?? 0} 
              size={160} 
              thickness={10}
              label="Használat"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Memória</h2>
            <Memory className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex items-center justify-center py-4">
            <CircularProgress 
              value={server.metrics?.ram ?? 0} 
              size={160} 
              thickness={10}
              label="Használat"
            />
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">Lemez</h2>
            <HardDrive className="h-5 w-5 text-slate-400" />
          </div>
          <div className="flex items-center justify-center py-4">
            <CircularProgress 
              value={server.metrics?.disk ?? 0} 
              size={160} 
              thickness={10}
              label="Használat"
            />
          </div>
        </motion.div>
      </div>
      
      {/* Rendelkezésre állási grafikon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-slate-400 mr-2" />
            <h2 className="text-lg font-medium text-white">Rendelkezésre Állás</h2>
          </div>
          <div className="mt-3 sm:mt-0 flex space-x-2">
            <button
              onClick={() => setTimeframe(30)}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                timeframe === 30
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              30 Nap
            </button>
            <button
              onClick={() => setTimeframe(90)}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                timeframe === 90
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              90 Nap
            </button>
            <button
              onClick={() => setTimeframe(365)}
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                timeframe === 365
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              365 Nap
            </button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="sm:w-1/3">
            <div className="bg-slate-800/30 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">
                {server.uptime ? Math.round(server.uptime) : 0}%
              </h3>
              <p className="text-sm text-slate-400">
                Átlagos rendelkezésre állás az elmúlt {timeframe} napban
              </p>
              
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Online</span>
                    <span className="text-sm font-medium text-emerald-400">
                      {server.status === 'online' ? 'Jelenleg online' : '-'}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Utolsó frissítés</span>
                    <span className="text-sm font-medium text-slate-300">
                      {new Date(server.lastUpdated).toLocaleString('hu-HU')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="sm:w-2/3">
            {server.uptimeHistory && (
              <UptimeChart data={server.uptimeHistory} days={timeframe} />
            )}
          </div>
        </div>
      </motion.div>
      
      {/* Szerver részletek */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6">
          <div className="flex items-center mb-4">
            <ServerIcon className="h-5 w-5 text-slate-400 mr-2" />
            <h2 className="text-lg font-medium text-white">Szerver Adatok</h2>
          </div>
          
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-slate-400">Szerver ID</dt>
              <dd className="mt-1 text-sm text-white">{server.id}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-400">Helyszín</dt>
              <dd className="mt-1 text-sm text-white">{server.location}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-400">Státusz</dt>
              <dd className="mt-1 text-sm">
                <StatusBadge status={server.status} />
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-400">Rendelkezésre állás</dt>
              <dd className="mt-1 text-sm text-white">{server.uptime ? Math.round(server.uptime) : 0}%</dd>
            </div>
          </dl>
        </div>
      </motion.div>
    </div>
  );
};

export default ServerDetails;