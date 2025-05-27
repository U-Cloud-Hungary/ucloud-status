import { v4 as uuidv4 } from 'uuid';
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
            const category = await this.categoryRepository.findById(id);
            if (!category) {
                throw new Error('Category not found');
            }
            return category;
        } catch (error) {
            logger.error(`Service error getting category ${id}:`, error);
            throw error;
        }
    }

    async createCategory(categoryData) {
        try {
            if (!categoryData.name || categoryData.name.trim() === '') {
                throw new Error('Category name is required');
            }

            const newCategoryData = {
                id: uuidv4(),
                name: categoryData.name.trim(),
                servers: []
            };

            return await this.categoryRepository.create(newCategoryData);
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

            return await this.categoryRepository.update(id, dataToUpdate);
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

            // Check if category has servers
            const category = await this.categoryRepository.findById(id);
            if (category && category.servers.length > 0) {
                throw new Error('Cannot delete category with existing servers');
            }

            return await this.categoryRepository.delete(id);
        } catch (error) {
            logger.error(`Service error deleting category ${id}:`, error);
            throw error;
        }
    }
}