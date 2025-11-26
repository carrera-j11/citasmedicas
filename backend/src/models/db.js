const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const dbPath = process.env.DB_FILE || path.join(__dirname, '../../data/citas.db');

const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre_completo TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    rol TEXT NOT NULL CHECK (rol IN ('PACIENTE','DOCTOR','ADMIN')),
    activo INTEGER NOT NULL DEFAULT 1
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS pacientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    cedula TEXT NOT NULL UNIQUE,
    telefono TEXT,
    direccion TEXT,
    fecha_nacimiento TEXT,
    sexo TEXT,
    observaciones_generales TEXT,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id)
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS especialidades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS doctores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    especialidad_id INTEGER NOT NULL,
    numero_licencia TEXT,
    telefono TEXT,
    activo INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY(usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY(especialidad_id) REFERENCES especialidades(id)
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS horarios_doctor (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    doctor_id INTEGER NOT NULL,
    dia_semana TEXT NOT NULL,
    hora_inicio TEXT NOT NULL,
    hora_fin TEXT NOT NULL,
    duracion_cita_min INTEGER NOT NULL DEFAULT 30,
    FOREIGN KEY(doctor_id) REFERENCES doctores(id)
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    especialidad_id INTEGER NOT NULL,
    fecha_cita TEXT NOT NULL,
    hora_cita TEXT NOT NULL,
    estado TEXT NOT NULL CHECK (estado IN ('AGENDADA','ATENDIDA','CANCELADA','RECHAZADA')) DEFAULT 'AGENDADA',
    motivo TEXT,
    notas_admin TEXT,
    FOREIGN KEY(paciente_id) REFERENCES pacientes(id),
    FOREIGN KEY(doctor_id) REFERENCES doctores(id),
    FOREIGN KEY(especialidad_id) REFERENCES especialidades(id)
  );`);

  db.run(`CREATE TABLE IF NOT EXISTS historial_citas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cita_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    diagnostico TEXT,
    tratamiento TEXT,
    notas TEXT,
    fecha_registro TEXT NOT NULL,
    FOREIGN KEY(cita_id) REFERENCES citas(id),
    FOREIGN KEY(doctor_id) REFERENCES doctores(id)
  );`);
});

module.exports = db;

