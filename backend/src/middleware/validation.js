import { body, validationResult } from 'express-validator';
import { HTTP_STATUS, NOTIFICATION_TYPES } from '../utils/constants.js';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

export const validateCategory = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Category name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Category name must be between 1 and 100 characters'),
    handleValidationErrors
];

export const validateServer = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Server name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Server name must be between 1 and 100 characters'),
    body('location')
        .trim()
        .notEmpty()
        .withMessage('Server location is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Server location must be between 1 and 100 characters'),
    body('categoryId')
        .notEmpty()
        .withMessage('Category ID is required')
        .isUUID()
        .withMessage('Category ID must be a valid UUID'),
    handleValidationErrors
];

export const validateMetrics = [
    body('metrics')
        .isObject()
        .withMessage('Metrics must be an object'),
    body('metrics.cpu')
        .isNumeric()
        .withMessage('CPU metric must be a number')
        .isFloat({ min: 0, max: 100 })
        .withMessage('CPU metric must be between 0 and 100'),
    body('metrics.ram')
        .isNumeric()
        .withMessage('RAM metric must be a number')
        .isFloat({ min: 0, max: 100 })
        .withMessage('RAM metric must be between 0 and 100'),
    body('metrics.disk')
        .isNumeric()
        .withMessage('Disk metric must be a number')
        .isFloat({ min: 0, max: 100 })
        .withMessage('Disk metric must be between 0 and 100'),
    handleValidationErrors
];

export const validateNotification = [
    body('type')
        .isIn(Object.values(NOTIFICATION_TYPES))
        .withMessage(`Type must be one of: ${Object.values(NOTIFICATION_TYPES).join(', ')}`),
    body('message')
        .trim()
        .notEmpty()
        .withMessage('Message is required')
        .isLength({ min: 1, max: 500 })
        .withMessage('Message must be between 1 and 500 characters'),
    handleValidationErrors
];
