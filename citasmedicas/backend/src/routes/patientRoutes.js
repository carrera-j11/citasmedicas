const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { authRequired, requireRole } = require('../middleware/authMiddleware');

router.get('/me', authRequired, requireRole('PACIENTE'), (req, res, next) => {
  const userId = req.user.id;
  const sql = `
    SELECT p.*, u.nombre_completo, u.email
    FROM pacientes p
    JOIN usuarios u ON p.usuario_id = u.id
    WHERE u.id = ?
  `;
  db.get(sql, [userId], (err, row) => {
    if (err) return next(err);
    res.json(row);
  });
});

module.exports = router;
