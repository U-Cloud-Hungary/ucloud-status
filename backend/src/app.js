import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { NODE_ENV } from './config/environment.js';
import { errorHandler } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

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

// API Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/servers', serverRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint with database status
app.get('/api/health', async (req, res) => {
    try {
        // Basic health check
        const health = {
            status: 'OK',
            timestamp: new Date().toISOString(),
            environment: NODE_ENV,
            version: process.env.npm_package_version || '1.0.0'
        };

        // Add database health if available
        try {
            const dbConnection = await import('./database/database.js');
            const dbHealth = await dbConnection.default.healthCheck();
            health.database = dbHealth;
        } catch (dbError) {
            health.database = { status: 'unavailable', error: dbError.message };
        }

        res.json(health);
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({
            status: 'ERROR',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

// Database health endpoint
app.get('/api/health/database', async (req, res) => {
    try {
        const dbConnection = await import('./database/database.js');
        const health = await dbConnection.default.healthCheck();

        if (health.status === 'healthy') {
            res.json(health);
        } else {
            res.status(503).json(health);
        }
    } catch (error) {
        logger.error('Database health check failed:', error);
        res.status(503).json({
            status: 'error',
            connected: false,
            error: error.message
        });
    }
});

// Development data management endpoints
if (NODE_ENV === 'development') {
    app.post('/api/dev/reset-data', async (req, res) => {
        try {
            logger.info('🔄 Manual development data reset requested');
            const { databaseInitializer } = await import('./database/initDatabase.js');
            await databaseInitializer.resetDevelopmentData();

            res.json({
                success: true,
                message: 'Development data reset successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Development data reset failed:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });

    app.delete('/api/dev/cleanup-data', async (req, res) => {
        try {
            logger.info('🧹 Manual development data cleanup requested');
            const { DevelopmentSeeder } = await import('./database/DevelopmentSeeder.js');
            const devSeeder = new DevelopmentSeeder();
            await devSeeder.cleanupDevelopmentData();

            res.json({
                success: true,
                message: 'Development data cleaned up successfully',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            logger.error('Development data cleanup failed:', error);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    });
}

// Serve static files in production
if (NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(join(__dirname, '../dist', 'index.html'));
    });
}

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;