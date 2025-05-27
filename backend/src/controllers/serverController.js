import { ServerService } from '../services/serverService.js';
import { HTTP_STATUS } from '../utils/constants.js';
import logger from '../utils/logger.js';

export class ServerController {
    constructor() {
        this.serverService = new ServerService();
    }

    getAllServers = async (req, res, next) => {
        try {
            const servers = await this.serverService.getAllServersGrouped();
            res.status(HTTP_STATUS.OK).json(servers);
        } catch (error) {
            logger.error('Controller error getting all servers:', error);
            next(error);
        }
    };

    createServer = async (req, res, next) => {
        try {
            const server = await this.serverService.createServer(req.body);
            res.status(HTTP_STATUS.CREATED).json(server);
        } catch (error) {
            logger.error('Controller error creating server:', error);
            next(error);
        }
    };

    updateServer = async (req, res, next) => {
        try {
            const { id } = req.params;
            const server = await this.serverService.updateServer(id, req.body);
            res.status(HTTP_STATUS.OK).json(server);
        } catch (error) {
            logger.error(`Controller error updating server ${req.params.id}:`, error);
            next(error);
        }
    };

    deleteServer = async (req, res, next) => {
        try {
            const { id } = req.params;
            await this.serverService.deleteServer(id);
            res.status(HTTP_STATUS.OK).json({ success: true });
        } catch (error) {
            logger.error(`Controller error deleting server ${req.params.id}:`, error);
            next(error);
        }
    };
}