import React from 'react';
import { motion } from 'framer-motion';
import { Server } from 'lucide-react';
import { ServerStatus } from '../../types';
import { cn, formatRelativeTime } from '../../lib/utils.ts';
import StatusBadge from './StatusBadge.tsx';
import CircularProgress from './CircularProgress.tsx';

interface ServerCardProps {
  server: ServerStatus;
  className?: string;
}

const ServerCard: React.FC<ServerCardProps> = ({ server, className }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50',
        'hover:border-blue-500/30 transition-all duration-300',
        'relative overflow-hidden group',
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
              <Server className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-white mb-1">{server.name}</h3>
              <p className="text-sm text-slate-400">{server.location}</p>
            </div>
          </div>
          <StatusBadge status={server.status} />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <CircularProgress value={server.metrics?.cpu ?? 0} size={80} label="CPU" />
          <CircularProgress value={server.metrics?.ram ?? 0} size={80} label="RAM" />
          <CircularProgress value={server.metrics?.disk ?? 0} size={80} label="SSD" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
          <p className="text-sm text-slate-400">
            Frissítve: {formatRelativeTime(server.lastUpdated)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ServerCard;