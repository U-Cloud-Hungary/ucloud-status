import React from 'react';
import { motion } from 'framer-motion';
import { cn, getMetricColor } from '../../lib/utils.ts';

interface CircularProgressProps {
  value: number;
  size?: number;
  thickness?: number;
  label?: string;
  className?: string;
  animate?: boolean;
}

const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 120,
  thickness = 6,
  label,
  className,
  animate = true,
}) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressValue = Math.min(100, Math.max(0, value));
  const offset = circumference - (progressValue / 100) * circumference;
  
  const colorClass = getMetricColor(value);

  return (
    <div className={cn('relative flex flex-col items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={thickness}
          className="text-slate-800"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={thickness}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: animate ? offset : circumference }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={colorClass}
          strokeLinecap="round"
        />
      </svg>
      
      {/* Value text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className={cn('text-lg font-medium', colorClass)}>
          {Math.round(progressValue)}%
        </span>
        {label && (
          <span className="text-xs text-slate-400 font-medium mt-1">{label}</span>
        )}
      </div>
    </div>
  );
};

export default CircularProgress;