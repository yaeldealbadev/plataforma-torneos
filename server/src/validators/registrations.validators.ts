import { body } from 'express-validator';

export const createRegistrationValidators = [
  body('tournament_id').isInt().withMessage('tournament_id debe ser un entero'),
];

export const updateRegistrationStatusValidators = [
  body('status')
    .isIn(['registered', 'cancelled'])
    .withMessage('status debe ser "registered" o "cancelled"'),
];
