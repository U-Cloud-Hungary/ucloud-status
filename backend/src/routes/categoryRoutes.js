import express from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { validateCategory } from '../middleware/validation.js';

const router = express.Router();
const categoryController = new CategoryController();

router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);
router.post('/', validateCategory, categoryController.createCategory);
router.put('/:id', validateCategory, categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;
