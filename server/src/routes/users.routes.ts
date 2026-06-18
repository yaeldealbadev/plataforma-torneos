import { Router } from 'express';
import { body } from 'express-validator';
import * as usersController from '../controllers/users.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/', authMiddleware, roleMiddleware('admin'), usersController.getUsers);

router.get('/:id', authMiddleware, usersController.getUserById);

router.put(
  '/:id',
  authMiddleware,
  body('username').optional().trim().isLength({ min: 3 }).withMessage('Mínimo 3 caracteres'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Email inválido'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Rol inválido'),
  validate,
  usersController.updateUser,
);

router.delete('/:id', authMiddleware, roleMiddleware('admin'), usersController.deleteUser);

export default router;
