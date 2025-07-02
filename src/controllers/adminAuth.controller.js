const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../models/admin.model');
const db = require('../config/db');


// REGISTRO (solo admin general)
exports.adminRegister = async (req, res) => {
  const solicitante = req.admin;
  if (!solicitante || solicitante.rol !== 'administrador_general') {
    return res.status(403).json({ message: 'Acceso denegado. Solo administradores generales pueden crear usuarios.' });
  }

  const { nombre, username, password, rol } = req.body;

  if (!nombre || !username || !password || !rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  const validRoles = ['administrador_general', 'conductor', 'secretario'];
  if (!validRoles.includes(rol)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  Admin.findByUsername(username, async (err, results) => {
    if (results.length > 0) {
      return res.status(400).json({ message: 'El nombre de usuario ya existe' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    Admin.create({ nombre, username, password: hashedPassword, rol }, (err, result) => {
      if (err) return res.status(500).json({ message: 'Error al registrar administrador' });
      res.status(201).json({ message: 'Administrador registrado correctamente' });
    });
  });
};

// VALIDACIÓN DEL TOKEN
exports.validateToken = (req, res) => {
  const admin = req.admin;
  if (!admin) {
    return res.status(401).json({ message: 'Token no válido' });
  }

  res.status(200).json({
    message: 'Token válido',
    rol: admin.rol,
    nombre: admin.nombre,
    username: admin.username,
  });
};


exports.adminLogin = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ message: 'Usuario y contraseña requeridos' });

  Admin.findByUsername(username, (err, results) => {
    if (results.length === 0)
      return res.status(404).json({ message: 'Administrador no encontrado' });

    const admin = results[0];

    // Verificar si está bloqueado
    if (admin.estado === 'bloqueado') {
      return res.status(403).json({ message: 'Tu cuenta ha sido bloqueada. Contacta al administrador general.' });
    }

    bcrypt.compare(password, admin.password, (err, match) => {
      if (!match) return res.status(401).json({ message: 'Contraseña incorrecta' });

      const token = jwt.sign(
        { id: admin.id, username: admin.username, rol: admin.rol },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({
        message: 'Inicio de sesión exitoso (admin)',
        token,
        admin: {
          id: admin.id,
          nombre: admin.nombre,
          username: admin.username,
          rol: admin.rol
        }
      });
    });
  });
};

    

//obtener todas la informacion de las cuentas de los usuarios y administradores
exports.getAllAccounts = (req, res) => {
  const rol = req.admin?.rol;

  if (rol !== 'administrador_general') {
    return res.status(403).json({ message: 'Acceso denegado. Solo administradores generales.' });
  }

  const queryUsuarios = 'SELECT id, nombre, apellidos, telefono, username, genero, estado, favorito, creado_en FROM usuarios';

  const queryAdmins = 'SELECT id, nombre, username, rol, estado, favorito, creado_en FROM administradores';


  db.query(queryUsuarios, (err1, usuarios) => {
    if (err1) return res.status(500).json({ message: 'Error al consultar usuarios' });

    db.query(queryAdmins, (err2, administradores) => {
      if (err2) return res.status(500).json({ message: 'Error al consultar administradores' });

      res.json({
        usuarios,
        administradores
      });
    });
  });
};


// Actualizar estado o favorito de usuarios/administradores
exports.updateAccountStatus = (req, res) => {
  const rolAdmin = req.admin?.rol;
  if (rolAdmin !== 'administrador_general') {
    return res.status(403).json({ message: 'Acción no permitida' });
  }

  const { tipo, id, accion } = req.body;
  const tabla = tipo === 'usuario' ? 'usuarios' : 'administradores';

  let query = '';
  switch (accion) {
    case 'bloquear':
      query = `UPDATE ${tabla} SET estado = 'bloqueado' WHERE id = ?`;
      break;
    case 'desbloquear':
      query = `UPDATE ${tabla} SET estado = 'activo' WHERE id = ?`;
      break;
    case 'favorito':
      query = `UPDATE ${tabla} SET favorito = 1 WHERE id = ?`;
      break;
    case 'no_favorito':
      query = `UPDATE ${tabla} SET favorito = 0 WHERE id = ?`;
      break;
    default:
      return res.status(400).json({ message: 'Acción inválida' });
  }

  db.query(query, [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al actualizar estado/favorito' });
    res.json({ message: 'Cuenta actualizada correctamente' });
  });
};

// 🗑️ Eliminar usuarios (no admins)
exports.deleteUsuario = (req, res) => {
  const rolAdmin = req.admin?.rol;
  if (rolAdmin !== 'administrador_general') {
    return res.status(403).json({ message: 'Solo administradores generales pueden eliminar usuarios' });
  }

  const { id } = req.params;
  db.query('DELETE FROM usuarios WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error al eliminar usuario' });
    res.json({ message: 'Usuario eliminado correctamente' });
  });
};
