process.on('SIGINT', async () => {
    logger.info('Received SIGINT, closing database connection...');
    await databaseConnection.disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, closing database connection...');
    await databaseConnection.disconnect();
    process.exit(0);
});

process.on('beforeExit', async () => {
    logger.info('Process beforeExit, closing database connection...');
    await databaseConnection.disconnect();
});import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger.js';

class DatabaseConnection {
    constructor() {
        this.prisma = null;
        this.isConnected = false;
    }

    getInstance() {
        if (!this.prisma) {
            this.prisma = new PrismaClient({
                log: process.env.NODE_ENV === 'development'
                    ? []
                    : ['error'],
                errorFormat: 'pretty',
                datasources: {
                    db: {
                        url: process.env.DATABASE_URL,
                    },
                },
            });

            // Connection event handlers (Prisma 5.0+ compatible)
            // Note: beforeExit is not supported in Prisma 5.0+, using process events instead
        }

        return this.prisma;
    }

    async connect() {
        try {
            const prisma = this.getInstance();
            await prisma.$connect();
            this.isConnected = true;
            logger.info('✅ Database connected successfully');
            return prisma;
        } catch (error) {
            logger.error('❌ Database connection failed:', error);
            throw new Error(`Database connection failed: ${error.message}`);
        }
    }

    async disconnect() {
        try {
            if (this.prisma) {
                await this.prisma.$disconnect();
                this.isConnected = false;
                logger.info('Database disconnected successfully');
            }
        } catch (error) {
            logger.error('Error disconnecting from database:', error);
        }
    }

    async healthCheck() {
        try {
            const prisma = this.getInstance();
            await prisma.$queryRaw`SELECT 1`;
            return { status: 'healthy', connected: true };
        } catch (error) {
            logger.error('Database health check failed:', error);
            return { status: 'unhealthy', connected: false, error: error.message };
        }
    }

    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            hasInstance: !!this.prisma
        };
    }
}

const databaseConnection = new DatabaseConnection();

export default databaseConnection;
export const db = databaseConnection.getInstance();