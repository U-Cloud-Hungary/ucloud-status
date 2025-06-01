import { BaseRepository } from './BaseRepository.js';
import { Category } from '../models/Category.js';
import { Server } from '../models/Server.js';
import logger from '../utils/logger.js';

export class CategoryRepository extends BaseRepository {
    constructor() {
        super('category');
    }

    static get INCLUDES() {
        return {
            withServers: {
                servers: {
                    include: {
                        metrics: {
                            take: 1,
                            orderBy: { lastUpdated: 'desc' }
                        }
                    }
                }
            },
            withServerCount: {
                _count: {
                    select: { servers: true }
                }
            }
        };
    }

    async findAll() {
        const categories = await this.findMany({
            include: CategoryRepository.INCLUDES.withServers,
            orderBy: { createdAt: 'asc' }
        });

        return this._mapToModels(categories);
    }

    async findByIdWithServers(id) {
        const category = await this.findById(id, CategoryRepository.INCLUDES.withServers);

        if (!category) {
            return null;
        }

        return this._mapToModel(category);
    }

    async createCategory(categoryData) {
        const data = {
            id: categoryData.id,
            name: categoryData.name.trim()
        };

        const category = await this.create(data, CategoryRepository.INCLUDES.withServers);

        logger.info(`Category created: ${category.name} (${category.id})`);
        return this._mapToModel(category);
    }

    async updateCategory(id, updateData) {
        const data = {};

        if (updateData.name) {
            data.name = updateData.name.trim();
        }

        const category = await this.update(id, data, CategoryRepository.INCLUDES.withServers);

        logger.info(`Category updated: ${category.name} (${category.id})`);
        return this._mapToModel(category);
    }

    async deleteCategory(id) {
        // Check if category has servers
        const serverCount = await this.db.server.count({
            where: { categoryId: id }
        });

        if (serverCount > 0) {
            throw new Error(`Cannot delete category with ${serverCount} servers. Move or delete servers first.`);
        }

        await this.delete(id);

        logger.info(`Category deleted: ${id}`);
        return true;
    }

    async getCategoryStats(id) {
        const category = await this.findById(id, {
            _count: {
                select: { servers: true }
            },
            servers: {
                include: {
                    metrics: {
                        take: 1,
                        orderBy: { lastUpdated: 'desc' }
                    }
                }
            }
        });

        if (!category) {
            return null;
        }

        const onlineServers = category.servers.filter(server =>
            server.metrics[0]?.status === 'online'
        ).length;

        return {
            id: category.id,
            name: category.name,
            totalServers: category._count.servers,
            onlineServers,
            offlineServers: category._count.servers - onlineServers
        };
    }

    async seedInitialData() {
        const existingCount = await this.count();

        if (existingCount === 0) {
            await this.createCategory({
                id: 'vps_backend',
                name: 'VPS Backend'
            });

            logger.info('Initial category data seeded');
        }
    }

    // Private helper methods
    _mapToModel(categoryData) {
        return Category.fromJSON({
            ...categoryData,
            servers: categoryData.servers?.map(server => Server.fromJSON(server)) || []
        });
    }

    _mapToModels(categoriesData) {
        return categoriesData.map(category => this._mapToModel(category));
    }
}