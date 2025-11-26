const db = require('../src/models/db');
const bcrypt = require('bcryptjs');

const adminName = 'Admin Principal';
const adminEmail = 'admin@admin.com';
const adminPassword = 'admin123';
const passwordHash = bcrypt.hashSync(adminPassword, 10);

db.run(
  `INSERT INTO usuarios (nombre_completo, email, password_hash, rol, activo)
   VALUES (?, ?, ?, 'ADMIN', 1)`,
  [adminName, adminEmail, passwordHash],
  function (err) {
    if (err) {
      console.error('❌ Error al crear admin:', err.message);
    } else {
      console.log('✅ Administrador creado con éxito');
      console.log('Email:', adminEmail);
      console.log('Contraseña:', adminPassword);
    }
    process.exit();
  }
);
