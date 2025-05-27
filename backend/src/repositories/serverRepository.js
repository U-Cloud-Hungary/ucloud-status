import { Server } from '../models/Server.js';
import { CategoryRepository } from './categoryRepository.js';
import logger from '../utils/logger.js';

export class ServerRepository {
    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async findAll() {
        try {
            const categories = await this.categoryRepository.findAll();
            const servers = [];

            categories.forEach(category => {
                if (category.servers) {
                    servers.push(...category.servers);
                }
            });

            return servers;
        } catch (error) {
            logger.error('Error finding all servers:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const categories = await this.categoryRepository.findAll();

            for (const category of categories) {
                const server = category.findServer(id);
                if (server) {
                    return server;
                }
            }

            return null;
        } catch (error) {
            logger.error(`Error finding server ${id}:`, error);
            throw error;
        }
    }

    async findByApiKey(apiKey) {
        try {
            const servers = await this.findAll();
            return servers.find(server => server.apiKey === apiKey);
        } catch (error) {
            logger.error('Error finding server by API key:', error);
            throw error;
        }
    }

    async create(serverData) {
        try {
            const category = await this.categoryRepository.findById(serverData.categoryId);
            if (!category) {
                throw new Error('Category not found');
            }

            const newServer = new Server(serverData);
            category.addServer(newServer);

            const categories = await this.categoryRepository.findAll();
            const categoryIndex = categories.findIndex(cat => cat.id === category.id);
            categories[categoryIndex] = category;

            await this.categoryRepository.save(categories);

            logger.info(`Created server: ${newServer.name}`);
            return newServer;
        } catch (error) {
            logger.error('Error creating server:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const categories = await this.categoryRepository.findAll();
            let targetCategory = null;
            let server = null;

            // Find server and its category
            for (const category of categories) {
                server = category.findServer(id);
                if (server) {
                    targetCategory = category;
                    break;
                }
            }

            if (!server || !targetCategory) {
                throw new Error('Server not found');
            }

            // Update server properties
            Object.assign(server, updateData);

            // Handle category change
            if (updateData.categoryId && updateData.categoryId !== targetCategory.id) {
                const newCategory = categories.find(cat => cat.id === updateData.categoryId);
                if (!newCategory) {
                    throw new Error('New category not found');
                }

                // Remove from old category
                targetCategory.removeServer(id);

                // Add to new category
                server.categoryId = newCategory.id;
                newCategory.addServer(server);
            }

            await this.categoryRepository.save(categories);

            logger.info(`Updated server: ${server.name}`);
            return server;
        } catch (error) {
            logger.error(`Error updating server ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const categories = await this.categoryRepository.findAll();
            let found = false;

            categories.forEach(category => {
                const initialLength = category.servers.length;
                category.removeServer(id);
                if (category.servers.length < initialLength) {
                    found = true;
                }
            });

            if (!found) {
                throw new Error('Server not found');
            }

            await this.categoryRepository.save(categories);

            logger.info(`Deleted server: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting server ${id}:`, error);
            throw error;
        }
    }
}