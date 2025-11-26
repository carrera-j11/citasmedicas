const db = require('../models/db');

// ESPECIALIDADES
function listEspecialidades(req, res, next) {
  db.all('SELECT * FROM especialidades ORDER BY nombre ASC', [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

function createEspecialidad(req, res, next) {
  const { nombre, descripcion } = req.body;
  db.run(
    'INSERT INTO especialidades (nombre, descripcion) VALUES (?, ?)',
    [nombre, descripcion || null],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE')) {
          return res.status(409).json({ message: 'La especialidad ya existe' });
        }
        return next(err);
      }
      res.status(201).json({ id: this.lastID, message: 'Especialidad creada' });
    }
  );
}

// DOCTORES
function listDoctoresAdmin(req, res, next) {
  const sql = `
    SELECT d.id, u.nombre_completo, u.email, d.numero_licencia,
           d.telefono, d.activo, e.nombre AS especialidad, e.id AS especialidad_id
    FROM doctores d
    JOIN usuarios u ON d.usuario_id = u.id
    JOIN especialidades e ON d.especialidad_id = e.id
    ORDER BY u.nombre_completo ASC
  `;
  db.all(sql, [], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

function createDoctor(req, res, next) {
  const { nombre_completo, email, password, telefono, numero_licencia, especialidad_id } = req.body;
  const bcrypt = require('bcryptjs');
  const password_hash = bcrypt.hashSync(password, 10);

  db.serialize(() => {
    db.run(
      "INSERT INTO usuarios (nombre_completo, email, password_hash, rol, activo) VALUES (?,?,?,?,1)",
      [nombre_completo, email, password_hash, 'DOCTOR'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ message: 'El email ya está registrado' });
          }
          return next(err);
        }

        const usuarioId = this.lastID;

        db.run(
          "INSERT INTO doctores (usuario_id, especialidad_id, numero_licencia, telefono, activo) VALUES (?,?,?,?,1)",
          [usuarioId, especialidad_id, numero_licencia, telefono || null],
          function (err2) {
            if (err2) return next(err2);
            res.status(201).json({ id: this.lastID, message: 'Doctor creado correctamente' });
          }
        );
      }
    );
  });
}

// HORARIOS
function listHorarios(req, res, next) {
  const doctorId = parseInt(req.query.doctor_id, 10);
  const sql = `
    SELECT * FROM horarios_doctor
    WHERE doctor_id = ?
    ORDER BY id ASC
  `;
  db.all(sql, [doctorId], (err, rows) => {
    if (err) return next(err);
    res.json(rows);
  });
}

function createHorario(req, res, next) {
  const { doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_min } = req.body;
  db.run(
    `INSERT INTO horarios_doctor (doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_min)
     VALUES (?,?,?,?,?)`,
    [doctor_id, dia_semana, hora_inicio, hora_fin, duracion_cita_min],
    function (err) {
      if (err) return next(err);
      res.status(201).json({ id: this.lastID, message: 'Horario creado' });
    }
  );
}

// REPORTES
function monthlyReport(req, res, next) {
  const anio = req.query.anio.toString();
  const mes = req.query.mes.toString().padStart(2, '0');

  const params = [anio, mes];

  const resumen = {
    anio,
    mes,
    total_citas: 0,
    citas_por_especialidad: [],
    estados: {}
  };

  const sqlTotal = `
    SELECT COUNT(*) AS total
    FROM citas
    WHERE substr(fecha_cita,1,4) = ?
      AND substr(fecha_cita,6,2) = ?
  `;

  const sqlPorEspecialidad = `
    SELECT e.nombre AS especialidad, COUNT(*) AS total
    FROM citas c
    JOIN especialidades e ON c.especialidad_id = e.id
    WHERE substr(c.fecha_cita,1,4) = ?
      AND substr(c.fecha_cita,6,2) = ?
    GROUP BY e.nombre
    ORDER BY total DESC
  `;

  const sqlPorEstado = `
    SELECT estado, COUNT(*) AS total
    FROM citas
    WHERE substr(fecha_cita,1,4) = ?
      AND substr(fecha_cita,6,2) = ?
    GROUP BY estado
  `;

  db.get(sqlTotal, params, (err, rowTotal) => {
    if (err) return next(err);
    resumen.total_citas = rowTotal ? rowTotal.total : 0;

    db.all(sqlPorEspecialidad, params, (err2, rowsEsp) => {
      if (err2) return next(err2);
      resumen.citas_por_especialidad = rowsEsp || [];

      db.all(sqlPorEstado, params, (err3, rowsEstado) => {
        if (err3) return next(err3);
        (rowsEstado || []).forEach(r => {
          resumen.estados[r.estado] = r.total;
        });

        res.json(resumen);
      });
    });
  });
}

module.exports = {
  listEspecialidades,
  createEspecialidad,
  listDoctoresAdmin,
  createDoctor,
  listHorarios,
  createHorario,
  monthlyReport
};
