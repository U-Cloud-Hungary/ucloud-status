import { db } from '../database/database.js';
import logger from '../utils/logger.js';

export class BaseRepository {
    constructor(modelName) {
        this.db = db;
        this.modelName = modelName;
        this.model = db[modelName];
    }

    async executeWithErrorHandling(operation, operationName) {
        try {
            return await operation();
        } catch (error) {
            logger.error(`${operationName} failed for ${this.modelName}:`, error);

            // Handle specific Prisma errors
            if (error.code === 'P2002') {
                throw new Error(`Duplicate entry: ${error.meta?.target?.join(', ') || 'unknown field'}`);
            }

            if (error.code === 'P2025') {
                throw new Error(`Record not found`);
            }

            if (error.code === 'P2003') {
                throw new Error(`Foreign key constraint failed`);
            }

            throw error;
        }
    }

    async findById(id, include = {}) {
        return this.executeWithErrorHandling(
            () => this.model.findUnique({
                where: { id },
                include
            }),
            `Find ${this.modelName} by ID`
        );
    }

    async findMany(options = {}) {
        return this.executeWithErrorHandling(
            () => this.model.findMany(options),
            `Find many ${this.modelName}`
        );
    }

    async create(data, include = {}) {
        return this.executeWithErrorHandling(
            () => this.model.create({
                data,
                include
            }),
            `Create ${this.modelName}`
        );
    }

    async update(id, data, include = {}) {
        return this.executeWithErrorHandling(
            () => this.model.update({
                where: { id },
                data,
                include
            }),
            `Update ${this.modelName}`
        );
    }

    async delete(id) {
        return this.executeWithErrorHandling(
            () => this.model.delete({
                where: { id }
            }),
            `Delete ${this.modelName}`
        );
    }

    async count(where = {}) {
        return this.executeWithErrorHandling(
            () => this.model.count({ where }),
            `Count ${this.modelName}`
        );
    }

    async exists(id) {
        const count = await this.count({ id });
        return count > 0;
    }
}