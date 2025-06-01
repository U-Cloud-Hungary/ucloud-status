import app from './src/app.js';
import { PORT, NODE_ENV } from './src/config/environment.js';
import { databaseInitializer } from './src/database/DatabaseInitializer.js';
import { startServerStatusChecker } from './src/jobs/serverStatusChecker.js';
import logger from './src/utils/logger.js';
import net from 'net';

// Helper function to check port availability
async function checkPortAvailability(port) {
    return new Promise((resolve) => {
        const server = net.createServer();

        server.listen(port, '0.0.0.0', () => {
            server.once('close', () => {
                resolve(true);
            });
            server.close();
        });

        server.on('error', (err) => {
            resolve(false);
        });
    });
}
// Application startup function
async function startApplication() {
    try {
        logger.info('🚀 Starting UCloud Status Backend...');

        // 1. Initialize database
        logger.info('📊 Initializing database...');
        await databaseInitializer.initialize();

        // 2. Check if port is available
        const isPortAvailable = await checkPortAvailability(PORT);
        if (!isPortAvailable) {
            logger.error(`❌ Port ${PORT} is already in use`);
            logger.info('💡 Suggestions:');
            logger.info('   1. Stop any running instances: docker-compose down');
            logger.info('   2. Change the port in environment variables');
            logger.info('   3. Kill the process using this port: lsof -ti:3001 | xargs kill -9');
            process.exit(1);
        }

        // 3. Start the Express server
        const server = app.listen(PORT, '0.0.0.0', () => {
            logger.info(`✅ Server running on port ${PORT}`);
            logger.info(`🌍 Environment: ${NODE_ENV}`);
            logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);

            if (NODE_ENV === 'development') {
                logger.info(`🛠️  Development endpoints:`);
                logger.info(`   POST /api/dev/reset-data - Reset development data`);
                logger.info(`   DELETE /api/dev/cleanup-data - Cleanup development data`);
            }
        });

        // Handle server startup errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                logger.error(`❌ Port ${PORT} is already in use`);
                logger.info('💡 Try running: docker-compose down && docker-compose up');
                process.exit(1);
            } else {
                logger.error('❌ Server startup error:', error);
                throw error;
            }
        });

        // 4. Start background jobs after server is running
        logger.info('⚙️ Starting background jobs...');
        startServerStatusChecker();

        // Graceful shutdown handling
        const gracefulShutdown = async (signal) => {
            logger.info(`📤 Received ${signal}. Starting graceful shutdown...`);

            server.close(() => {
                logger.info('📪 HTTP server closed');
            });

            try {
                await databaseInitializer.cleanup();
                logger.info('🔌 Database connections closed');
            } catch (error) {
                logger.error('Error during database cleanup:', error);
            }

            logger.info('✅ Graceful shutdown completed');
            process.exit(0);
        };

        // Signal handlers
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));

        // Error handlers
        process.on('uncaughtException', (error) => {
            logger.error('💥 Uncaught exception:', error);
            gracefulShutdown('uncaughtException');
        });

        process.on('unhandledRejection', (reason, promise) => {
            logger.error('💥 Unhandled rejection at:', promise, 'reason:', reason);
            gracefulShutdown('unhandledRejection');
        });

        return server;

    } catch (error) {
        logger.error('❌ Failed to start application:', error);

        try {
            await databaseInitializer.cleanup();
        } catch (cleanupError) {
            logger.error('Error during cleanup:', cleanupError);
        }

        process.exit(1);
    }
}

// Start the application
startApplication().catch((error) => {
    logger.error('💥 Critical startup error:', error);
    process.exit(1);
});