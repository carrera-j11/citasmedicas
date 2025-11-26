const db = require('../models/db');
const dayjs = require('dayjs');

/**
 * Crear cita:
 * - El paciente envía la solicitud.
 * - La cita se crea en estado AGENDADA (pendiente / en revisión).
 * - El ADMIN o DOCTOR luego puede cambiarla a RECHAZADA, CANCELADA, ATENDIDA.
 */
function createAppointment(req, res, next) {
  const {
    paciente_id,
    doctor_id,
    fecha_cita,
    hora_cita,
    motivo
  } = req.body;

  // Validar que la fecha/hora sea futura
  const now = dayjs();
  const fechaHora = dayjs(`${fecha_cita} ${hora_cita}`);
  if (!fechaHora.isAfter(now)) {
    return res
      .status(400)
      .json({ message: 'La fecha y hora de la cita debe ser futura' });
  }

  // 1) Verificar que el doctor exista y obtener su especialidad
  const sqlDoctor = `
    SELECT id, especialidad_id
    FROM doctores
    WHERE id = ?
  `;

  db.get(sqlDoctor, [doctor_id], (errDoc, doctorRow) => {
    if (errDoc) return next(errDoc);
    if (!doctorRow) {
      return res.status(400).json({ message: 'El doctor no existe' });
    }

    const especialidad_id = doctorRow.especialidad_id;

    // 2) Verificar que NO haya otra cita en ese mismo horario
    const query = `
      SELECT * FROM citas
      WHERE doctor_id = ?
        AND fecha_cita = ?
        AND hora_cita = ?
        AND estado IN ('AGENDADA','ATENDIDA')
    `;

    db.get(query, [doctor_id, fecha_cita, hora_cita], (err, row) => {
      if (err) return next(err);
      if (row) {
        return res
          .status(409)
          .json({ message: 'El doctor ya tiene una cita en ese horario' });
      }

      // 3) Insertar cita en estado AGENDADA
      db.run(
        `INSERT INTO citas (paciente_id, doctor_id, especialidad_id, fecha_cita, hora_cita, estado, motivo)
         VALUES (?,?,?,?,?,'AGENDADA',?)`,
        [paciente_id, doctor_id, especialidad_id, fecha_cita, hora_cita, motivo],
        function (err2) {
          if (err2) return next(err2);
          res.status(201).json({
            message:
              'Cita creada en estado AGENDADA. El administrador o doctor puede revisarla.',
            id: this.lastID
          });
        }
      );
    });
  });
}

/**
 * Historial de citas del paciente
 */
function listAppointmentsPaciente(req, res, next) {
  const pacienteId = parseInt(req.params.pacienteId, 10);

  const sql = `
    SELECT c.*, d.id as doctor_id, u.nombre_completo as nombre_doctor, e.nombre as especialidad
    FROM citas c
    JOIN doctores d ON c.doctor_id = d.id
    JOIN usuarios u ON d.usuario_id = u.id
    JOIN especialidades e ON c.especialidad_id = e.id
    WHERE c.paciente_id = ?
    ORDER BY fecha_cita DESC, hora_cita DESC
  `;

  db.all(sql, [pacienteId], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

/**
 * Listar citas "pendientes" para el ADMIN:
 * - Consideramos pendientes todas las que están en estado AGENDADA.
 */
function listPendingAppointments(req, res, next) {
  const sql = `
    SELECT
      c.id,
      c.fecha_cita,
      c.hora_cita,
      c.estado,
      c.motivo,
      up.nombre_completo AS nombre_paciente,
      ud.nombre_completo AS nombre_doctor,
      e.nombre AS especialidad
    FROM citas c
    JOIN pacientes p ON c.paciente_id = p.id
    JOIN usuarios up ON p.usuario_id = up.id
    JOIN doctores d ON c.doctor_id = d.id
    JOIN usuarios ud ON d.usuario_id = ud.id
    JOIN especialidades e ON c.especialidad_id = e.id
    WHERE c.estado = 'AGENDADA'
    ORDER BY c.fecha_cita ASC, c.hora_cita ASC
  `;

  db.all(sql, [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

/**
 * Listar citas del doctor logueado (agenda):
 * - Muestra solo citas con fecha mayor o igual a hoy.
 */
function listDoctorAppointments(req, res, next) {
  const usuarioId = req.user.id; // id en tabla usuarios

  const sql = `
    SELECT
      c.id,
      c.fecha_cita,
      c.hora_cita,
      c.estado,
      c.motivo,
      up.nombre_completo AS nombre_paciente
    FROM citas c
    JOIN pacientes p ON c.paciente_id = p.id
    JOIN usuarios up ON p.usuario_id = up.id
    JOIN doctores d ON c.doctor_id = d.id
    WHERE d.usuario_id = ?
      AND c.fecha_cita >= date('now')
    ORDER BY c.fecha_cita ASC, c.hora_cita ASC
  `;

  db.all(sql, [usuarioId], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

/**
 * Cambiar estado de la cita (ADMIN o DOCTOR):
 * AGENDADA → RECHAZADA / CANCELADA / ATENDIDA
 */
function changeStatus(req, res, next) {
  const id = parseInt(req.params.id, 10);
  const { estado } = req.body;

  db.run(
    'UPDATE citas SET estado = ? WHERE id = ?',
    [estado, id],
    function (err) {
      if (err) return next(err);
      if (this.changes === 0) {
        return res.status(404).json({ message: 'Cita no encontrada' });
      }
      res.json({ message: 'Estado actualizado' });
    }
  );
}

/**
 * Disponibilidad de horarios de un doctor para una fecha:
 * - Usa un HORARIO FIJO del doctor (primer registro en horarios_doctor).
 * - No depende del día de la semana, se aplica para cualquier fecha.
 * - Excluye horarios ocupados (AGENDADA o ATENDIDA).
 */
function getAvailability(req, res, next) {
  const doctorId = parseInt(req.query.doctor_id, 10);
  const fecha = req.query.fecha; // YYYY-MM-DD

  if (!doctorId || !fecha) {
    return res
      .status(400)
      .json({ message: 'doctor_id y fecha son obligatorios' });
  }

  // 1) Obtener un horario fijo del doctor
  const horarioSql = `
    SELECT * FROM horarios_doctor
    WHERE doctor_id = ?
    ORDER BY id ASC
    LIMIT 1
  `;

  db.get(horarioSql, [doctorId], (err, horario) => {
    if (err) return next(err);

    if (!horario) {
      return res.json({ slots: [] });
    }

    // 2) Horas ocupadas para ese día
    const citasSql = `
      SELECT hora_cita FROM citas
      WHERE doctor_id = ?
        AND fecha_cita = ?
        AND estado IN ('AGENDADA','ATENDIDA')
    `;

    db.all(citasSql, [doctorId, fecha], (err2, citas) => {
      if (err2) return next(err2);

      const ocupadas = new Set((citas || []).map(c => c.hora_cita));
      const slots = [];

      const dur = horario.duracion_cita_min || 30;
      let current = dayjs(`${fecha} ${horario.hora_inicio}`);
      const fin = dayjs(`${fecha} ${horario.hora_fin}`);

      while (current.isBefore(fin)) {
        const hora = current.format('HH:mm');
        if (!ocupadas.has(hora)) {
          slots.push(hora);
        }
        current = current.add(dur, 'minute');
      }

      res.json({ slots });
    });
  });
}

module.exports = {
  createAppointment,
  listAppointmentsPaciente,
  listPendingAppointments,
  listDoctorAppointments,
  changeStatus,
  getAvailability
};
