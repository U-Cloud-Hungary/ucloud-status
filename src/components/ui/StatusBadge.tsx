import React from 'react';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';

interface StatusBadgeProps {
  status: 'online' | 'degraded' | 'offline';
  animate?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  animate = true,
  className 
}) => {
  const statusConfig = {
    online: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500',
    },
    degraded: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
    },
    offline: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      dot: 'bg-rose-500',
    }
  };

  // Return null if status is not valid
  if (!statusConfig[status]) {
    console.warn(`StatusBadge: Invalid status "${status}" provided`);
    return null;
  }

  const config = statusConfig[status];
  
  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full px-3 py-1',
      config.bg,
      className
    )}>
      <motion.span 
        className={cn(
          'relative flex h-2 w-2 rounded-full',
          config.dot
        )}
      >
        {animate && status === 'online' && (
          <motion.span 
            className="absolute inline-flex h-full w-full rounded-full opacity-75"
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.8, 0.2, 0.8]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              repeatType: "loop" 
            }}
            style={{
              backgroundColor: 'currentColor'
            }}
          />
        )}
      </motion.span>
      <span className={cn('text-sm font-medium', config.text)}>
        {status === 'online' ? 'Online' : 
         status === 'degraded' ? 'Részleges' : 
         'Offline'}
      </span>
    </div>
  );
};

export default StatusBadge;