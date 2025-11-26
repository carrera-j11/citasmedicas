const db = require('../models/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

function register(req, res, next) {
  const { nombre_completo, email, password, cedula, telefono } = req.body;

  const password_hash = bcrypt.hashSync(password, 10);

  db.serialize(() => {
    db.run(
      'INSERT INTO usuarios (nombre_completo, email, password_hash, rol) VALUES (?,?,?,?)',
      [nombre_completo, email, password_hash, 'PACIENTE'],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed: usuarios.email')) {
            return res.status(409).json({ message: 'El email ya está registrado' });
          }
          return next(err);
        }

        const usuarioId = this.lastID;
        db.run(
          'INSERT INTO pacientes (usuario_id, cedula, telefono) VALUES (?,?,?)',
          [usuarioId, cedula, telefono || null],
          function (err2) {
            if (err2) {
              return next(err2);
            }
            res.status(201).json({ message: 'Paciente registrado correctamente' });
          }
        );
      }
    );
  });
}

function login(req, res, next) {
  const { email, password } = req.body;

  db.get('SELECT * FROM usuarios WHERE email = ?', [email], (err, user) => {
    if (err) return next(err);
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: user.id, rol: user.rol, nombre: user.nombre_completo },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      rol: user.rol,
      nombre: user.nombre_completo
    });
  });
}

module.exports = { register, login };