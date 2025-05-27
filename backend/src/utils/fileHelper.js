import fs from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DATA_DIR } from '../config/environment.js';
import logger from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDir = join(__dirname, '../../');

export const PATHS = {
    DATA: join(baseDir, DATA_DIR),
    METRICS: join(baseDir, DATA_DIR, 'metrics'),
    HISTORY: join(baseDir, DATA_DIR, 'history'),
    NOTIFICATIONS: join(baseDir, DATA_DIR, 'notifications.json'),
    CATEGORIES: join(baseDir, DATA_DIR, 'categories.json'),
    LOGS: join(baseDir, 'logs')
};

export const initializeDirectories = () => {
    const directories = [
        PATHS.DATA,
        PATHS.METRICS,
        PATHS.HISTORY,
        PATHS.LOGS
    ];

    directories.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
            logger.info(`Created directory: ${dir}`);
        }
    });

    initializeDataFiles();
};

const initializeDataFiles = () => {
    // Initialize notifications file
    if (!fs.existsSync(PATHS.NOTIFICATIONS)) {
        fs.writeFileSync(PATHS.NOTIFICATIONS, JSON.stringify([]));
        logger.info('Initialized notifications.json');
    }

    // Initialize categories file
    if (!fs.existsSync(PATHS.CATEGORIES)) {
        const initialCategories = {
            categories: [
                {
                    id: 'vps_backend',
                    name: 'VPS Backend',
                    servers: []
                }
            ]
        };
        fs.writeFileSync(PATHS.CATEGORIES, JSON.stringify(initialCategories, null, 2));
        logger.info('Initialized categories.json');
    }
};

export const readJSONFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error(`Error reading JSON file ${filePath}:`, error);
        throw new Error(`Failed to read JSON file: ${filePath}`);
    }
};

export const writeJSONFile = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (error) {
        logger.error(`Error writing JSON file ${filePath}:`, error);
        throw new Error(`Failed to write JSON file: ${filePath}`);
    }
};

export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            logger.info(`Deleted file: ${filePath}`);
        }
    } catch (error) {
        logger.error(`Error deleting file ${filePath}:`, error);
        throw new Error(`Failed to delete file: ${filePath}`);
    }
};