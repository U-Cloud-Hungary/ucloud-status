import React from 'react';
import { cn, getStatusBgColor } from '../../lib/utils';
import { motion } from 'framer-motion';

interface UptimeBarProps {
  data: {
    date: string;
    status: 'online' | 'degraded' | 'offline';
  }[];
  days?: number;
  className?: string;
  animate?: boolean;
}

const UptimeBar: React.FC<UptimeBarProps> = ({ 
  data, 
  days = 30, 
  className,
  animate = true
}) => {
  // Ensure we have the correct number of days
  const displayData = data.slice(0, days);
  
  return (
    <div className={cn('flex items-center space-x-0.5', className)}>
      {displayData.map((day, index) => (
        <motion.div
          key={`${day.date}-${index}`}
          initial={animate ? { scaleY: 0 } : { scaleY: 1 }}
          animate={{ scaleY: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: animate ? index * 0.01 : 0, 
            ease: "easeOut" 
          }}
          className={cn(
            'h-6 w-1 rounded-sm',
            getStatusBgColor(day.status)
          )}
          title={`${day.date}: ${day.status}`}
        />
      ))}
    </div>
  );
};

export default UptimeBar;