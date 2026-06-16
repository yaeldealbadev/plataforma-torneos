import { Router } from 'express';
import * as tournamentsController from '../controllers/tournaments.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';

const router = Router();

// Placeholders de rutas de torneos.
router.get('/', tournamentsController.getTournaments);
router.get('/:id', tournamentsController.getTournamentById);
router.post('/', authMiddleware, roleMiddleware('admin'), tournamentsController.createTournament);
router.put('/:id', authMiddleware, roleMiddleware('admin'), tournamentsController.updateTournament);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), tournamentsController.deleteTournament);

export default router;
