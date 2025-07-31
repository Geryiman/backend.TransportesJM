const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const db = require('../config/db.js');



//registrar usuarios
exports.register = (req, res) => {
  const { nombre, apellidos, telefono, username, password, confirmPassword, genero } = req.body;

  if (!nombre || !apellidos || !telefono || !username || !password || !confirmPassword || !genero)
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });

  if (password !== confirmPassword)
    return res.status(400).json({ message: 'Las contraseñas no coinciden' });

  User.findByUsername(username, (err, results) => {
    if (results.length > 0)
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });

    User.findByPhone(telefono, async (err, results) => {
      if (results.length > 0)
        return res.status(400).json({ message: 'El teléfono ya está registrado' });

      const hashedPassword = await bcrypt.hash(password, 10);
      User.create({ nombre, apellidos, telefono, username, password: hashedPassword, genero }, (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al registrar usuario' });
        res.status(201).json({ message: 'Usuario registrado correctamente' });
      });
    });
  });
};


//login de usuarios
exports.login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });

  User.findByUsername(username, (err, results) => {
    if (results.length === 0)
      return res.status(404).json({ message: 'Usuario no encontrado' });

    const user = results[0];

    // Validar si el usuario está bloqueado
    if (user.estado === 'bloqueado') {
      return res.status(403).json({ message: 'Tu cuenta ha sido bloqueada. Contacta al administrador.' });
    }

    bcrypt.compare(password, user.password, (err, match) => {
      if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({ message: 'Inicio de sesión exitoso', token, user });
    });
  });
};

// Obtener el perfil del usuario por ID
exports.getPerfil = (req, res) => {
  const { id } = req.params;

  db.query(
    'SELECT id, nombre, apellidos, telefono, username, genero, estado, favorito, creado_en FROM usuarios WHERE id = ?',
    [id],
    (err, results) => {
      if (err) {
        console.error("Error al obtener perfil:", err);
        return res.status(500).json({ message: 'Error al obtener el perfil', error: err });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      res.json(results[0]);
    }
  );
};



// Cambiar contraseña de un usuario
exports.cambiarContrasena = (req, res) => {
  const { id, nuevaContrasena } = req.body;

  if (!id || !nuevaContrasena) {
    return res.status(400).json({ message: 'ID y nueva contraseña son requeridos' });
  }

  // Encriptar la nueva contraseña
  bcrypt.hash(nuevaContrasena, 10, (err, hashedPassword) => {
    if (err) {
      console.error('Error al encriptar contraseña:', err);
      return res.status(500).json({ message: 'Error interno al encriptar contraseña' });
    }

    // Actualizar en base de datos
    db.query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, id],
      (err, result) => {
        if (err) {
          console.error('Error al actualizar contraseña:', err);
          return res.status(500).json({ message: 'Error al actualizar la contraseña' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({ message: 'Contraseña actualizada correctamente' });
      }
    );
  });
};

// Obtener reservas del usuario con filtros
exports.obtenerReservasUsuario = (req, res) => {
  const { id } = req.params;
  const { estado, desde, hasta } = req.query;

  let sql = `
    SELECT r.*, v.origen, v.destino, v.fecha, v.hora, u.nombre AS nombre_usuario
    FROM reservas r
    JOIN unidades_viaje uv ON r.id_unidad_viaje = uv.id
    JOIN viajes v ON uv.id_viaje = v.id
    JOIN usuarios u ON r.id_usuario = u.id
    WHERE r.id_usuario = ?
  `;

  const values = [id];

  // Validar el filtro de estado si viene definido y es válido
  if (estado && ['pendiente', 'confirmada', 'rechazada'].includes(estado)) {
    sql += ` AND r.estado = ?`;
    values.push(estado);
  }

  // Filtro de fecha desde-hasta
  if (desde && hasta) {
    sql += ` AND v.fecha BETWEEN ? AND ?`;
    values.push(desde, hasta);
  }

  sql += ` ORDER BY v.fecha ASC, v.hora ASC`;

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener viajes:', err);
      return res.status(500).json({ error: 'Error al obtener viajes del usuario' });
    }

    res.json(results);
  });
};