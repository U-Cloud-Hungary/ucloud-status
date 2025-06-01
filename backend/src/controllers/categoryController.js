import { CategoryService } from '../services/categoryService.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export class CategoryController {
    constructor() {
        this.categoryService = new CategoryService();
    }

    getAllCategories = async (req, res, next) => {
        try {
            const categories = await this.categoryService.getAllCategories();
            res.status(HTTP_STATUS.OK).json(categories);
        } catch (error) {
            logger.error('Controller error getting all categories:', error);
            next(error);
        }
    };

    getCategoryById = async (req, res, next) => {
        try {
            const { id } = req.params;
            const category = await this.categoryService.getCategoryById(id);
            res.status(HTTP_STATUS.OK).json(category);
        } catch (error) {
            logger.error(`Controller error getting category ${req.params.id}:`, error);
            next(error);
        }
    };

    createCategory = async (req, res, next) => {
        try {
            const category = await this.categoryService.createCategory(req.body);
            res.status(HTTP_STATUS.CREATED).json(category);
        } catch (error) {
            logger.error('Controller error creating category:', error);
            next(error);
        }
    };

    updateCategory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const category = await this.categoryService.updateCategory(id, req.body);
            res.status(HTTP_STATUS.OK).json(category);
        } catch (error) {
            logger.error(`Controller error updating category ${req.params.id}:`, error);
            next(error);
        }
    };

    deleteCategory = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.categoryService.deleteCategory(id);
            res.status(HTTP_STATUS.OK).json({ success: true });
        } catch (error) {
            logger.error(`Controller error deleting category ${req.params.id}:`, error);
            next(error);
        }
    };
}