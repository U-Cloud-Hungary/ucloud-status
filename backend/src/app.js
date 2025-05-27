import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { NODE_ENV } from './config/environment.js';
import logger from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeDirectories } from './utils/fileHelper.js';
import { startServerStatusChecker } from './jobs/serverStatusChecker.js';

// Routes
import categoryRoutes from './routes/categoryRoutes.js';
import serverRoutes from './routes/serverRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(join(__dirname, '../dist')));

// Initialize data directories
initializeDirectories();

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
    });
});

// Serve static files in production
if (NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, '../dist', 'index.html'));
    });
}

// Error handling middleware (must be last)
app.use(errorHandler);

// Start background jobs
startServerStatusChecker();

export default app;
