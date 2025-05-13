import express from 'express';
import cors from 'cors';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import serversConfig from './src/config/servers.json' assert { type: "json" };

const __dirname = dirname(fileURLToPath(import.meta.url));
const METRICS_DIR = join(__dirname, 'data', 'metrics');
const HISTORY_DIR = join(__dirname, 'data', 'history');
const NOTIFICATIONS_FILE = join(__dirname, 'data', 'notifications.json');
const CATEGORIES_FILE = join(__dirname, 'data', 'categories.json');

// Ensure data directories exist
if (!fs.existsSync(join(__dirname, 'data'))) {
  fs.mkdirSync(join(__dirname, 'data'));
}
if (!fs.existsSync(METRICS_DIR)) {
  fs.mkdirSync(METRICS_DIR);
}
if (!fs.existsSync(HISTORY_DIR)) {
  fs.mkdirSync(HISTORY_DIR);
}

// Initialize notifications file if it doesn't exist
if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([]));
}

// Initialize categories with empty servers array
if (!fs.existsSync(CATEGORIES_FILE)) {
  const initialCategories = {
    categories: [
      {
        id: 'vps_backend',
        name: 'VPS Backend',
        servers: []
      }
    ]
  };
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(initialCategories, null, 2));
}

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

// Categories API
app.get('/api/categories', (req, res) => {
  const categories = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  res.json(categories.categories);
});

app.post('/api/categories', (req, res) => {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  const newCategory = {
    id: uuidv4(),
    name: req.body.name,
    servers: []
  };
  data.categories.push(newCategory);
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));
  res.json(newCategory);
});

app.put('/api/categories/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  const category = data.categories.find(c => c.id === req.params.id);
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }
  category.name = req.body.name;
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));
  res.json(category);
});

app.delete('/api/categories/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  data.categories = data.categories.filter(c => c.id !== req.params.id);
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Servers API
app.post('/api/servers', (req, res) => {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  const category = data.categories.find(c => c.id === req.body.categoryId);
  
  if (!category) {
    return res.status(404).json({ error: 'Category not found' });
  }

  const serverId = uuidv4();
  const newServer = {
    id: serverId,
    name: req.body.name,
    location: req.body.location,
    apiKey: `sk_${uuidv4()}`,
    categoryId: category.id
  };

  // Initialize metrics and history files
  const initialMetrics = {
    id: serverId,
    name: newServer.name,
    location: newServer.location,
    status: 'offline',
    metrics: {
      cpu: 0,
      ram: 0,
      disk: 0
    },
    lastUpdated: new Date().toISOString()
  };

  fs.writeFileSync(
    join(METRICS_DIR, `${serverId}.json`),
    JSON.stringify(initialMetrics, null, 2)
  );
  fs.writeFileSync(
    join(HISTORY_DIR, `${serverId}.json`),
    JSON.stringify([])
  );

  category.servers = category.servers || [];
  category.servers.push(newServer);
  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));

  res.json(newServer);
});

app.put('/api/servers/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  let server;
  let category;

  // Find the server and its category
  for (const c of data.categories) {
    const s = c.servers?.find(s => s.id === req.params.id);
    if (s) {
      server = s;
      category = c;
      break;
    }
  }

  if (!server || !category) {
    return res.status(404).json({ error: 'Server not found' });
  }

  // Update server details
  server.name = req.body.name;
  server.location = req.body.location;

  // If category changed, move server to new category
  if (req.body.categoryId !== category.id) {
    const newCategory = data.categories.find(c => c.id === req.body.categoryId);
    if (!newCategory) {
      return res.status(404).json({ error: 'New category not found' });
    }

    // Remove from old category
    category.servers = category.servers?.filter(s => s.id !== server.id);

    // Add to new category
    newCategory.servers = newCategory.servers || [];
    server.categoryId = newCategory.id;
    newCategory.servers.push(server);
  }

  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));
  res.json(server);
});

app.delete('/api/servers/:id', (req, res) => {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  
  // Remove server from category
  for (const category of data.categories) {
    category.servers = category.servers?.filter(s => s.id !== req.params.id);
  }
  
  // Delete metrics and history files
  try {
    fs.unlinkSync(join(METRICS_DIR, `${req.params.id}.json`));
    fs.unlinkSync(join(HISTORY_DIR, `${req.params.id}.json`));
  } catch (error) {
    console.error('Error deleting server files:', error);
  }

  fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(data, null, 2));
  res.json({ success: true });
});

// Get all servers grouped by category
app.get('/api/servers', (req, res) => {
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  const result = {};

  for (const category of data.categories) {
    if (category.servers && category.servers.length > 0) {
      result[category.name] = category.servers.map(server => {
        try {
          const metrics = JSON.parse(
            fs.readFileSync(join(METRICS_DIR, `${server.id}.json`), 'utf8')
          );
          const history = JSON.parse(
            fs.readFileSync(join(HISTORY_DIR, `${server.id}.json`), 'utf8')
          );
          return {
            ...metrics,
            uptime: calculateUptime(server.id),
            uptimeHistory: history
          };
        } catch (error) {
          console.error(`Error loading server data for ${server.id}:`, error);
          return null;
        }
      }).filter(Boolean);
    } else {
      result[category.name] = [];
    }
  }

  res.json(result);
});

// Metrics API
app.post('/api/metrics', (req, res) => {
  const apiKey = req.headers.authorization?.split(' ')[1];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'Missing API key' });
  }
  
  // Find server by API key
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  let server;
  
  for (const category of data.categories) {
    server = category.servers?.find(s => s.apiKey === apiKey);
    if (server) break;
  }
  
  if (!server) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  const { metrics } = req.body;
  
  // Update server metrics
  const metricsFile = join(METRICS_DIR, `${server.id}.json`);
  const currentMetrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
  const updatedMetrics = {
    ...currentMetrics,
    status: 'online',
    metrics,
    lastUpdated: new Date().toISOString()
  };
  
  fs.writeFileSync(metricsFile, JSON.stringify(updatedMetrics, null, 2));
  
  // Update history
  const historyFile = join(HISTORY_DIR, `${server.id}.json`);
  const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
  history.push({
    timestamp: new Date().toISOString(),
    status: 'online',
    metrics
  });
  
  // Keep only last 525600 entries (365 days * 24 hours * 60 minutes)
  if (history.length > 525600) {
    history.splice(0, history.length - 525600);
  }
  
  fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
  
  res.json({ success: true });
});

// Notifications API
app.get('/api/notifications', (req, res) => {
  const notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
  res.json(notifications);
});

app.post('/api/notifications', (req, res) => {
  const notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
  const newNotification = {
    id: uuidv4(),
    ...req.body,
    timestamp: new Date().toISOString(),
    active: true
  };
  
  notifications.push(newNotification);
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  
  res.json(newNotification);
});

app.delete('/api/notifications/:id', (req, res) => {
  const notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
  const notification = notifications.find(n => n.id === req.params.id);
  
  if (notification) {
    notification.active = false;
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
  }
  
  res.json({ success: true });
});

// Helper function to calculate uptime
const calculateUptime = (serverId) => {
  const historyFile = join(HISTORY_DIR, `${serverId}.json`);
  try {
    if (!fs.existsSync(historyFile)) return 0;
    
    const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
    const onlineMinutes = history.filter(entry => entry.status === 'online').length;
    return (onlineMinutes / Math.min(history.length, 525600)) * 100;
  } catch (error) {
    console.error(`Error calculating uptime for server ${serverId}:`, error);
    return 0;
  }
};

// Mark servers as offline if not updated in 2 minutes
setInterval(() => {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);
  
  const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
  let updated = false;
  
  for (const category of data.categories) {
    for (const server of category.servers || []) {
      const metricsFile = join(METRICS_DIR, `${server.id}.json`);
      if (!fs.existsSync(metricsFile)) continue;
      
      const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
      
      if (new Date(metrics.lastUpdated) < twoMinutesAgo && metrics.status !== 'offline') {
        metrics.status = 'offline';
        metrics.metrics = { cpu: 0, ram: 0, disk: 0 };
        fs.writeFileSync(metricsFile, JSON.stringify(metrics, null, 2));
        
        // Update history
        const historyFile = join(HISTORY_DIR, `${server.id}.json`);
        if (fs.existsSync(historyFile)) {
          const history = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
          history.push({
            timestamp: new Date().toISOString(),
            status: 'offline',
            metrics: { cpu: 0, ram: 0, disk: 0 }
          });
          fs.writeFileSync(historyFile, JSON.stringify(history, null, 2));
        }
        
        // Create notification
        const notifications = JSON.parse(fs.readFileSync(NOTIFICATIONS_FILE, 'utf8'));
        const newNotification = {
          id: uuidv4(),
          type: 'error',
          message: `A "${server.name}" szerver offline állapotba került`,
          timestamp: new Date().toISOString(),
          active: true
        };
        notifications.push(newNotification);
        fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2));
        
        updated = true;
      }
    }
  }
}, 30 * 1000);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});