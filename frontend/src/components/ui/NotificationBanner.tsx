import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { Notification } from '../../types';
import { formatRelativeTime } from '../../lib/utils.ts';

interface NotificationBannerProps {
  notifications: Notification[];
  onDelete?: (id: string) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ 
  notifications,
  onDelete 
}) => {
  const activeNotifications = notifications.filter(n => n.active);
  
  if (activeNotifications.length === 0) return null;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-5 w-5 text-rose-400" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      default:
        return <Info className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBgColor = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/20';
      default:
        return 'bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="space-y-4">
        {activeNotifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${getBgColor(notification.type)} border backdrop-blur-lg rounded-lg p-4`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="ml-3 w-0 flex-1">
                <p className="text-sm text-white">
                  {notification.message}
                </p>
                <p className="mt-1 text-sm text-slate-400">
                  {formatRelativeTime(notification.timestamp)}
                </p>
              </div>
              {onDelete && (
                <button
                  onClick={() => onDelete(notification.id)}
                  className="ml-4 flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">Delete</span>
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default NotificationBanner;