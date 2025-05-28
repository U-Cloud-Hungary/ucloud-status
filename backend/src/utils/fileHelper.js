import fs from 'fs';
import { join, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DATA_DIR } from '../config/environment.js';
import logger from './logger.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const baseDir = join(__dirname, '../../');

// Cloudron-kompatibilis path kezelés
const getDataPath = () => {
    if (isAbsolute(DATA_DIR)) {
        // Ha abszolút útvonal (pl. /tmp/app/data), használd közvetlenül
        return DATA_DIR;
    } else {
        // Ha relatív útvonal (pl. ./data), építsd fel a baseDir-ből
        return join(baseDir, DATA_DIR);
    }
};

const ACTUAL_DATA_PATH = getDataPath();

export const PATHS = {
    DATA: ACTUAL_DATA_PATH,
    METRICS: join(ACTUAL_DATA_PATH, 'metrics'),
    HISTORY: join(ACTUAL_DATA_PATH, 'history'),
    NOTIFICATIONS: join(ACTUAL_DATA_PATH, 'notifications.json'),
    CATEGORIES: join(ACTUAL_DATA_PATH, 'categories.json'),
    LOGS: join(ACTUAL_DATA_PATH, 'logs')  // Logs is DATA_DIR-be, nem baseDir-be
};

// Debug log
console.log('🔍 FileHelper Debug:');
console.log('  DATA_DIR from env:', DATA_DIR);
console.log('  isAbsolute(DATA_DIR):', isAbsolute(DATA_DIR));
console.log('  ACTUAL_DATA_PATH:', ACTUAL_DATA_PATH);
console.log('  PATHS.DATA:', PATHS.DATA);
console.log('  PATHS.METRICS:', PATHS.METRICS);

export const initializeDirectories = () => {
    const directories = [
        PATHS.DATA,
        PATHS.METRICS,
        PATHS.HISTORY,
        PATHS.LOGS
    ];

    directories.forEach(dir => {
        console.log(`🔍 Attempting to create directory: ${dir}`);
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                logger.info(`Created directory: ${dir}`);
            } else {
                console.log(`✅ Directory already exists: ${dir}`);
            }
        } catch (error) {
            logger.error(`❌ Failed to create directory ${dir}:`, error);
            // Ne álljon le az app, folytassa
        }
    });

    initializeDataFiles();
};

const initializeDataFiles = () => {
    // Initialize notifications file
    try {
        if (!fs.existsSync(PATHS.NOTIFICATIONS)) {
            fs.writeFileSync(PATHS.NOTIFICATIONS, JSON.stringify([]));
            logger.info('Initialized notifications.json');
        }
    } catch (error) {
        logger.error('Failed to initialize notifications.json:', error);
    }

    // Initialize categories file
    try {
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
    } catch (error) {
        logger.error('Failed to initialize categories.json:', error);
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