import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/layout/Layout';
import ServerList from './pages/ServerList';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Settings from './pages/Settings';
import Dashboard from './pages/Dashboard';
import ServerDetails from './pages/ServerDetails';
import NotificationManager from './pages/NotificationManager';
import ServerManagement from './pages/ServerManagement';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<ServerList />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/server/:id"
              element={
                <ProtectedRoute>
                  <ServerDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <ProtectedRoute>
                  <NotificationManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/servers"
              element={
                <ProtectedRoute>
                  <ServerManagement />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;