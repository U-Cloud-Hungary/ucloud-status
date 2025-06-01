import databaseConnection from './database.js';
import { DevelopmentSeeder } from './seeds/DevelopmentSeeder.js';
import logger from '../utils/logger.js';

export class DatabaseInitializer {
    constructor() {
        this.devSeeder = new DevelopmentSeeder();
    }

    async initialize() {
        try {
            logger.info('🔄 Initializing database...');

            // 1. Connect to database
            await this._connectToDatabase();

            // 2. Run migrations (Prisma will handle this)
            await this._runMigrations();

            // 4. Seed development data if in dev mode
            await this._seedDevelopmentData();

            // 5. Verify database health
            await this._verifyDatabaseHealth();

            logger.info('✅ Database initialization completed successfully');
            return true;
        } catch (error) {
            logger.error('❌ Database initialization failed:', error);
            throw error;
        }
    }

    async cleanup() {
        try {
            await databaseConnection.disconnect();
            logger.info('Database connection closed');
        } catch (error) {
            logger.error('Error closing database connection:', error);
        }
    }

    async resetDevelopmentData() {
        if (process.env.NODE_ENV !== 'development') {
            logger.warn('⚠️ Cannot reset data - not in development mode');
            return;
        }

        try {
            logger.info('🔄 Resetting development data...');

            await this.devSeeder.cleanupDevelopmentData();
            await this.devSeeder.seedDevelopmentData();

            logger.info('✅ Development data reset completed');
        } catch (error) {
            logger.error('❌ Development data reset failed:', error);
            throw error;
        }
    }

    // Private methods
    async _connectToDatabase() {
        try {
            await databaseConnection.connect();
            logger.info('Database connection established');
        } catch (error) {
            logger.error('Failed to connect to database:', error);
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    async _runMigrations() {
        try {
            // Prisma will handle migrations automatically with migrate deploy
            // This is called in the Docker CMD: npx prisma migrate deploy
            logger.info('Database migrations handled by Prisma');
        } catch (error) {
            logger.error('Migration failed:', error);
            throw error;
        }
    }

    async _seedDevelopmentData() {
        try {
            if (process.env.NODE_ENV === 'development') {
                await this.devSeeder.seedDevelopmentData();
                logger.info('Development data seeding completed');
            }
        } catch (error) {
            logger.error('Development data seeding failed:', error);
            // Don't throw here - dev seeding failure shouldn't prevent app startup
            logger.warn('Continuing without development data...');
        }
    }

    async _verifyDatabaseHealth() {
        try {
            const healthCheck = await databaseConnection.healthCheck();

            if (healthCheck.status !== 'healthy') {
                throw new Error(`Database health check failed: ${healthCheck.error}`);
            }

            logger.info('Database health check passed');
        } catch (error) {
            logger.error('Database health check failed:', error);
            throw error;
        }
    }
}

// Export singleton instance
export const databaseInitializer = new DatabaseInitializer();

// Graceful shutdown handler
process.on('SIGINT', async () => {
    logger.info('Received SIGINT, closing database connection...');
    await databaseInitializer.cleanup();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, closing database connection...');
    await databaseInitializer.cleanup();
    process.exit(0);
});