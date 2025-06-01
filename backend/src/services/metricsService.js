import { MetricRepository } from '../repositories/MetricRepository.js';
import { ServerRepository } from '../repositories/serverRepository.js';
import { NotificationService } from './notificationService.js';
import logger from '../utils/logger.js';

export class MetricsService {
    constructor() {
        this.metricRepository = new MetricRepository();
        this.serverRepository = new ServerRepository();
        this.notificationService = new NotificationService();
    }

    async getServerMetrics(serverId) {
        try {
            const metric = await this.metricRepository.findLatestByServerId(serverId);
            if (!metric) {
                // Return default metrics if none found
                const server = await this.serverRepository.findByIdWithDetails(serverId);
                if (!server) {
                    throw new Error('Server not found');
                }

                return {
                    id: serverId,
                    name: server.name,
                    location: server.location,
                    status: 'unknown',
                    metrics: { cpu: 0, ram: 0, disk: 0 },
                    lastUpdated: new Date().toISOString()
                };
            }

            return metric;
        } catch (error) {
            logger.error(`Error getting metrics for server ${serverId}:`, error);
            throw new Error('Failed to retrieve server metrics');
        }
    }

    async getServerHistory(serverId, hours = 24) {
        try {
            return await this.metricRepository.getServerMetricsHistory(serverId, hours);
        } catch (error) {
            logger.error(`Error getting history for server ${serverId}:`, error);
            throw new Error('Failed to retrieve server history');
        }
    }

    async updateServerMetrics(serverId, metricsData) {
        try {
            // Validate metrics
            this._validateMetrics(metricsData);

            // Get server info for notifications
            const server = await this.serverRepository.findByIdWithDetails(serverId);
            if (!server) {
                throw new Error('Server not found');
            }

            // Get previous status for comparison
            const previousMetric = await this.metricRepository.findLatestByServerId(serverId);
            const previousStatus = previousMetric?.status || 'unknown';

            // Update metrics
            const metric = await this.metricRepository.createOrUpdateMetric(serverId, {
                status: 'online',
                cpu: metricsData.cpu,
                ram: metricsData.ram,
                disk: metricsData.disk
            });

            // Check for status changes and high usage
            await this._handleStatusChange(server, previousStatus, 'online');
            await this._checkHighUsage(server, metricsData);

            logger.info(`Metrics updated for server: ${server.name}`);
            return metric;
        } catch (error) {
            logger.error(`Error updating metrics for server ${serverId}:`, error);
            throw error;
        }
    }

    async setServerOffline(serverId, reason = null) {
        try {
            const server = await this.serverRepository.findByIdWithDetails(serverId);
            if (!server) {
                throw new Error('Server not found');
            }

            // Get previous status
            const previousMetric = await this.metricRepository.findLatestByServerId(serverId);
            const previousStatus = previousMetric?.status || 'unknown';

            // Set server offline
            const metric = await this.metricRepository.updateServerStatus(serverId, 'offline');

            // Handle status change notification
            await this._handleStatusChange(server, previousStatus, 'offline', reason);

            logger.info(`Server set offline: ${server.name}`);
            return metric;
        } catch (error) {
            logger.error(`Error setting server offline ${serverId}:`, error);
            throw error;
        }
    }

    async getSystemOverview() {
        try {
            return await this.metricRepository.getSystemOverview();
        } catch (error) {
            logger.error('Error getting system overview:', error);
            throw error;
        }
    }

    async cleanupOldMetrics(retentionDays = 30) {
        try {
            return await this.metricRepository.deleteOldMetrics(retentionDays);
        } catch (error) {
            logger.error('Error cleaning up old metrics:', error);
            throw error;
        }
    }

    async getServerUptimeStats(serverId, timeRange = '24h') {
        try {
            const hours = this._parseTimeRange(timeRange);
            const history = await this.metricRepository.getServerMetricsHistory(serverId, hours);

            if (history.length === 0) {
                return { uptime: 0, totalChecks: 0, onlineChecks: 0, timeRange };
            }

            const onlineChecks = history.filter(entry => entry.status === 'online').length;
            const totalChecks = history.length;
            const uptime = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 0;

            return {
                uptime: Math.round(uptime * 100) / 100,
                totalChecks,
                onlineChecks,
                timeRange
            };
        } catch (error) {
            logger.error(`Error getting uptime stats for server ${serverId}:`, error);
            throw error;
        }
    }

    async getMetricsForTimeRange(serverId, startDate, endDate) {
        try {
            return await this.metricRepository.findByServerIdInRange(serverId, startDate, endDate);
        } catch (error) {
            logger.error(`Error getting metrics for time range (server ${serverId}):`, error);
            throw error;
        }
    }

    async checkServerHealth(serverId, timeoutMinutes = 5) {
        try {
            const latestMetric = await this.metricRepository.findLatestByServerId(serverId);

            if (!latestMetric) {
                return { healthy: false, reason: 'No metrics found' };
            }

            const now = new Date();
            const lastUpdate = new Date(latestMetric.lastUpdated);
            const diffMinutes = (now - lastUpdate) / (1000 * 60);

            if (diffMinutes > timeoutMinutes) {
                // Server appears to be offline due to timeout
                await this.setServerOffline(serverId, `No metrics received for ${Math.round(diffMinutes)} minutes`);
                return { healthy: false, reason: `Timeout (${Math.round(diffMinutes)} minutes)` };
            }

            if (latestMetric.status !== 'online') {
                return { healthy: false, reason: `Status: ${latestMetric.status}` };
            }

            return { healthy: true, lastUpdate: latestMetric.lastUpdated };
        } catch (error) {
            logger.error(`Error checking server health ${serverId}:`, error);
            return { healthy: false, reason: 'Health check failed' };
        }
    }

    // Private helper methods
    async _handleStatusChange(server, previousStatus, newStatus, reason = null) {
        if (previousStatus === newStatus) {
            return; // No status change
        }

        try {
            if (newStatus === 'offline' && previousStatus === 'online') {
                const message = reason
                    ? `A "${server.name}" szerver offline állapotba került. Indok: ${reason}`
                    : `A "${server.name}" szerver offline állapotba került`;

                await this.notificationService.createErrorNotification(message);
            } else if (newStatus === 'online' && previousStatus === 'offline') {
                await this.notificationService.createSuccessNotification(
                    `A "${server.name}" szerver ismét online állapotban van`
                );
            }
        } catch (error) {
            logger.error(`Error handling status change notification for server ${server.name}:`, error);
        }
    }

    async _checkHighUsage(server, metrics, threshold = 85) {
        try {
            const highUsageFields = [];

            if (metrics.cpu > threshold) highUsageFields.push(`CPU: ${metrics.cpu}%`);
            if (metrics.ram > threshold) highUsageFields.push(`RAM: ${metrics.ram}%`);
            if (metrics.disk > threshold) highUsageFields.push(`Disk: ${metrics.disk}%`);

            if (highUsageFields.length > 0) {
                const message = `Magas erőforrás használat a "${server.name}" szerveren: ${highUsageFields.join(', ')}`;
                await this.notificationService.createWarningNotification(message);
            }
        } catch (error) {
            logger.error(`Error checking high usage for server ${server.name}:`, error);
        }
    }

    _validateMetrics(metrics) {
        const requiredFields = ['cpu', 'ram', 'disk'];

        for (const field of requiredFields) {
            if (typeof metrics[field] !== 'number') {
                throw new Error(`${field} must be a number`);
            }

            if (metrics[field] < 0 || metrics[field] > 100) {
                throw new Error(`${field} must be between 0 and 100`);
            }
        }
    }

    _parseTimeRange(timeRange) {
        switch (timeRange) {
            case '1h': return 1;
            case '24h': return 24;
            case '7d': return 24 * 7;
            case '30d': return 24 * 30;
            default: return 24;
        }
    }
}