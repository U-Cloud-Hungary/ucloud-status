import { Category } from '../models/Category.js';
import { readJSONFile, writeJSONFile, PATHS } from '../utils/fileHelper.js';
import logger from '../utils/logger.js';

export class CategoryRepository {
    async findAll() {
        try {
            const data = readJSONFile(PATHS.CATEGORIES);
            return data.categories.map(cat => Category.fromJSON(cat));
        } catch (error) {
            logger.error('Error finding all categories:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const categories = await this.findAll();
            return categories.find(cat => cat.id === id);
        } catch (error) {
            logger.error(`Error finding category ${id}:`, error);
            throw error;
        }
    }

    async create(categoryData) {
        try {
            const data = readJSONFile(PATHS.CATEGORIES);
            const newCategory = new Category(categoryData);

            data.categories.push(newCategory.toJSON());
            writeJSONFile(PATHS.CATEGORIES, data);

            logger.info(`Created category: ${newCategory.name}`);
            return newCategory;
        } catch (error) {
            logger.error('Error creating category:', error);
            throw error;
        }
    }

    async update(id, updateData) {
        try {
            const data = readJSONFile(PATHS.CATEGORIES);
            const categoryIndex = data.categories.findIndex(cat => cat.id === id);

            if (categoryIndex === -1) {
                throw new Error('Category not found');
            }

            data.categories[categoryIndex] = { ...data.categories[categoryIndex], ...updateData };
            writeJSONFile(PATHS.CATEGORIES, data);

            const updatedCategory = Category.fromJSON(data.categories[categoryIndex]);
            logger.info(`Updated category: ${updatedCategory.name}`);
            return updatedCategory;
        } catch (error) {
            logger.error(`Error updating category ${id}:`, error);
            throw error;
        }
    }

    async delete(id) {
        try {
            const data = readJSONFile(PATHS.CATEGORIES);
            const initialLength = data.categories.length;

            data.categories = data.categories.filter(cat => cat.id !== id);

            if (data.categories.length === initialLength) {
                throw new Error('Category not found');
            }

            writeJSONFile(PATHS.CATEGORIES, data);
            logger.info(`Deleted category: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Error deleting category ${id}:`, error);
            throw error;
        }
    }

    async save(categories) {
        try {
            const data = { categories: categories.map(cat => cat.toJSON()) };
            writeJSONFile(PATHS.CATEGORIES, data);
            logger.info('Saved categories data');
        } catch (error) {
            logger.error('Error saving categories:', error);
            throw error;
        }
    }
}
