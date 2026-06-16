import { Router } from 'express';
import * as registrationsController from '../controllers/registrations.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

// Placeholders de rutas de inscripciones.
router.get('/me', authMiddleware, registrationsController.getMyRegistrations);
router.post('/', authMiddleware, registrationsController.createRegistration);
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  registrationsController.updateRegistrationStatus
);
router.delete('/:id', authMiddleware, registrationsController.deleteRegistration);

export default router;
