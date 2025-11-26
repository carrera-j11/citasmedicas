const { body, param } = require('express-validator');

const createAppointmentValidator = [
  body('paciente_id')
    .isInt({ min: 1 })
    .withMessage('Paciente inválido'),
  body('doctor_id')
    .isInt({ min: 1 })
    .withMessage('Doctor inválido'),
  body('fecha_cita')
    .notEmpty().withMessage('La fecha es obligatoria')
    .isISO8601().withMessage('Fecha inválida'),
  body('hora_cita')
    .notEmpty().withMessage('La hora es obligatoria')
    .matches(/^\d{2}:\d{2}$/)
    .withMessage('La hora debe estar en formato HH:MM'),
  body('motivo')
    .optional()
    .isLength({ min: 5 })
    .withMessage('El motivo debe tener al menos 5 caracteres')
];

const changeStatusValidator = [
  param('id')
    .isInt({ min: 1 }).withMessage('Id inválido'),
  body('estado')
    .isIn(['AGENDADA', 'RECHAZADA', 'CANCELADA', 'ATENDIDA'])
    .withMessage('Estado inválido')
];

const listAppointmentsPacienteValidator = [
  param('pacienteId')
    .isInt({ min: 1 }).withMessage('Id de paciente inválido')
];

module.exports = {
  createAppointmentValidator,
  changeStatusValidator,
  listAppointmentsPacienteValidator
};
