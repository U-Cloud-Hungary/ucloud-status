import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, createNotification, dismissNotification } from '../services/api';
import NotificationBanner from '../components/ui/NotificationBanner';

const NotificationManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'error'>('info');

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setMessage('');
    },
  });

  const dismissMutation = useMutation({
    mutationFn: dismissNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    createMutation.mutate({
      type,
      message: message.trim(),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Értesítések Kezelése</h1>
        <p className="mt-1 text-sm text-slate-400">
          Hozzon létre és kezeljen rendszerszintű értesítéseket
        </p>
      </div>

      {/* Új értesítés létrehozása */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
      >
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-slate-400 mr-2" />
          <h2 className="text-lg font-medium text-white">Új Értesítés</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Típus
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-blue-500 focus:ring-blue-500 bg-slate-800 border-slate-700"
                  name="type"
                  value="info"
                  checked={type === 'info'}
                  onChange={(e) => setType(e.target.value as 'info')}
                />
                <span className="ml-2 text-slate-300">Információ</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-amber-500 focus:ring-amber-500 bg-slate-800 border-slate-700"
                  name="type"
                  value="warning"
                  checked={type === 'warning'}
                  onChange={(e) => setType(e.target.value as 'warning')}
                />
                <span className="ml-2 text-slate-300">Figyelmeztetés</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-rose-500 focus:ring-rose-500 bg-slate-800 border-slate-700"
                  name="type"
                  value="error"
                  checked={type === 'error'}
                  onChange={(e) => setType(e.target.value as 'error')}
                />
                <span className="ml-2 text-slate-300">Hiba</span>
              </label>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-400 mb-1">
              Üzenet
            </label>
            <textarea
              id="message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Írja be az értesítés szövegét..."
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!message.trim() || createMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4 mr-2" />
              Küldés
            </button>
          </div>
        </form>
      </motion.div>

      {/* Aktív értesítések */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-6"
      >
        <h2 className="text-lg font-medium text-white mb-4">Aktív Értesítések</h2>
        <div className="space-y-4">
          <NotificationBanner
            notifications={notifications}
            onDismiss={(id) => dismissMutation.mutate(id)}
          />
          {notifications.length === 0 && (
            <p className="text-slate-400 text-center py-4">
              Nincsenek aktív értesítések
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default NotificationManager;