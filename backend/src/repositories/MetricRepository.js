import { BaseRepository } from './BaseRepository.js';
import { Metrics } from '../models/Metrics.js';
import logger from '../utils/logger.js';

export class MetricRepository extends BaseRepository {
    constructor() {
        super('metric');
    }

    static get INCLUDES() {
        return {
            withServer: {
                server: {
                    include: {
                        category: true
                    }
                }
            }
        };
    }

    async findLatestByServerId(serverId) {
        const metric = await this.executeWithErrorHandling(
            () => this.model.findFirst({
                where: { serverId },
                orderBy: { lastUpdated: 'desc' },
                include: MetricRepository.INCLUDES.withServer
            }),
            'Find latest metric by server ID'
        );

        if (!metric) {
            return null;
        }

        return this._mapToModel(metric);
    }

    async findByServerIdInRange(serverId, startDate, endDate) {
        const metrics = await this.findMany({
            where: {
                serverId,
                lastUpdated: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { lastUpdated: 'asc' },
            include: MetricRepository.INCLUDES.withServer
        });

        return this._mapToModels(metrics);
    }

    async createOrUpdateMetric(serverId, metricData) {
        // Validate server exists
        const serverExists = await this.db.server.findUnique({
            where: { id: serverId }
        });

        if (!serverExists) {
            throw new Error(`Server with ID ${serverId} not found`);
        }

        const data = {
            id: metricData.id || crypto.randomUUID(),
            serverId,
            status: metricData.status || 'online',
            cpuUsage: this._validateUsageValue(metricData.cpu || metricData.cpuUsage),
            ramUsage: this._validateUsageValue(metricData.ram || metricData.ramUsage),
            diskUsage: this._validateUsageValue(metricData.disk || metricData.diskUsage),
            lastUpdated: metricData.lastUpdated ? new Date(metricData.lastUpdated) : new Date()
        };

        const metric = await this.create(data, MetricRepository.INCLUDES.withServer);

        // Clean up old metrics (keep only last 100 records per server)
        await this._cleanupOldMetrics(serverId);

        logger.info(`Metric recorded for server ${serverId}: ${data.status}`);
        return this._mapToModel(metric);
    }

    async updateServerStatus(serverId, status, metricData = {}) {
        const data = {
            id: crypto.randomUUID(),
            serverId,
            status,
            cpuUsage: status === 'offline' ? 0 : this._validateUsageValue(metricData.cpu || 0),
            ramUsage: status === 'offline' ? 0 : this._validateUsageValue(metricData.ram || 0),
            diskUsage: status === 'offline' ? 0 : this._validateUsageValue(metricData.disk || 0),
            lastUpdated: new Date()
        };

        const metric = await this.create(data, MetricRepository.INCLUDES.withServer);

        logger.info(`Server ${serverId} status updated to: ${status}`);
        return this._mapToModel(metric);
    }

    async getServerMetricsHistory(serverId, hours = 24) {
        const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

        const metrics = await this.findMany({
            where: {
                serverId,
                lastUpdated: { gte: startDate }
            },
            orderBy: { lastUpdated: 'asc' },
            select: {
                cpuUsage: true,
                ramUsage: true,
                diskUsage: true,
                status: true,
                lastUpdated: true
            }
        });

        return metrics;
    }

    async getSystemOverview() {
        const [totalServers, onlineServers, offlineServers] = await Promise.all([
            this.db.server.count(),
            this._getServerCountByStatus('online'),
            this._getServerCountByStatus('offline')
        ]);

        const averageMetrics = await this._getAverageMetrics();

        return {
            totalServers,
            onlineServers,
            offlineServers,
            unknownServers: totalServers - onlineServers - offlineServers,
            averageMetrics
        };
    }

    async deleteOldMetrics(retentionDays = 30) {
        const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

        const deletedCount = await this.executeWithErrorHandling(
            () => this.model.deleteMany({
                where: {
                    lastUpdated: { lt: cutoffDate }
                }
            }),
            'Delete old metrics'
        );

        logger.info(`Deleted ${deletedCount.count} old metrics older than ${retentionDays} days`);
        return deletedCount.count;
    }

    // Private helper methods
    _validateUsageValue(value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue < 0 || numValue > 100) {
            return 0;
        }
        return Math.round(numValue * 100) / 100; // Round to 2 decimal places
    }

    async _cleanupOldMetrics(serverId, keepCount = 100) {
        const metrics = await this.findMany({
            where: { serverId },
            orderBy: { lastUpdated: 'desc' },
            select: { id: true },
            skip: keepCount
        });

        if (metrics.length > 0) {
            const metricsToDelete = metrics.map(m => m.id);
            await this.executeWithErrorHandling(
                () => this.model.deleteMany({
                    where: {
                        id: { in: metricsToDelete }
                    }
                }),
                'Cleanup old metrics'
            );
        }
    }

    async _getServerCountByStatus(status) {
        // Get servers that have the specified status in their latest metric
        const recentTime = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

        const servers = await this.db.server.findMany({
            where: {
                metrics: {
                    some: {
                        status,
                        lastUpdated: { gte: recentTime }
                    }
                }
            },
            select: { id: true }
        });

        return servers.length;
    }

    async _getAverageMetrics() {
        const recentTime = new Date(Date.now() - 5 * 60 * 1000); // Last 5 minutes

        const averages = await this.db.metric.aggregate({
            where: {
                status: 'online',
                lastUpdated: { gte: recentTime }
            },
            _avg: {
                cpuUsage: true,
                ramUsage: true,
                diskUsage: true
            }
        });

        return {
            cpu: Math.round((averages._avg.cpuUsage || 0) * 100) / 100,
            ram: Math.round((averages._avg.ramUsage || 0) * 100) / 100,
            disk: Math.round((averages._avg.diskUsage || 0) * 100) / 100
        };
    }

    _mapToModel(metricData) {
        return Metrics.fromJSON({
            id: metricData.serverId,
            name: metricData.server?.name || 'Unknown',
            location: metricData.server?.location || 'Unknown',
            status: metricData.status,
            metrics: {
                cpu: metricData.cpuUsage,
                ram: metricData.ramUsage,
                disk: metricData.diskUsage
            },
            lastUpdated: metricData.lastUpdated
        });
    }

    _mapToModels(metricsData) {
        return metricsData.map(metric => this._mapToModel(metric));
    }
}