import { Router } from 'express';
import * as gamesController from '../controllers/games.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

// Placeholders de rutas de juegos.
router.get('/', gamesController.getGames);
router.get('/:id', gamesController.getGameById);
router.post('/', authMiddleware, roleMiddleware('admin'), gamesController.createGame);
router.put('/:id', authMiddleware, roleMiddleware('admin'), gamesController.updateGame);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), gamesController.deleteGame);

export default router;
