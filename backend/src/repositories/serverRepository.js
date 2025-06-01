import { BaseRepository } from './BaseRepository.js';
import { Server } from '../models/Server.js';
import logger from '../utils/logger.js';

export class ServerRepository extends BaseRepository {
    constructor() {
        super('server');
    }

    static get INCLUDES() {
        return {
            withCategory: {
                category: true
            },
            withLatestMetric: {
                metrics: {
                    take: 1,
                    orderBy: { lastUpdated: 'desc' }
                }
            },
            withCategoryAndMetrics: {
                category: true,
                metrics: {
                    take: 1,
                    orderBy: { lastUpdated: 'desc' }
                }
            }
        };
    }

    async findAll() {
        const servers = await this.findMany({
            include: ServerRepository.INCLUDES.withCategoryAndMetrics,
            orderBy: { createdAt: 'asc' }
        });

        return this._mapToModels(servers);
    }

    async findByIdWithDetails(id) {
        const server = await this.findById(id, ServerRepository.INCLUDES.withCategoryAndMetrics);

        if (!server) {
            return null;
        }

        return this._mapToModel(server);
    }

    async findByApiKey(apiKey) {
        const server = await this.executeWithErrorHandling(
            () => this.model.findUnique({
                where: { apiKey },
                include: ServerRepository.INCLUDES.withCategoryAndMetrics
            }),
            'Find server by API key'
        );

        if (!server) {
            return null;
        }

        return this._mapToModel(server);
    }

    async findByCategoryId(categoryId) {
        const servers = await this.findMany({
            where: { categoryId },
            include: ServerRepository.INCLUDES.withLatestMetric,
            orderBy: { name: 'asc' }
        });

        return this._mapToModels(servers);
    }

    async createServer(serverData) {
        await this._validateCategoryExists(serverData.categoryId);
        await this._validateUniqueApiKey(serverData.apiKey);

        const data = {
            id: serverData.id,
            name: serverData.name.trim(),
            location: serverData.location.trim(),
            apiKey: serverData.apiKey,
            categoryId: serverData.categoryId
        };

        const server = await this.create(data, ServerRepository.INCLUDES.withCategoryAndMetrics);

        logger.info(`Server created: ${server.name} (${server.id})`);
        return this._mapToModel(server);
    }

    async updateServer(id, updateData) {
        const existingServer = await this.findById(id);
        if (!existingServer) {
            throw new Error('Server not found');
        }

        const data = {};

        if (updateData.name) {
            data.name = updateData.name.trim();
        }

        if (updateData.location) {
            data.location = updateData.location.trim();
        }

        if (updateData.categoryId) {
            await this._validateCategoryExists(updateData.categoryId);
            data.categoryId = updateData.categoryId;
        }

        if (updateData.apiKey && updateData.apiKey !== existingServer.apiKey) {
            await this._validateUniqueApiKey(updateData.apiKey);
            data.apiKey = updateData.apiKey;
        }

        const server = await this.update(id, data, ServerRepository.INCLUDES.withCategoryAndMetrics);

        logger.info(`Server updated: ${server.name} (${server.id})`);
        return this._mapToModel(server);
    }

    async deleteServer(id) {
        const server = await this.findById(id);
        if (!server) {
            throw new Error('Server not found');
        }

        // Delete related metrics first (cascade should handle this, but being explicit)
        await this.db.metric.deleteMany({
            where: { serverId: id }
        });

        await this.delete(id);

        logger.info(`Server deleted: ${server.name} (${id})`);
        return true;
    }

    async getServerStats() {
        const [total, online, offline] = await Promise.all([
            this.count(),
            this._countServersByStatus('online'),
            this._countServersByStatus('offline')
        ]);

        return {
            total,
            online,
            offline,
            unknown: total - online - offline
        };
    }

    async getServersByStatus(status) {
        const servers = await this.db.server.findMany({
            where: {
                metrics: {
                    some: {
                        status,
                        lastUpdated: {
                            gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
                        }
                    }
                }
            },
            include: ServerRepository.INCLUDES.withCategoryAndMetrics
        });

        return this._mapToModels(servers);
    }

    // Private validation methods
    async _validateCategoryExists(categoryId) {
        const categoryExists = await this.db.category.findUnique({
            where: { id: categoryId }
        });

        if (!categoryExists) {
            throw new Error(`Category with ID ${categoryId} not found`);
        }
    }

    async _validateUniqueApiKey(apiKey, excludeServerId = null) {
        const existingServer = await this.db.server.findUnique({
            where: { apiKey }
        });

        if (existingServer && existingServer.id !== excludeServerId) {
            throw new Error('API key must be unique');
        }
    }

    async _countServersByStatus(status) {
        return await this.db.server.count({
            where: {
                metrics: {
                    some: {
                        status,
                        lastUpdated: {
                            gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
                        }
                    }
                }
            }
        });
    }

    // Private helper methods
    _mapToModel(serverData) {
        return Server.fromJSON(serverData);
    }

    _mapToModels(serversData) {
        return serversData.map(server => this._mapToModel(server));
    }
}