import { join } from 'path';
import { Metrics } from '../models/Metrics.js';
import { readJSONFile, writeJSONFile, deleteFile, PATHS } from '../utils/fileHelper.js';
import { HISTORY_RETENTION_DAYS } from '../config/environment.js';
import logger from '../utils/logger.js';

export class MetricsService {
    async getServerMetrics(serverId) {
        try {
            const metricsFile = join(PATHS.METRICS, `${serverId}.json`);
            const data = readJSONFile(metricsFile);
            return Metrics.fromJSON(data);
        } catch (error) {
            logger.error(`Error getting metrics for server ${serverId}:`, error);
            throw new Error('Failed to retrieve server metrics');
        }
    }

    async getServerHistory(serverId) {
        try {
            const historyFile = join(PATHS.HISTORY, `${serverId}.json`);
            return readJSONFile(historyFile);
        } catch (error) {
            logger.error(`Error getting history for server ${serverId}:`, error);
            throw new Error('Failed to retrieve server history');
        }
    }

    async initializeServerMetrics(server) {
        try {
            const initialMetrics = new Metrics({
                id: server.id,
                name: server.name,
                location: server.location,
                status: 'offline',
                metrics: { cpu: 0, ram: 0, disk: 0 }
            });

            const metricsFile = join(PATHS.METRICS, `${server.id}.json`);
            const historyFile = join(PATHS.HISTORY, `${server.id}.json`);

            writeJSONFile(metricsFile, initialMetrics.toJSON());
            writeJSONFile(historyFile, []);

            logger.info(`Initialized metrics for server: ${server.name}`);
        } catch (error) {
            logger.error(`Error initializing metrics for server ${server.id}:`, error);
            throw new Error('Failed to initialize server metrics');
        }
    }

    async updateServerMetrics(serverId, newMetrics) {
        try {
            // Validate metrics
            this._validateMetrics(newMetrics);

            // Update metrics file
            const metricsFile = join(PATHS.METRICS, `${serverId}.json`);
            const currentMetrics = Metrics.fromJSON(readJSONFile(metricsFile));

            currentMetrics.updateMetrics(newMetrics);
            writeJSONFile(metricsFile, currentMetrics.toJSON());

            // Update history
            await this._updateHistory(serverId, {
                timestamp: new Date().toISOString(),
                status: 'online',
                metrics: newMetrics
            });

            logger.info(`Updated metrics for server: ${serverId}`);
            return currentMetrics;
        } catch (error) {
            logger.error(`Error updating metrics for server ${serverId}:`, error);
            throw error;
        }
    }

    async setServerOffline(serverId) {
        try {
            const metricsFile = join(PATHS.METRICS, `${serverId}.json`);
            const metrics = Metrics.fromJSON(readJSONFile(metricsFile));

            metrics.setOffline();
            writeJSONFile(metricsFile, metrics.toJSON());

            // Update history
            await this._updateHistory(serverId, {
                timestamp: new Date().toISOString(),
                status: 'offline',
                metrics: { cpu: 0, ram: 0, disk: 0 }
            });

            logger.info(`Set server offline: ${serverId}`);
            return metrics;
        } catch (error) {
            logger.error(`Error setting server offline ${serverId}:`, error);
            throw error;
        }
    }

    async deleteServerData(serverId) {
        try {
            const metricsFile = join(PATHS.METRICS, `${serverId}.json`);
            const historyFile = join(PATHS.HISTORY, `${serverId}.json`);

            deleteFile(metricsFile);
            deleteFile(historyFile);

            logger.info(`Deleted data for server: ${serverId}`);
        } catch (error) {
            logger.error(`Error deleting data for server ${serverId}:`, error);
            throw error;
        }
    }

    async _updateHistory(serverId, historyEntry) {
        try {
            const historyFile = join(PATHS.HISTORY, `${serverId}.json`);
            const history = readJSONFile(historyFile);

            history.push(historyEntry);

            // Calculate retention limit (entries per day * retention days)
            const maxEntries = 24 * 60 * HISTORY_RETENTION_DAYS; // 1 entry per minute

            if (history.length > maxEntries) {
                history.splice(0, history.length - maxEntries);
            }

            writeJSONFile(historyFile, history);
        } catch (error) {
            logger.error(`Error updating history for server ${serverId}:`, error);
            throw error;
        }
    }

    _validateMetrics(metrics) {
        const requiredFields = ['cpu', 'ram', 'disk'];

        for (const field of requiredFields) {
            if (typeof metrics[field] !== 'number') {
                throw new Error(`${field} must be a number`);
            }

            if (metrics[field] < 0 || metrics[field] > 100) {
                throw new Error(`${field} must be between 0 and 100`);
            }
        }
    }
}