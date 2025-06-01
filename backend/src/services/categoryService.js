import { CategoryRepository } from '../repositories/categoryRepository.js';
import logger from '../utils/logger.js';

export class CategoryService {
    constructor() {
        this.categoryRepository = new CategoryRepository();
    }

    async getAllCategories() {
        try {
            return await this.categoryRepository.findAll();
        } catch (error) {
            logger.error('Service error getting all categories:', error);
            throw new Error('Failed to retrieve categories');
        }
    }

    async getCategoryById(id) {
        try {
            const category = await this.categoryRepository.findByIdWithServers(id);
            if (!category) {
                throw new Error('Category not found');
            }
            return category;
        } catch (error) {
            logger.error(`Service error getting category ${id}:`, error);
            throw error;
        }
    }

    async getCategoryStats(id) {
        try {
            const stats = await this.categoryRepository.getCategoryStats(id);
            if (!stats) {
                throw new Error('Category not found');
            }
            return stats;
        } catch (error) {
            logger.error(`Service error getting category stats ${id}:`, error);
            throw error;
        }
    }

    async createCategory(categoryData) {
        try {
            if (!categoryData.name || categoryData.name.trim() === '') {
                throw new Error('Category name is required');
            }

            const newCategoryData = {
                id: categoryData.id || crypto.randomUUID(),
                name: categoryData.name.trim()
            };

            return await this.categoryRepository.createCategory(newCategoryData);
        } catch (error) {
            logger.error('Service error creating category:', error);
            throw error;
        }
    }

    async updateCategory(id, updateData) {
        try {
            if (!id) {
                throw new Error('Category ID is required');
            }

            if (updateData.name && updateData.name.trim() === '') {
                throw new Error('Category name cannot be empty');
            }

            const dataToUpdate = {};
            if (updateData.name) {
                dataToUpdate.name = updateData.name.trim();
            }

            return await this.categoryRepository.updateCategory(id, dataToUpdate);
        } catch (error) {
            logger.error(`Service error updating category ${id}:`, error);
            throw error;
        }
    }

    async deleteCategory(id) {
        try {
            if (!id) {
                throw new Error('Category ID is required');
            }

            // The repository will check if category has servers and throw error if needed
            return await this.categoryRepository.deleteCategory(id);
        } catch (error) {
            logger.error(`Service error deleting category ${id}:`, error);
            throw error;
        }
    }

    async getAllCategoryStats() {
        try {
            const categories = await this.categoryRepository.findAll();
            const stats = [];

            for (const category of categories) {
                const categoryStats = await this.categoryRepository.getCategoryStats(category.id);
                stats.push(categoryStats);
            }

            return stats;
        } catch (error) {
            logger.error('Service error getting all category stats:', error);
            throw error;
        }
    }
}