import { v4 as uuidv4 } from 'uuid';
import { Notification } from '../models/Notification.js';
import { NotificationRepository } from '../repositories/notificationRepository.js';
import { NOTIFICATION_TYPES } from '../utils/constants.js';
import logger from '../utils/logger.js';

export class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }

    async getAllNotifications() {
        try {
            return await this.notificationRepository.findAll();
        } catch (error) {
            logger.error('Service error getting all notifications:', error);
            throw new Error('Failed to retrieve notifications');
        }
    }

    async createNotification(notificationData) {
        try {
            if (!notificationData.type || !Object.values(NOTIFICATION_TYPES).includes(notificationData.type)) {
                throw new Error('Valid notification type is required');
            }

            if (!notificationData.message || notificationData.message.trim() === '') {
                throw new Error('Notification message is required');
            }

            const newNotificationData = {
                id: uuidv4(),
                type: notificationData.type,
                message: notificationData.message.trim(),
                timestamp: new Date().toISOString(),
                active: true
            };

            return await this.notificationRepository.create(newNotificationData);
        } catch (error) {
            logger.error('Service error creating notification:', error);
            throw error;
        }
    }

    async deactivateNotification(id) {
        try {
            if (!id) {
                throw new Error('Notification ID is required');
            }

            return await this.notificationRepository.deactivate(id);
        } catch (error) {
            logger.error(`Service error deactivating notification ${id}:`, error);
            throw error;
        }
    }

    async createServerOfflineNotification(serverName) {
        try {
            const notificationData = {
                type: NOTIFICATION_TYPES.ERROR,
                message: `A "${serverName}" szerver offline állapotba került`
            };

            return await this.createNotification(notificationData);
        } catch (error) {
            logger.error(`Error creating offline notification for server ${serverName}:`, error);
            throw error;
        }
    }
}