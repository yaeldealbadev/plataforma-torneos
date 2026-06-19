import { Router } from 'express';
import * as registrationsController from '../controllers/registrations.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createRegistrationValidators, updateRegistrationStatusValidators } from '../validators/registrations.validators.js';

const router = Router();

router.get('/me', authMiddleware, registrationsController.getMyRegistrations);
router.post('/', authMiddleware, ...createRegistrationValidators, validate, registrationsController.createRegistration);
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware('admin'),
  ...updateRegistrationStatusValidators,
  validate,
  registrationsController.updateRegistrationStatus
);
router.delete('/:id', authMiddleware, registrationsController.deleteRegistration);

export default router;
