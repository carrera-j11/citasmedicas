const { body } = require('express-validator');

const registerValidator = [
  body('nombre_completo').notEmpty().withMessage('El nombre es obligatorio'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('cedula').notEmpty().withMessage('La cédula es obligatoria')
];

const loginValidator = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').notEmpty().withMessage('La contraseña es obligatoria')
];

module.exports = { registerValidator, loginValidator };