import { HTTP_STATUS } from '../utils/constants.js';
import { ServerService } from '../services/serverService.js';
import logger from '../utils/logger.js';

export const authenticateApiKey = async (req, res, next) => {
    try {
        const apiKey = req.headers.authorization?.split(' ')[1];

        if (!apiKey) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: 'Missing API key'
            });
        }

        const serverService = new ServerService();
        const server = await serverService.getServerByApiKey(apiKey);

        if (!server) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                error: 'Invalid API key'
            });
        }

        req.server = server;
        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: 'Authentication failed'
        });
    }
};