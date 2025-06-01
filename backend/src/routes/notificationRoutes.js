import express from 'express';
import { NotificationController } from '../controllers/notificationController.js';
import { validateNotification } from '../middleware/validation.js';

const router = express.Router();
const notificationController = new NotificationController();

router.get('/', notificationController.getAllNotifications);
router.post('/', validateNotification, notificationController.createNotification);
router.delete('/:id', notificationController.deactivateNotification);

export default router;