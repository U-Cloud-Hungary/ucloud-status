import { NotificationService } from '../services/notificationService.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export class NotificationController {
    constructor() {
        this.notificationService = new NotificationService();
    }

    getAllNotifications = async (req, res, next) => {
        try {
            const notifications = await this.notificationService.getAllNotifications();
            res.status(HTTP_STATUS.OK).json(notifications);
        } catch (error) {
            logger.error('Controller error getting all notifications:', error);
            next(error);
        }
    };

    createNotification = async (req, res, next) => {
        try {
            const notification = await this.notificationService.createNotification(req.body);
            res.status(HTTP_STATUS.CREATED).json(notification);
        } catch (error) {
            logger.error('Controller error creating notification:', error);
            next(error);
        }
    };

    deactivateNotification = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.notificationService.deactivateNotification(id);
            res.status(HTTP_STATUS.OK).json({ success: true });
        } catch (error) {
            logger.error(`Controller error deactivating notification ${req.params.id}:`, error);
            next(error);
        }
    };
}