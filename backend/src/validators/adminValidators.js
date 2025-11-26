const { body, query } = require('express-validator');

const createEspecialidadValidator = [
  body('nombre')
    .notEmpty().withMessage('El nombre es obligatorio'),
  body('descripcion')
    .optional()
    .isLength({ max: 255 }).withMessage('Descripción muy larga')
];

const createDoctorValidator = [
  body('nombre_completo')
    .notEmpty().withMessage('El nombre es obligatorio'),
  body('email')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 }).withMessage('Contraseña mínima de 6 caracteres'),
  body('telefono')
    .optional()
    .isLength({ max: 50 }),
  body('numero_licencia')
    .notEmpty().withMessage('La licencia es obligatoria'),
  body('especialidad_id')
    .isInt({ min: 1 }).withMessage('Especialidad inválida')
];

const createHorarioValidator = [
  body('doctor_id')
    .notEmpty().withMessage('El doctor es obligatorio')
    .isInt({ min: 1 }).withMessage('Doctor inválido'),

  body('dia_semana')
    .notEmpty().withMessage('El día de la semana es obligatorio'),

  body('hora_inicio')
    .notEmpty().withMessage('La hora de inicio es obligatoria')
    .matches(/^\d{2}:\d{2}$/).withMessage('Hora de inicio inválida (use HH:MM)'),

  body('hora_fin')
    .notEmpty().withMessage('La hora de fin es obligatoria')
    .matches(/^\d{2}:\d{2}$/).withMessage('Hora de fin inválida (use HH:MM)'),

  body('duracion_cita_min')
    .optional()
    .isInt({ min: 5 }).withMessage('La duración debe ser un número de minutos')
];

const monthlyReportValidator = [
  query('anio').optional(),
  query('mes').optional()
];

module.exports = {
  createEspecialidadValidator,
  createDoctorValidator,
  createHorarioValidator,
  monthlyReportValidator
};
