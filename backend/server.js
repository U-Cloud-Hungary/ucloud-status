import app from './src/app.js';
import { PORT } from './src/config/environment.js';
import logger from './src/utils/logger.js';

const startServer = () => {
    try {
        app.listen(PORT, () => {
            logger.info(`Server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();