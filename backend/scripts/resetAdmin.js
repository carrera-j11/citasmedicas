const db = require('../src/models/db');
const bcrypt = require('bcryptjs');

const adminName = 'Admin Principal';
const adminEmail = 'admin@admin.com';
const adminPassword = 'admin123';
const passwordHash = bcrypt.hashSync(adminPassword, 10);

db.get(
  'SELECT * FROM usuarios WHERE email = ?',
  [adminEmail],
  (err, row) => {
    if (err) {
      console.error('❌ Error consultando usuarios:', err.message);
      process.exit(1);
    }

    if (row) {
      db.run(
        "UPDATE usuarios SET nombre_completo = ?, password_hash = ?, rol = 'ADMIN', activo = 1 WHERE id = ?",
        [adminName, passwordHash, row.id],
        function (err2) {
          if (err2) {
            console.error('❌ Error actualizando admin:', err2.message);
          } else {
            console.log('✅ Admin ACTUALIZADO correctamente');
            console.log('Email:', adminEmail);
            console.log('Contraseña:', adminPassword);
          }
          process.exit();
        }
      );
    } else {
      db.run(
        "INSERT INTO usuarios (nombre_completo, email, password_hash, rol, activo) VALUES (?,?,?,?,1)",
        [adminName, adminEmail, passwordHash, 'ADMIN'],
        function (err3) {
          if (err3) {
            console.error('❌ Error creando admin:', err3.message);
          } else {
            console.log('✅ Admin CREADO correctamente');
            console.log('Email:', adminEmail);
            console.log('Contraseña:', adminPassword);
          }
          process.exit();
        }
      );
    }
  }
);
