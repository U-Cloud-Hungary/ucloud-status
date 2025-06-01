import express from 'express';
import { MetricsController } from '../controllers/metricsController.js';
import { validateMetrics } from '../middleware/validation.js';

const router = express.Router();
const metricsController = new MetricsController();

router.post('/', validateMetrics, metricsController.updateMetrics);
router.get('/:id', metricsController.getServerMetrics);
router.get('/:id/history', metricsController.getServerHistory);

export default router;