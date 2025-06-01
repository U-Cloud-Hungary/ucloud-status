import dotenv from 'dotenv';
import { existsSync } from 'fs';

console.log('DATABASE_URL BEFORE:', process.env.DATABASE_URL);

if (existsSync('.env')) {
    console.log('✅ .env file found, loading...');

    const result = dotenv.config({
        path: '.env',
        override: true
    });

    console.log('Dotenv result:', result.parsed);
    console.log('DATABASE_URL AFTER:', process.env.DATABASE_URL);
} else {
    console.log('❌ .env file not found');
}

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3001;
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
export const SERVER_OFFLINE_TIMEOUT = parseInt(process.env.SERVER_OFFLINE_TIMEOUT) || 2;
export const HISTORY_RETENTION_DAYS = parseInt(process.env.HISTORY_RETENTION_DAYS) || 365;

// Debug az export után is
console.log('Final DATABASE_URL:', process.env.DATABASE_URL);