export interface ServerStatus {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'degraded' | 'offline';
  metrics: {
    cpu: number;
    ram: number;
    disk: number;
  };
  lastUpdated: string;
  uptime?: number;
}

export type ThemeMode = 'dark' | 'light';

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error';
  message: string;
  timestamp: string;
  active: boolean;
}

export interface Category {
  id: string;
  name: string;
  servers?: Server[];
}

export interface Server {
  id: string;
  name: string;
  location: string;
  categoryId: string;
  apiKey: string;
}