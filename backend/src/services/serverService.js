import { ServerRepository } from '../repositories/serverRepository.js';
import { MetricRepository } from '../repositories/MetricRepository.js';
import { CategoryRepository } from '../repositories/categoryRepository.js';
import logger from '../utils/logger.js';

export class ServerService {
    constructor() {
        this.serverRepository = new ServerRepository();
        this.metricRepository = new MetricRepository();
        this.categoryRepository = new CategoryRepository();
    }

    async getAllServersGrouped() {
        try {
            const categories = await this.categoryRepository.findAll();
            const result = {};

            for (const category of categories) {
                const servers = await this.serverRepository.findByCategoryId(category.id);
                const serversWithMetrics = [];

                for (const server of servers) {
                    try {
                        const latestMetric = await this.metricRepository.findLatestByServerId(server.id);
                        const history = await this.metricRepository.getServerMetricsHistory(server.id, 24);
                        const uptime = this._calculateUptimeFromHistory(history);


                        const serverData = {
                            ...server.toJSON(),
                            status: latestMetric ? latestMetric.status : 'offline',
                            metrics: latestMetric ? {
                                cpu: latestMetric.metrics.cpuUsage || latestMetric.metrics.cpu || 0,
                                ram: latestMetric.metrics.ramUsage || latestMetric.metrics.ram || 0,
                                disk: latestMetric.metrics.diskUsage || latestMetric.metrics.disk || 0,
                                status: latestMetric.status
                            } : {
                                cpu: 0,
                                ram: 0,
                                disk: 0,
                                status: 'offline'
                            },
                            uptime,
                            lastUpdated: latestMetric?.lastUpdated || server.updatedAt
                        };

                        serversWithMetrics.push(serverData);
                    } catch (error) {
                        logger.warn(`Error loading metrics for server ${server.id}:`, error);
                        serversWithMetrics.push({
                            ...server.toJSON(),
                            status: 'offline',
                            metrics: { cpu: 0, ram: 0, disk: 0, status: 'offline' },
                            uptime: 0,
                            lastUpdated: server.updatedAt
                        });
                    }
                }

                result[category.name] = serversWithMetrics;
            }

            return result;
        } catch (error) {
            logger.error('Service error getting all servers grouped:', error);
            throw new Error('Failed to retrieve servers');
        }
    }

    async getAllServers() {
        try {
            return await this.serverRepository.findAll();
        } catch (error) {
            logger.error('Service error getting all servers:', error);
            throw new Error('Failed to retrieve servers');
        }
    }

    async getServerById(id) {
        try {
            const server = await this.serverRepository.findByIdWithDetails(id);
            if (!server) {
                throw new Error('Server not found');
            }
            return server;
        } catch (error) {
            logger.error(`Service error getting server ${id}:`, error);
            throw error;
        }
    }

    async createServer(serverData) {
        try {
            if (!serverData.name || serverData.name.trim() === '') {
                throw new Error('Server name is required');
            }

            if (!serverData.location || serverData.location.trim() === '') {
                throw new Error('Server location is required');
            }

            if (!serverData.categoryId) {
                throw new Error('Category ID is required');
            }

            const newServerData = {
                id: serverData.id || crypto.randomUUID(),
                name: serverData.name.trim(),
                location: serverData.location.trim(),
                apiKey: serverData.apiKey || `sk_${crypto.randomUUID()}`,
                categoryId: serverData.categoryId
            };

            // Create server
            const server = await this.serverRepository.createServer(newServerData);

            // Initialize first metric entry
            await this.metricRepository.createOrUpdateMetric(server.id, {
                status: 'offline',
                cpu: 0,
                ram: 0,
                disk: 0
            });

            logger.info(`Server created: ${server.name} (${server.id})`);
            return server;
        } catch (error) {
            logger.error('Service error creating server:', error);
            throw error;
        }
    }

    async updateServer(id, updateData) {
        try {
            if (!id) {
                throw new Error('Server ID is required');
            }

            const dataToUpdate = {};

            if (updateData.name) {
                if (updateData.name.trim() === '') {
                    throw new Error('Server name cannot be empty');
                }
                dataToUpdate.name = updateData.name.trim();
            }

            if (updateData.location) {
                if (updateData.location.trim() === '') {
                    throw new Error('Server location cannot be empty');
                }
                dataToUpdate.location = updateData.location.trim();
            }

            if (updateData.categoryId) {
                dataToUpdate.categoryId = updateData.categoryId;
            }

            return await this.serverRepository.updateServer(id, dataToUpdate);
        } catch (error) {
            logger.error(`Service error updating server ${id}:`, error);
            throw error;
        }
    }

    async deleteServer(id) {
        try {
            if (!id) {
                throw new Error('Server ID is required');
            }

            // Delete server (cascade will handle metrics)
            const result = await this.serverRepository.deleteServer(id);

            logger.info(`Server deleted: ${id}`);
            return result;
        } catch (error) {
            logger.error(`Service error deleting server ${id}:`, error);
            throw error;
        }
    }

    async getServerByApiKey(apiKey) {
        try {
            if (!apiKey) {
                throw new Error('API key is required');
            }

            const server = await this.serverRepository.findByApiKey(apiKey);
            if (!server) {
                throw new Error('Invalid API key');
            }

            return server;
        } catch (error) {
            logger.error('Service error getting server by API key:', error);
            throw error;
        }
    }

    async updateServerMetrics(serverId, metricsData) {
        try {
            // Validate metrics
            this._validateMetrics(metricsData);

            // Update metrics in database
            const metric = await this.metricRepository.createOrUpdateMetric(serverId, {
                status: 'online',
                cpu: metricsData.cpu,
                ram: metricsData.ram,
                disk: metricsData.disk
            });

            logger.info(`Metrics updated for server: ${serverId}`);
            return metric;
        } catch (error) {
            logger.error(`Service error updating metrics for server ${serverId}:`, error);
            throw error;
        }
    }

    async setServerOffline(serverId) {
        try {
            const metric = await this.metricRepository.updateServerStatus(serverId, 'offline');

            logger.info(`Server set offline: ${serverId}`);
            return metric;
        } catch (error) {
            logger.error(`Service error setting server offline ${serverId}:`, error);
            throw error;
        }
    }

    async getServerStats() {
        try {
            return await this.serverRepository.getServerStats();
        } catch (error) {
            logger.error('Service error getting server stats:', error);
            throw error;
        }
    }

    async getServersByStatus(status) {
        try {
            return await this.serverRepository.getServersByStatus(status);
        } catch (error) {
            logger.error(`Service error getting servers by status ${status}:`, error);
            throw error;
        }
    }

    async getServerMetricsHistory(serverId, hours = 24) {
        try {
            return await this.metricRepository.getServerMetricsHistory(serverId, hours);
        } catch (error) {
            logger.error(`Service error getting metrics history for server ${serverId}:`, error);
            throw error;
        }
    }

    // Private helper methods
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

    _calculateUptimeFromHistory(history) {
        if (!history || history.length === 0) {
            return 0;
        }

        const onlineEntries = history.filter(entry => entry.status === 'online').length;
        return Math.round((onlineEntries / history.length) * 100 * 100) / 100;
    }
}