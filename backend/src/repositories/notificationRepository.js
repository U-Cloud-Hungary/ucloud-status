import { BaseRepository } from './BaseRepository.js';
import { Notification } from '../models/Notification.js';
import logger from '../utils/logger.js';

export class NotificationRepository extends BaseRepository {
    constructor() {
        super('notification');
    }

    static get NOTIFICATION_TYPES() {
        return {
            ERROR: 'error',
            WARNING: 'warning',
            INFO: 'info',
            SUCCESS: 'success'
        };
    }

    async findAll(includeInactive = false) {
        const where = includeInactive ? {} : { active: true };

        const notifications = await this.findMany({
            where,
            orderBy: { timestamp: 'desc' }
        });

        return this._mapToModels(notifications);
    }

    async findActive() {
        const notifications = await this.findMany({
            where: { active: true },
            orderBy: { timestamp: 'desc' }
        });

        return this._mapToModels(notifications);
    }

    async findByType(type, includeInactive = false) {
        this._validateNotificationType(type);

        const where = { type };
        if (!includeInactive) {
            where.active = true;
        }

        const notifications = await this.findMany({
            where,
            orderBy: { timestamp: 'desc' }
        });

        return this._mapToModels(notifications);
    }

    async createNotification(notificationData) {
        this._validateNotificationType(notificationData.type);
        this._validateNotificationMessage(notificationData.message);

        const data = {
            id: notificationData.id || crypto.randomUUID(),
            type: notificationData.type,
            message: notificationData.message.trim(),
            active: notificationData.active !== undefined ? notificationData.active : true,
            timestamp: notificationData.timestamp ? new Date(notificationData.timestamp) : new Date()
        };

        const notification = await this.create(data);

        logger.info(`Notification created: ${notification.type} - ${notification.message.substring(0, 50)}...`);
        return this._mapToModel(notification);
    }

    async updateNotification(id, updateData) {
        const data = {};

        if (updateData.type) {
            this._validateNotificationType(updateData.type);
            data.type = updateData.type;
        }

        if (updateData.message) {
            this._validateNotificationMessage(updateData.message);
            data.message = updateData.message.trim();
        }

        if (updateData.active !== undefined) {
            data.active = updateData.active;
        }

        const notification = await this.update(id, data);

        logger.info(`Notification updated: ${notification.id}`);
        return this._mapToModel(notification);
    }

    async deactivateNotification(id) {
        const notification = await this.update(id, { active: false });

        logger.info(`Notification deactivated: ${id}`);
        return this._mapToModel(notification);
    }

    async activateNotification(id) {
        const notification = await this.update(id, { active: true });

        logger.info(`Notification activated: ${id}`);
        return this._mapToModel(notification);
    }

    async deleteNotification(id) {
        await this.delete(id);

        logger.info(`Notification deleted: ${id}`);
        return true;
    }

    async bulkDeactivate(ids) {
        const result = await this.executeWithErrorHandling(
            () => this.model.updateMany({
                where: { id: { in: ids } },
                data: { active: false }
            }),
            'Bulk deactivate notifications'
        );

        logger.info(`Bulk deactivated ${result.count} notifications`);
        return result.count;
    }

    async getNotificationStats() {
        const [total, active, byType] = await Promise.all([
            this.count(),
            this.count({ active: true }),
            this._getNotificationCountsByType()
        ]);

        return {
            total,
            active,
            inactive: total - active,
            byType
        };
    }

    async deleteOldNotifications(retentionDays = 90) {
        const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

        const deletedCount = await this.executeWithErrorHandling(
            () => this.model.deleteMany({
                where: {
                    active: false,
                    timestamp: { lt: cutoffDate }
                }
            }),
            'Delete old notifications'
        );

        logger.info(`Deleted ${deletedCount.count} old notifications older than ${retentionDays} days`);
        return deletedCount.count;
    }

    async findRecentByType(type, hours = 24) {
        this._validateNotificationType(type);

        const startDate = new Date(Date.now() - hours * 60 * 60 * 1000);

        const notifications = await this.findMany({
            where: {
                type,
                timestamp: { gte: startDate }
            },
            orderBy: { timestamp: 'desc' }
        });

        return this._mapToModels(notifications);
    }

    // Private validation methods
    _validateNotificationType(type) {
        const validTypes = Object.values(NotificationRepository.NOTIFICATION_TYPES);
        if (!validTypes.includes(type)) {
            throw new Error(`Invalid notification type: ${type}. Valid types: ${validTypes.join(', ')}`);
        }
    }

    _validateNotificationMessage(message) {
        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            throw new Error('Notification message is required and must be a non-empty string');
        }

        if (message.length > 1000) {
            throw new Error('Notification message must not exceed 1000 characters');
        }
    }

    async _getNotificationCountsByType() {
        const types = Object.values(NotificationRepository.NOTIFICATION_TYPES);
        const counts = {};

        for (const type of types) {
            counts[type] = await this.count({ type });
        }

        return counts;
    }

    // Private helper methods
    _mapToModel(notificationData) {
        return Notification.fromJSON(notificationData);
    }

    _mapToModels(notificationsData) {
        return notificationsData.map(notification => this._mapToModel(notification));
    }
}