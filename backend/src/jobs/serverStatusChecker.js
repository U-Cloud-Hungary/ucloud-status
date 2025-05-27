import { ServerService } from '../services/serverService.js';
import { MetricsService } from '../services/metricsService.js';
import { NotificationService } from '../services/notificationService.js';
import { SERVER_OFFLINE_TIMEOUT } from '../config/environment.js';
import logger from '../utils/logger.js';

export class ServerStatusChecker {
    constructor() {
        this.serverService = new ServerService();
        this.metricsService = new MetricsService();
        this.notificationService = new NotificationService();
        this.intervalId = null;
    }

    start(intervalMs = 30000) { // Default: 30 seconds
        if (this.intervalId) {
            logger.warn('Server status checker is already running');
            return;
        }

        logger.info(`Starting server status checker with ${intervalMs}ms interval`);

        this.intervalId = setInterval(async () => {
            try {
                await this.checkServerStatuses();
            } catch (error) {
                logger.error('Error in server status checker:', error);
            }
        }, intervalMs);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            logger.info('Stopped server status checker');
        }
    }

    async checkServerStatuses() {
        try {
            const servers = await this.serverService.serverRepository.findAll();
            const timeoutMs = SERVER_OFFLINE_TIMEOUT * 60 * 1000; // Convert minutes to milliseconds
            const cutoffTime = new Date(Date.now() - timeoutMs);

            for (const server of servers) {
                try {
                    const metrics = await this.metricsService.getServerMetrics(server.id);
                    const lastUpdated = new Date(metrics.lastUpdated);

                    if (lastUpdated < cutoffTime && metrics.status !== 'offline') {
                        logger.info(`Setting server ${server.name} offline due to timeout`);

                        await this.metricsService.setServerOffline(server.id);
                        await this.notificationService.createServerOfflineNotification(server.name);
                    }
                } catch (error) {
                    logger.error(`Error checking status for server ${server.id}:`, error);
                }
            }
        } catch (error) {
            logger.error('Error checking server statuses:', error);
            throw error;
        }
    }
}

let serverStatusChecker;

export const startServerStatusChecker = () => {
    if (!serverStatusChecker) {
        serverStatusChecker = new ServerStatusChecker();
        serverStatusChecker.start();
    }
};

export const stopServerStatusChecker = () => {
    if (serverStatusChecker) {
        serverStatusChecker.stop();
        serverStatusChecker = null;
    }
};