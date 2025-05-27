import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export const errorHandler = (error, req, res, next) => {
    logger.error('Error occurred:', {
        message: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });

    // Handle specific error types
    if (error.message === 'Category not found' ||
        error.message === 'Server not found' ||
        error.message === 'Notification not found') {
        return res.status(HTTP_STATUS.NOT_FOUND).json({
            error: error.message
        });
    }

    if (error.message === 'Invalid API key' ||
        error.message === 'Missing API key') {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
            error: error.message
        });
    }

    if (error.message.includes('required') ||
        error.message.includes('cannot be empty') ||
        error.message.includes('Validation failed')) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: error.message
        });
    }

    // Default server error
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        error: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { details: error.message })
    });
};