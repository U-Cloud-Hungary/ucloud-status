import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import Layout from './components/layout/Layout.tsx';
import ServerList from './pages/ServerList.tsx';
import Login from './pages/Login.tsx';
import ProtectedRoute from './components/auth/ProtectedRoute.tsx';
import Settings from './pages/Settings.tsx';
import Dashboard from './pages/Dashboard.tsx';
import ServerDetails from './pages/ServerDetails.tsx';
import NotificationManager from './pages/NotificationManager.tsx';
import ServerManagement from './pages/ServerManagement.tsx';

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