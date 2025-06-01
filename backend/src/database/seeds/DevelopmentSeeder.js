import { CategoryRepository } from '../../repositories/categoryRepository.js';
import { ServerRepository } from '../../repositories/serverRepository.js';
import { MetricRepository } from '../../repositories/MetricRepository.js';
import { NotificationRepository } from '../../repositories/notificationRepository.js';
import logger from '../../utils/logger.js';

export class DevelopmentSeeder {
    constructor() {
        this.categoryRepo = new CategoryRepository();
        this.serverRepo = new ServerRepository();
        this.metricRepo = new MetricRepository();
        this.notificationRepo = new NotificationRepository();
    }

    async seedDevelopmentData() {
        if (process.env.NODE_ENV !== 'development') {
            logger.info('⏭️ Skipping development seeding - not in development mode');
            return;
        }

        try {
            logger.info('🌱 Starting development data seeding...');

            // Check if data already exists
            const existingCategories = await this.categoryRepo.count();
            if (existingCategories > 1) { // More than just the default category
                logger.info('📊 Development data already exists, skipping seeding');
                return;
            }

            await this._seedCategories();
            await this._seedServers();
            await this._seedMetrics();
            await this._seedNotifications();

            logger.info('✅ Development data seeding completed successfully');
        } catch (error) {
            logger.error('❌ Development data seeding failed:', error);
            throw error;
        }
    }

    async _seedCategories() {
        logger.info('📁 Seeding development categories...');

        const categories = [
            { id: 'frontend_servers', name: 'Frontend Servers' },
            { id: 'backend_servers', name: 'Backend Servers' },
            { id: 'database_servers', name: 'Database Servers' },
            { id: 'monitoring_servers', name: 'Monitoring Servers' },
            { id: 'game_servers', name: 'Game Servers' }
        ];

        for (const categoryData of categories) {
            try {
                await this.categoryRepo.createCategory(categoryData);
                logger.info(`  ✓ Created category: ${categoryData.name}`);
            } catch (error) {
                logger.warn(`  ⚠️ Failed to create category ${categoryData.name}:`, error.message);
            }
        }
    }

    async _seedServers() {
        logger.info('🖥️ Seeding development servers...');

        const servers = [
            // Frontend Servers
            {
                id: 'srv_frontend_01',
                name: 'Web Frontend #1',
                location: 'Budapest, HU',
                apiKey: 'sk_dev_frontend_01_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'frontend_servers'
            },
            {
                id: 'srv_frontend_02',
                name: 'Web Frontend #2',
                location: 'Vienna, AT',
                apiKey: 'sk_dev_frontend_02_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'frontend_servers'
            },
            // Backend Servers
            {
                id: 'srv_backend_01',
                name: 'API Server #1',
                location: 'Frankfurt, DE',
                apiKey: 'sk_dev_backend_01_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'backend_servers'
            },
            {
                id: 'srv_backend_02',
                name: 'API Server #2',
                location: 'London, UK',
                apiKey: 'sk_dev_backend_02_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'backend_servers'
            },
            {
                id: 'srv_backend_03',
                name: 'Auth Service',
                location: 'Paris, FR',
                apiKey: 'sk_dev_auth_01_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'backend_servers'
            },
            // Database Servers
            {
                id: 'srv_db_primary',
                name: 'Primary Database',
                location: 'Frankfurt, DE',
                apiKey: 'sk_dev_db_primary_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'database_servers'
            },
            {
                id: 'srv_db_replica',
                name: 'Read Replica',
                location: 'Amsterdam, NL',
                apiKey: 'sk_dev_db_replica_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'database_servers'
            },
            // Monitoring Servers
            {
                id: 'srv_monitoring_01',
                name: 'Grafana Dashboard',
                location: 'Zurich, CH',
                apiKey: 'sk_dev_monitoring_01_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'monitoring_servers'
            },
            // Game Servers
            {
                id: 'srv_game_01',
                name: 'Minecraft Server #1',
                location: 'Prague, CZ',
                apiKey: 'sk_dev_game_01_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'game_servers'
            },
            {
                id: 'srv_game_02',
                name: 'CS2 Server',
                location: 'Warsaw, PL',
                apiKey: 'sk_dev_game_02_' + crypto.randomUUID().slice(0, 8),
                categoryId: 'game_servers'
            }
        ];

        for (const serverData of servers) {
            try {
                await this.serverRepo.createServer(serverData);
                logger.info(`  ✓ Created server: ${serverData.name} (${serverData.location})`);
            } catch (error) {
                logger.warn(`  ⚠️ Failed to create server ${serverData.name}:`, error.message);
            }
        }
    }

    async _seedMetrics() {
        logger.info('📊 Seeding development metrics...');

        const servers = await this.serverRepo.findAll();
        const statusOptions = ['online', 'offline', 'online', 'online']; // 75% online probability

        for (const server of servers) {
            try {
                // Create metrics for the last 24 hours (every 15 minutes = 96 entries)
                const now = new Date();
                const metricsCount = 96;
                const intervalMinutes = 15;

                for (let i = metricsCount - 1; i >= 0; i--) {
                    const timestamp = new Date(now.getTime() - i * intervalMinutes * 60 * 1000);
                    const status = this._getRandomElement(statusOptions);

                    let metrics;
                    if (status === 'online') {
                        metrics = {
                            cpu: this._generateRealisticUsage(30, 80, server.name.includes('Database') ? 10 : 0),
                            ram: this._generateRealisticUsage(40, 85, server.name.includes('Game') ? 15 : 0),
                            disk: this._generateRealisticUsage(20, 70, 0)
                        };
                    } else {
                        metrics = { cpu: 0, ram: 0, disk: 0 };
                    }

                    await this.metricRepo.createOrUpdateMetric(server.id, {
                        id: crypto.randomUUID(),
                        status,
                        ...metrics,
                        lastUpdated: timestamp
                    });
                }

                logger.info(`  ✓ Created metrics for: ${server.name} (${metricsCount} entries)`);
            } catch (error) {
                logger.warn(`  ⚠️ Failed to create metrics for ${server.name}:`, error.message);
            }
        }
    }

    async _seedNotifications() {
        logger.info('🔔 Seeding development notifications...');

        const notifications = [
            {
                type: 'error',
                message: 'High CPU usage detected on API Server #1 (Frankfurt, DE)',
                active: true,
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
            },
            {
                type: 'warning',
                message: 'Memory usage above 85% on Primary Database server',
                active: true,
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
            },
            {
                type: 'info',
                message: 'Scheduled maintenance completed on Read Replica server',
                active: false,
                timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
            },
            {
                type: 'success',
                message: 'All frontend servers are operating normally',
                active: true,
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
            },
            {
                type: 'error',
                message: 'CS2 Server (Warsaw, PL) went offline due to network issues',
                active: true,
                timestamp: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
            },
            {
                type: 'warning',
                message: 'Disk space running low on Grafana Dashboard server',
                active: true,
                timestamp: new Date(Date.now() - 45 * 60 * 1000) // 45 minutes ago
            },
            {
                type: 'info',
                message: 'New monitoring dashboard deployed successfully',
                active: false,
                timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
            },
            {
                type: 'success',
                message: 'Minecraft Server #1 performance optimized - latency improved by 20%',
                active: false,
                timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
            }
        ];

        for (const notificationData of notifications) {
            try {
                await this.notificationRepo.createNotification({
                    id: crypto.randomUUID(),
                    ...notificationData
                });
                logger.info(`  ✓ Created notification: ${notificationData.type} - ${notificationData.message.slice(0, 50)}...`);
            } catch (error) {
                logger.warn(`  ⚠️ Failed to create notification:`, error.message);
            }
        }
    }

    // Helper methods for realistic data generation
    _getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    _generateRealisticUsage(min, max, boost = 0) {
        // Generate more realistic usage patterns with some randomness
        const base = min + Math.random() * (max - min);
        const variation = (Math.random() - 0.5) * 10; // ±5% variation
        const result = Math.max(0, Math.min(100, base + variation + boost));

        return Math.round(result * 100) / 100; // Round to 2 decimal places
    }

    // Cleanup method for development
    async cleanupDevelopmentData() {
        if (process.env.NODE_ENV !== 'development') {
            logger.warn('⚠️ Cannot cleanup - not in development mode');
            return;
        }

        try {
            logger.info('🧹 Cleaning up development data...');

            // Delete in reverse order due to foreign key constraints
            const servers = await this.serverRepo.findAll();

            for (const server of servers) {
                if (server.id.startsWith('srv_')) { // Only delete dev servers
                    await this.serverRepo.deleteServer(server.id);
                }
            }

            // Delete dev categories
            const categories = await this.categoryRepo.findAll();
            for (const category of categories) {
                if (category.id !== 'vps_backend' && category.id.includes('_')) {
                    await this.categoryRepo.deleteCategory(category.id);
                }
            }

            // Delete all notifications in dev
            const notifications = await this.notificationRepo.findAll(true);
            for (const notification of notifications) {
                await this.notificationRepo.deleteNotification(notification.id);
            }

            logger.info('✅ Development data cleanup completed');
        } catch (error) {
            logger.error('❌ Development data cleanup failed:', error);
            throw error;
        }
    }
}