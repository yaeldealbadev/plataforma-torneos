import { Router } from 'express';
import { body } from 'express-validator';
import * as gamesController from '../controllers/games.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';

const router = Router();

// Reglas de validación del body para crear/actualizar un juego.
const gameValidators = [
  body('title').trim().notEmpty().withMessage('El título es obligatorio.'),
  body('genre').optional({ nullable: true }).isString().withMessage('El género debe ser texto.'),
  body('platform')
    .optional({ nullable: true })
    .isString()
    .withMessage('La plataforma debe ser texto.'),
  body('description')
    .optional({ nullable: true })
    .isString()
    .withMessage('La descripción debe ser texto.'),
  body('image_url')
    .optional({ nullable: true, checkFalsy: true })
    .isURL()
    .withMessage('La imagen debe ser una URL válida.'),
];

// Públicas.
router.get('/', gamesController.listGames);
router.get('/:id', gamesController.getGame);

// Solo admin (autenticación + rol + validación del body).
router.post('/', authMiddleware, roleMiddleware('admin'), gameValidators, validate, gamesController.createGame);
router.put('/:id', authMiddleware, roleMiddleware('admin'), gameValidators, validate, gamesController.updateGame);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), gamesController.deleteGame);

export default router;
