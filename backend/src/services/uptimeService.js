import { MetricsService } from './metricsService.js';
import { HISTORY_RETENTION_DAYS } from '../config/environment.js';
import logger from '../utils/logger.js';

export class UptimeService {
    constructor() {
        this.metricsService = new MetricsService();
    }

    async calculateUptime(serverId) {
        try {
            const history = await this.metricsService.getServerHistory(serverId);

            if (history.length === 0) {
                return 0;
            }

            const onlineEntries = history.filter(entry => entry.status === 'online').length;
            const maxEntries = Math.min(history.length, 24 * 60 * HISTORY_RETENTION_DAYS);

            return (onlineEntries / maxEntries) * 100;
        } catch (error) {
            logger.error(`Error calculating uptime for server ${serverId}:`, error);
            return 0;
        }
    }

    async getUptimeStats(serverId, timeRange = '24h') {
        try {
            const history = await this.metricsService.getServerHistory(serverId);

            if (history.length === 0) {
                return { uptime: 0, totalChecks: 0, onlineChecks: 0 };
            }

            const cutoffTime = this._getCutoffTime(timeRange);
            const relevantHistory = history.filter(entry =>
                new Date(entry.timestamp) >= cutoffTime
            );

            const onlineChecks = relevantHistory.filter(entry => entry.status === 'online').length;
            const totalChecks = relevantHistory.length;
            const uptime = totalChecks > 0 ? (onlineChecks / totalChecks) * 100 : 0;

            return {
                uptime: Math.round(uptime * 100) / 100,
                totalChecks,
                onlineChecks,
                timeRange
            };
        } catch (error) {
            logger.error(`Error getting uptime stats for server ${serverId}:`, error);
            throw error;
        }
    }

    _getCutoffTime(timeRange) {
        const now = new Date();

        switch (timeRange) {
            case '1h':
                return new Date(now.getTime() - 60 * 60 * 1000);
            case '24h':
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
            case '7d':
                return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            case '30d':
                return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            default:
                return new Date(now.getTime() - 24 * 60 * 60 * 1000);
        }
    }
}