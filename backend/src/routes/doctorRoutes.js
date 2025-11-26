const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

router.get('/mis-citas', authRequired, requireRole('DOCTOR'), (req, res, next) => {
  const doctorUserId = req.user.id;
  const fecha = req.query.fecha;

  const sql = `
    SELECT c.*, p.id as paciente_id, u.nombre_completo as nombre_paciente
    FROM citas c
    JOIN pacientes p ON c.paciente_id = p.id
    JOIN usuarios u ON p.usuario_id = u.id
    JOIN doctores d ON c.doctor_id = d.id
    WHERE d.usuario_id = ?
      AND c.fecha_cita = ?
    ORDER BY c.hora_cita ASC
  `;

  db.all(sql, [doctorUserId, fecha], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

router.get('/', authRequired, (req, res, next) => {
  const sql = `
    SELECT d.id, u.nombre_completo as nombre, e.nombre as especialidad
    FROM doctores d
    JOIN usuarios u ON d.usuario_id = u.id
    JOIN especialidades e ON d.especialidad_id = e.id
    WHERE d.activo = 1
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
});

module.exports = router;