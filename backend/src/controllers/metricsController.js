import { MetricsService } from '../services/metricsService.js';
import { ServerService } from '../services/serverService.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export class MetricsController {
    constructor() {
        this.metricsService = new MetricsService();
        this.serverService = new ServerService();
    }

    updateMetrics = async (req, res, next) => {
        try {
            const apiKey = req.headers.authorization?.split(' ')[1];

            if (!apiKey) {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: 'Missing API key' });
            }

            const server = await this.serverService.getServerByApiKey(apiKey);
            const { metrics } = req.body;

            if (!metrics) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({ error: 'Metrics data is required' });
            }

            await this.metricsService.updateServerMetrics(server.id, metrics);
            res.status(HTTP_STATUS.OK).json({ success: true });
        } catch (error) {
            if (error.message === 'Invalid API key') {
                return res.status(HTTP_STATUS.UNAUTHORIZED).json({ error: error.message });
            }
            logger.error('Controller error updating metrics:', error);
            next(error);
        }
    };

    getServerMetrics = async (req, res, next) => {
        try {
            const { id } = req.params;
            const metrics = await this.metricsService.getServerMetrics(id);
            res.status(HTTP_STATUS.OK).json(metrics);
        } catch (error) {
            logger.error(`Controller error getting metrics for server ${req.params.id}:`, error);
            next(error);
        }
    };

    getServerHistory = async (req, res, next) => {
        try {
            const { id } = req.params;
            const history = await this.metricsService.getServerHistory(id);
            res.status(HTTP_STATUS.OK).json(history);
        } catch (error) {
            logger.error(`Controller error getting history for server ${req.params.id}:`, error);
            next(error);
        }
    };
}
