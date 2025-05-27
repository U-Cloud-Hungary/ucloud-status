import express from 'express';
import { ServerController } from '../controllers/serverController.js';
import { validateServer } from '../middleware/validation.js';

const router = express.Router();
const serverController = new ServerController();

router.get('/', serverController.getAllServers);
router.post('/', validateServer, serverController.createServer);
router.put('/:id', validateServer, serverController.updateServer);
router.delete('/:id', serverController.deleteServer);

export default router;