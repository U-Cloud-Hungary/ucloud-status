import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { fetchServers } from '../services/api.ts';
import StatusBadge from '../components/ui/StatusBadge.tsx';

const ServerList: React.FC = () => {
  const { data: serversByCategory, isLoading } = useQuery({
    queryKey: ['servers'],
    queryFn: fetchServers,
  });

  const stats = React.useMemo(() => {
    if (!serversByCategory) return { total: 0, uptime: 0 };
    
    const allServers = Object.values(serversByCategory).flat();
    const total = allServers.length;
    
    // Calculate average uptime across all servers
    const uptime = allServers.reduce((acc, server) => acc + (server.uptime || 0), 0) / Math.max(1, total);
    
    return { total, uptime };
  }, [serversByCategory]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Overall System Status */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-white">Rendszer Állapot</h1>
            <p className="text-slate-400 mt-1">366 napos átlag</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-400">{stats.uptime.toFixed(2)}%</div>
            <div className="text-sm text-slate-400">Rendelkezésre állás</div>
          </div>
        </div>
      </motion.div>

      {/* Server Categories */}
      {Object.entries(serversByCategory || {}).map(([category, servers], categoryIndex) => (
        <motion.div
          key={category}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
          className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 overflow-hidden"
        >
          <div className="p-6 border-b border-slate-800/50">
            <h2 className="text-xl font-semibold text-white">{category}</h2>
          </div>

          <div className="divide-y divide-slate-800/50">
            {servers.map((server, index) => (
              <motion.div
                key={server.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex items-center gap-8">
                  {/* Server Info */}
                  <div className="w-64">
                    <h3 className="text-lg font-medium text-white mb-1">{server.name}</h3>
                    <p className="text-sm text-slate-400">{server.location}</p>
                  </div>

                  {/* Status Badge */}
                  <div className="w-32">
                    <StatusBadge status={server.status} />
                  </div>

                  {/* Metrics */}
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    {/* CPU Usage */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-slate-400">CPU</div>
                        <div className="text-xs font-medium text-white">{server.metrics.cpu}%</div>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${server.metrics.cpu}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${
                            server.metrics.cpu < 50 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                            server.metrics.cpu < 80 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                            'bg-gradient-to-r from-rose-600 to-rose-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* RAM Usage */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-slate-400">RAM</div>
                        <div className="text-xs font-medium text-white">{server.metrics.ram}%</div>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${server.metrics.ram}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${
                            server.metrics.ram < 50 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                            server.metrics.ram < 80 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                            'bg-gradient-to-r from-rose-600 to-rose-400'
                          }`}
                        />
                      </div>
                    </div>

                    {/* SSD Usage */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="text-xs text-slate-400">SSD</div>
                        <div className="text-xs font-medium text-white">{server.metrics.disk}%</div>
                      </div>
                      <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${server.metrics.disk}%` }}
                          transition={{ duration: 1 }}
                          className={`h-full rounded-full ${
                            server.metrics.disk < 50 ? 'bg-gradient-to-r from-blue-600 to-blue-400' :
                            server.metrics.disk < 80 ? 'bg-gradient-to-r from-amber-600 to-amber-400' :
                            'bg-gradient-to-r from-rose-600 to-rose-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ServerList;