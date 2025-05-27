import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Lock, UserCircle, Globe, Server, Save } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import serversConfig from '../config/servers.json';

const Settings: React.FC = () => {
  const [notificationSettings, setNotificationSettings] = useState({
    serverDown: true,
    resourceUsage: false,
    weeklyReport: true,
    alertThreshold: 80
  });

  const [serverSettings, setServerSettings] = useState({
    checkInterval: 60,
    offlineThreshold: 2,
    retentionDays: 365
  });

  const [apiSettings, setApiSettings] = useState({
    rateLimit: 100,
    timeout: 30
  });

  const handleNotificationSave = () => {
    // Itt mentjük el a notification beállításokat
    console.log('Mentés:', notificationSettings);
  };

  const handleServerSettingsSave = () => {
    // Itt mentjük el a szerver beállításokat
    console.log('Mentés:', serverSettings);
  };

  const handleApiSettingsSave = () => {
    // Itt mentjük el az API beállításokat
    console.log('Mentés:', apiSettings);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Beállítások</h1>
        <p className="mt-1 text-sm text-slate-400">
          Kezelje fiókját és megfigyelési beállításait
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 p-4">
            <nav className="space-y-1">
              <a
                href="#notifications"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-blue-500/10 text-blue-400"
              >
                <Bell className="mr-3 h-5 w-5" />
                <span>Értesítések</span>
              </a>
              <a
                href="#servers"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800/50"
              >
                <Server className="mr-3 h-5 w-5" />
                <span>Szerver Beállítások</span>
              </a>
              <a
                href="#api"
                className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-slate-300 hover:bg-slate-800/50"
              >
                <Globe className="mr-3 h-5 w-5" />
                <span>API Hozzáférés</span>
              </a>
            </nav>
          </div>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          {/* Értesítések */}
          <motion.section
            id="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 border-b border-slate-800/50">
              <h2 className="text-lg font-medium text-white">Értesítési Beállítások</h2>
              <p className="mt-1 text-sm text-slate-400">
                Állítsa be az értesítési preferenciáit
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="server-down"
                        name="server-down"
                        type="checkbox"
                        checked={notificationSettings.serverDown}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          serverDown: e.target.checked
                        })}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-700 rounded bg-slate-800"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="server-down" className="text-sm font-medium text-white">
                        Szerver Leállás Értesítések
                      </label>
                      <p className="text-sm text-slate-400">
                        Azonnali értesítés, ha bármely szerver leáll
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="resource-usage"
                        name="resource-usage"
                        type="checkbox"
                        checked={notificationSettings.resourceUsage}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          resourceUsage: e.target.checked
                        })}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-700 rounded bg-slate-800"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="resource-usage" className="text-sm font-medium text-white">
                        Erőforrás Használat Értesítések
                      </label>
                      <p className="text-sm text-slate-400">
                        Értesítés, ha a CPU, RAM vagy lemezhasználat meghaladja a határértéket
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="weekly-report"
                        name="weekly-report"
                        type="checkbox"
                        checked={notificationSettings.weeklyReport}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          weeklyReport: e.target.checked
                        })}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-slate-700 rounded bg-slate-800"
                      />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="weekly-report" className="text-sm font-medium text-white">
                        Heti Jelentések
                      </label>
                      <p className="text-sm text-slate-400">
                        Heti összefoglaló a szerverek teljesítményéről
                      </p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="alert-threshold" className="block text-sm font-medium text-white">
                    Riasztási Határérték (%)
                  </label>
                  <input
                    type="number"
                    name="alert-threshold"
                    id="alert-threshold"
                    min="50"
                    max="95"
                    value={notificationSettings.alertThreshold}
                    onChange={(e) => setNotificationSettings({
                      ...notificationSettings,
                      alertThreshold: parseInt(e.target.value)
                    })}
                    className="mt-1 block w-full bg-slate-800/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                  />
                  <p className="mt-1 text-sm text-slate-400">
                    Értesítés küldése, ha az erőforrás-használat meghaladja ezt az értéket
                  </p>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-slate-800/30 text-right sm:px-6">
              <button
                type="button"
                onClick={handleNotificationSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </button>
            </div>
          </motion.section>

          {/* Szerver Beállítások */}
          <motion.section
            id="servers"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 border-b border-slate-800/50">
              <h2 className="text-lg font-medium text-white">Szerver Beállítások</h2>
              <p className="mt-1 text-sm text-slate-400">
                Konfigurálja a szerverek megfigyelési beállításait
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label htmlFor="check-interval" className="block text-sm font-medium text-white">
                  Ellenőrzési Időköz (másodperc)
                </label>
                <input
                  type="number"
                  name="check-interval"
                  id="check-interval"
                  min="30"
                  max="300"
                  value={serverSettings.checkInterval}
                  onChange={(e) => setServerSettings({
                    ...serverSettings,
                    checkInterval: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full bg-slate-800/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="offline-threshold" className="block text-sm font-medium text-white">
                  Offline Határérték (perc)
                </label>
                <input
                  type="number"
                  name="offline-threshold"
                  id="offline-threshold"
                  min="1"
                  max="10"
                  value={serverSettings.offlineThreshold}
                  onChange={(e) => setServerSettings({
                    ...serverSettings,
                    offlineThreshold: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full bg-slate-800/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="retention-days" className="block text-sm font-medium text-white">
                  Adatmegőrzés (nap)
                </label>
                <input
                  type="number"
                  name="retention-days"
                  id="retention-days"
                  min="30"
                  max="365"
                  value={serverSettings.retentionDays}
                  onChange={(e) => setServerSettings({
                    ...serverSettings,
                    retentionDays: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full bg-slate-800/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                />
              </div>
            </div>
            
            <div className="px-4 py-3 bg-slate-800/30 text-right sm:px-6">
              <button
                type="button"
                onClick={handleServerSettingsSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </button>
            </div>
          </motion.section>

          {/* API Beállítások */}
          <motion.section
            id="api"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-slate-900/50 backdrop-blur-lg rounded-lg border border-slate-800/50 overflow-hidden"
          >
            <div className="px-4 py-5 sm:px-6 border-b border-slate-800/50">
              <h2 className="text-lg font-medium text-white">API Beállítások</h2>
              <p className="mt-1 text-sm text-slate-400">
                Kezelje az API hozzáférési beállításokat
              </p>
            </div>
            
            <div className="px-4 py-5 sm:p-6 space-y-6">
              <div>
                <label htmlFor="rate-limit" className="block text-sm font-medium text-white">
                  Rate Limit (kérés/perc)
                </label>
                <input
                  type="number"
                  name="rate-limit"
                  id="rate-limit"
                  min="10"
                  max="1000"
                  value={apiSettings.rateLimit}
                  onChange={(e) => setApiSettings({
                    ...apiSettings,
                    rateLimit: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full bg-slate-800/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                />
              </div>

              <div>
                <label htmlFor="timeout" className="block text-sm font-medium text-white">
                  Időtúllépés (másodperc)
                </label>
                <input
                  type="number"
                  name="timeout"
                  id="timeout"
                  min="5"
                  max="60"
                  value={apiSettings.timeout}
                  onChange={(e) => setApiSettings({
                    ...apiSettings,
                    timeout: parseInt(e.target.value)
                  })}
                  className="mt-1 block w-full bg-slate-800/50 border border-slate-700 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-white"
                />
              </div>

              <div className="bg-slate-800/30 rounded-md p-4">
                <h3 className="text-sm font-medium text-white mb-2">API Kulcsok</h3>
                <div className="space-y-2">
                  {serversConfig.servers.map((server) => (
                    <div key={server.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{server.name}</span>
                      <code className="text-xs bg-slate-800 rounded px-2 py-1 text-slate-300">
                        {server.apiKey}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-slate-800/30 text-right sm:px-6">
              <button
                type="button"
                onClick={handleApiSettingsSave}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Save className="h-4 w-4 mr-2" />
                Mentés
              </button>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default Settings;