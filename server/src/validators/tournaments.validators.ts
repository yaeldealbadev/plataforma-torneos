import { body } from 'express-validator';

const tournamentFields = [
  body('name').notEmpty().withMessage('El nombre es requerido'),
  body('game_id').isInt().withMessage('game_id debe ser un entero'),
  body('start_date').isISO8601().withMessage('start_date debe ser una fecha ISO 8601 válida'),
  body('max_participants').optional().isInt({ min: 1 }).withMessage('max_participants debe ser un entero mayor a 0'),
  body('status').optional().isIn(['open', 'in_progress', 'finished']).withMessage('status inválido'),
  body('prize').optional().isString(),
  body('description').optional().isString(),
];

export const createTournamentValidators = tournamentFields;
export const updateTournamentValidators = tournamentFields;
