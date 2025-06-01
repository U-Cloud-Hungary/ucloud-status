import { NotificationRepository } from '../repositories/notificationRepository.js';
import logger from '../utils/logger.js';

export class NotificationService {
    constructor() {
        this.notificationRepository = new NotificationRepository();
    }

    static get NOTIFICATION_TYPES() {
        return {
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info',
            SUCCESS: 'success'
        };
    }

    async getAllNotifications(includeInactive = false) {
        try {
            return await this.notificationRepository.findAll(includeInactive);
        } catch (error) {
            logger.error('Service error getting all notifications:', error);
            throw new Error('Failed to retrieve notifications');
        }
    }

    async getActiveNotifications() {
        try {
            return await this.notificationRepository.findActive();
        } catch (error) {
            logger.error('Service error getting active notifications:', error);
            throw new Error('Failed to retrieve active notifications');
        }
    }

    async getNotificationsByType(type, includeInactive = false) {
        try {
            return await this.notificationRepository.findByType(type, includeInactive);
        } catch (error) {
            logger.error(`Service error getting notifications by type ${type}:`, error);
            throw new Error('Failed to retrieve notifications by type');
        }
    }

    async createNotification(notificationData) {
        try {
            const validTypes = Object.values(NotificationService.NOTIFICATION_TYPES);

            if (!notificationData.type || !validTypes.includes(notificationData.type)) {
                throw new Error(`Valid notification type is required. Valid types: ${validTypes.join(', ')}`);
            }

            if (!notificationData.message || notificationData.message.trim() === '') {
                throw new Error('Notification message is required');
            }

            const newNotificationData = {
                id: notificationData.id || crypto.randomUUID(),
                type: notificationData.type,
                message: notificationData.message.trim(),
                active: notificationData.active !== undefined ? notificationData.active : true,
                timestamp: notificationData.timestamp || new Date()
            };

            return await this.notificationRepository.createNotification(newNotificationData);
        } catch (error) {
            logger.error('Service error creating notification:', error);
            throw error;
        }
    }

    async updateNotification(id, updateData) {
        try {
            if (!id) {
                throw new Error('Notification ID is required');
            }

            return await this.notificationRepository.updateNotification(id, updateData);
        } catch (error) {
            logger.error(`Service error updating notification ${id}:`, error);
            throw error;
        }
    }

    async deactivateNotification(id) {
        try {
            if (!id) {
                throw new Error('Notification ID is required');
            }

            return await this.notificationRepository.deactivateNotification(id);
        } catch (error) {
            logger.error(`Service error deactivating notification ${id}:`, error);
            throw error;
        }
    }

    async activateNotification(id) {
        try {
            if (!id) {
                throw new Error('Notification ID is required');
            }

            return await this.notificationRepository.activateNotification(id);
        } catch (error) {
            logger.error(`Service error activating notification ${id}:`, error);
            throw error;
        }
    }

    async deleteNotification(id) {
        try {
            if (!id) {
                throw new Error('Notification ID is required');
            }

            return await this.notificationRepository.deleteNotification(id);
        } catch (error) {
            logger.error(`Service error deleting notification ${id}:`, error);
            throw error;
        }
    }

    async bulkDeactivateNotifications(ids) {
        try {
            if (!ids || !Array.isArray(ids) || ids.length === 0) {
                throw new Error('Notification IDs array is required');
            }

            return await this.notificationRepository.bulkDeactivate(ids);
        } catch (error) {
            logger.error('Service error bulk deactivating notifications:', error);
            throw error;
        }
    }

    async getNotificationStats() {
        try {
            return await this.notificationRepository.getNotificationStats();
        } catch (error) {
            logger.error('Service error getting notification stats:', error);
            throw error;
        }
    }

    async cleanupOldNotifications(retentionDays = 90) {
        try {
            return await this.notificationRepository.deleteOldNotifications(retentionDays);
        } catch (error) {
            logger.error('Service error cleaning up old notifications:', error);
            throw error;
        }
    }

    // Convenience methods for creating specific notification types
    async createErrorNotification(message, data = {}) {
        return await this.createNotification({
            ...data,
            type: NotificationService.NOTIFICATION_TYPES.ERROR,
            message
        });
    }

    async createWarningNotification(message, data = {}) {
        return await this.createNotification({
            ...data,
            type: NotificationService.NOTIFICATION_TYPES.WARNING,
            message
        });
    }

    async createInfoNotification(message, data = {}) {
        return await this.createNotification({
            ...data,
            type: NotificationService.NOTIFICATION_TYPES.INFO,
            message
        });
    }

    async createSuccessNotification(message, data = {}) {
        return await this.createNotification({
            ...data,
            type: NotificationService.NOTIFICATION_TYPES.SUCCESS,
            message
        });
    }

    // Server-specific notification methods
    async createServerOfflineNotification(serverName) {
        try {
            const message = `A "${serverName}" szerver offline állapotba került`;
            return await this.createErrorNotification(message);
        } catch (error) {
            logger.error(`Error creating offline notification for server ${serverName}:`, error);
            throw error;
        }
    }

    async createServerOnlineNotification(serverName) {
        try {
            const message = `A "${serverName}" szerver ismét online állapotban van`;
            return await this.createSuccessNotification(message);
        } catch (error) {
            logger.error(`Error creating online notification for server ${serverName}:`, error);
            throw error;
        }
    }

    async createHighUsageNotification(serverName, usageType, usage) {
        try {
            const message = `Magas ${usageType} használat (${usage}%) a "${serverName}" szerveren`;
            return await this.createWarningNotification(message);
        } catch (error) {
            logger.error(`Error creating high usage notification for server ${serverName}:`, error);
            throw error;
        }
    }

    async getRecentNotificationsByType(type, hours = 24) {
        try {
            return await this.notificationRepository.findRecentByType(type, hours);
        } catch (error) {
            logger.error(`Service error getting recent notifications by type ${type}:`, error);
            throw error;
        }
    }
}