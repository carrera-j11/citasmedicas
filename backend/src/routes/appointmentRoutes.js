const express = require('express');
const router = express.Router();

const { authRequired, requireRole } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validateRequest');

const {
  createAppointmentValidator,
  changeStatusValidator,
  listAppointmentsPacienteValidator
} = require('../validators/appointmentValidators');

const {
  createAppointment,
  listAppointmentsPaciente,
  listPendingAppointments,
  listDoctorAppointments,
  changeStatus,
  getAvailability
} = require('../controllers/appointmentController');

// Todas las rutas de citas requieren usuario autenticado
router.use(authRequired);

// Paciente crea cita (queda AGENDADA)
router.post('/', createAppointmentValidator, validateRequest, createAppointment);

// Historial de citas de un paciente
router.get(
  '/paciente/:pacienteId',
  listAppointmentsPacienteValidator,
  validateRequest,
  listAppointmentsPaciente
);

// ADMIN: citas "pendientes" (AGENDADAS)
router.get(
  '/admin/pendientes',
  requireRole('ADMIN'),
  listPendingAppointments
);

// DOCTOR: ver su agenda de citas futuras
router.get(
  '/doctor/mis-citas',
  requireRole('DOCTOR'),
  listDoctorAppointments
);

// Cambiar estado de una cita (ADMIN o DOCTOR)
router.patch(
  '/:id/estado',
  requireRole('ADMIN', 'DOCTOR'),
  changeStatusValidator,
  validateRequest,
  changeStatus
);

// Disponibilidad de horarios
router.get('/disponibilidad', getAvailability);

module.exports = router;
