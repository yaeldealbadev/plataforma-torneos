import { Router } from 'express';
import * as tournamentsController from '../controllers/tournaments.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { roleMiddleware } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import { createTournamentValidators, updateTournamentValidators } from '../validators/tournaments.validators.js';

const router = Router();

router.get('/', tournamentsController.getTournaments);
router.get('/:id', tournamentsController.getTournamentById);
router.post('/', authMiddleware, roleMiddleware('admin'), ...createTournamentValidators, validate, tournamentsController.createTournament);
router.put('/:id', authMiddleware, roleMiddleware('admin'), ...updateTournamentValidators, validate, tournamentsController.updateTournament);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), tournamentsController.deleteTournament);

export default router;
