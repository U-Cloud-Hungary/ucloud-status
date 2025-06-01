import { ServerStatus, Notification, Category, Server } from '../types';

// Category Management
export const fetchCategories = async (): Promise<Category[]> => {
  const response = await fetch('/api/categories');
  return response.json();
};

export const createCategory = async (category: { name: string }): Promise<Category> => {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  return response.json();
};

export const updateCategory = async (category: { id: string; name: string }): Promise<Category> => {
  const response = await fetch(`/api/categories/${category.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(category),
  });
  return response.json();
};

export const deleteCategory = async (id: string): Promise<void> => {
  await fetch(`/api/categories/${id}`, {
    method: 'DELETE',
  });
};

// Server Management
export const createServer = async (server: { name: string; location: string; categoryId: string }): Promise<Server> => {
  const response = await fetch('/api/servers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(server),
  });
  return response.json();
};

export const updateServer = async (server: { id: string; name: string; location: string; categoryId: string }): Promise<Server> => {
  const response = await fetch(`/api/servers/${server.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(server),
  });
  return response.json();
};

export const deleteServer = async (id: string): Promise<void> => {
  await fetch(`/api/servers/${id}`, {
    method: 'DELETE',
  });
};

// Server Status
export const fetchServers = async (): Promise<{ [key: string]: ServerStatus[] }> => {
  const response = await fetch('/api/servers');
  return response.json();
};

export const fetchServerDetails = async (id: string): Promise<ServerStatus> => {
  const response = await fetch(`/api/servers`);
  const data = await response.json();
  
  for (const category of Object.values(data)) {
    const server = category.find((s: ServerStatus) => s.id === id);
    if (server) return server;
  }
  
  throw new Error('Server not found');
};

// Notifications
export const fetchNotifications = async (): Promise<Notification[]> => {
  const response = await fetch('/api/notifications');
  return response.json();
};

export const createNotification = async (notification: Omit<Notification, 'id' | 'timestamp' | 'active'>): Promise<Notification> => {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(notification),
  });
  return response.json();
};

export const dismissNotification = async (id: string): Promise<void> => {
  await fetch(`/api/notifications/${id}`, {
    method: 'DELETE',
  });
};