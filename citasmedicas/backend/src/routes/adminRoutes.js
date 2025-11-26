const express = require('express');
const router = express.Router();

const { authRequired, requireRole } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');
const {
  createEspecialidadValidator,
  createDoctorValidator,
  createHorarioValidator,
  monthlyReportValidator
} = require('../validators/adminValidators');

const {
  listEspecialidades,
  createEspecialidad,
  listDoctoresAdmin,
  createDoctor,
  listHorarios,
  createHorario,
  monthlyReport
} = require('../controllers/adminController');


router.use(authRequired, requireRole('ADMIN'));


router.get('/especialidades', listEspecialidades);
router.post('/especialidades', createEspecialidadValidator, validateRequest, createEspecialidad);


router.get('/doctores', listDoctoresAdmin);
router.post('/doctores', createDoctorValidator, validateRequest, createDoctor);


router.get('/horarios', listHorarios);
router.post('/horarios', createHorarioValidator, validateRequest, createHorario);


router.get('/reportes/mensuales', monthlyReportValidator, validateRequest, monthlyReport);

module.exports = router;
