import { Notification } from '../models/Notification.js';
import { readJSONFile, writeJSONFile, PATHS } from '../utils/fileHelper.js';
import logger from '../utils/logger.js';

export class NotificationRepository {
    async findAll() {
        try {
            const data = readJSONFile(PATHS.NOTIFICATIONS);
            return data.map(notification => Notification.fromJSON(notification));
        } catch (error) {
            logger.error('Error finding all notifications:', error);
            throw error;
        }
    }

    async findById(id) {
        try {
            const notifications = await this.findAll();
            return notifications.find(notification => notification.id === id);
        } catch (error) {
            logger.error(`Error finding notification ${id}:`, error);
            throw error;
        }
    }

    async create(notificationData) {
        try {
            const notifications = await this.findAll();
            const newNotification = new Notification(notificationData);

            notifications.push(newNotification);
            await this.save(notifications);

            logger.info(`Created notification: ${newNotification.type}`);
            return newNotification;
        } catch (error) {
            logger.error('Error creating notification:', error);
            throw error;
        }
    }

    async deactivate(id) {
        try {
            const notifications = await this.findAll();
            const notification = notifications.find(n => n.id === id);

            if (!notification) {
                throw new Error('Notification not found');
            }

            notification.deactivate();
            await this.save(notifications);

            logger.info(`Deactivated notification: ${id}`);
            return true;
        } catch (error) {
            logger.error(`Error deactivating notification ${id}:`, error);
            throw error;
        }
    }

    async save(notifications) {
        try {
            const data = notifications.map(notification => notification.toJSON());
            writeJSONFile(PATHS.NOTIFICATIONS, data);
            logger.info('Saved notifications data');
        } catch (error) {
            logger.error('Error saving notifications:', error);
            throw error;
        }
    }
}