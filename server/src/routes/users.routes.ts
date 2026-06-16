import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

// Placeholders de rutas de usuarios (administración).
router.get('/', authMiddleware, roleMiddleware('admin'), usersController.getUsers);
router.get('/:id', authMiddleware, usersController.getUserById);
router.put('/:id', authMiddleware, usersController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), usersController.deleteUser);

export default router;
