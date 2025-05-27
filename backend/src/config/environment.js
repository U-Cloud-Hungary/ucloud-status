import dotenv from 'dotenv';

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || 3000;
export const DATA_DIR = process.env.DATA_DIR || './data';
export const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
export const SERVER_OFFLINE_TIMEOUT = parseInt(process.env.SERVER_OFFLINE_TIMEOUT) || 2; // minutes
export const HISTORY_RETENTION_DAYS = parseInt(process.env.HISTORY_RETENTION_DAYS) || 365;

// src/models/Server.js
export class Server {
    constructor({ id, name, location, apiKey, categoryId }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.apiKey = apiKey;
        this.categoryId = categoryId;
    }

    static fromJSON(data) {
        return new Server(data);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            apiKey: this.apiKey,
            categoryId: this.categoryId
        };
    }
}