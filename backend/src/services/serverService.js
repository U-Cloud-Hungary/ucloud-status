import { v4 as uuidv4 } from 'uuid';
import { ServerRepository } from '../repositories/serverRepository.js';
import { MetricsService } from './metricsService.js';
import { UptimeService } from './uptimeService.js';
import logger from '../utils/logger.js';

export class ServerService {
    constructor() {
        this.serverRepository = new ServerRepository();
        this.metricsService = new MetricsService();
        this.uptimeService = new UptimeService();
    }

    async getAllServersGrouped() {
        try {
            const categoryRepository = this.serverRepository.categoryRepository;
            const categories = await categoryRepository.findAll();
            const result = {};

            for (const category of categories) {
                if (category.servers && category.servers.length > 0) {
                    const serversWithMetrics = await Promise.all(
                        category.servers.map(async (server) => {
                            try {
                                const metrics = await this.metricsService.getServerMetrics(server.id);
                                const history = await this.metricsService.getServerHistory(server.id);
                                const uptime = await this.uptimeService.calculateUptime(server.id);

                                return {
                                    ...metrics.toJSON(),
                                    uptime,
                                    uptimeHistory: history
                                };
                            } catch (error) {
                                logger.error(`Error loading server data for ${server.id}:`, error);
                                return null;
                            }
                        })
                    );

                    result[category.name] = serversWithMetrics.filter(Boolean);
                } else {
                    result[category.name] = [];
                }
            }

            return result;
        } catch (error) {
            logger.error('Service error getting all servers grouped:', error);
            throw new Error('Failed to retrieve servers');
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

            const serverId = uuidv4();
            const newServerData = {
                id: serverId,
                name: serverData.name.trim(),
                location: serverData.location.trim(),
                apiKey: `sk_${uuidv4()}`,
                categoryId: serverData.categoryId
            };

            // Create server
            const server = await this.serverRepository.create(newServerData);

            // Initialize metrics and history
            await this.metricsService.initializeServerMetrics(server);

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

            return await this.serverRepository.update(id, dataToUpdate);
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

            // Delete server metrics and history
            await this.metricsService.deleteServerData(id);

            // Delete server
            return await this.serverRepository.delete(id);
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
}