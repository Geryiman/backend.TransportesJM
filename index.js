require('dotenv').config();
require('./cron/finalizarViajes');
const express = require('express');
const cors = require('cors');
const ipWhitelist = require('./src/middlewares/ipWhitelist');
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/adminAuth.routes');
const viajesRoutes = require('./src/routes/viajes.routes');
const paradasRoutes = require('./src/routes/paradas.routes');
const viajeRegistroRoutes = require('./src/routes/viajeRegistro.route');
const viajesDetalleRoutes = require('./src/routes/viajesDetalle.route');
const reservasRoutes = require('./src/routes/reservas.routes');
const conductorRoutes = require('./src/routes/conductor.routes');
const cuentasRoutes = require('./src/routes/cuentasConductor.routes');
const cuentasViajeRoutes = require('./src/routes/cuentasViaje.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.set('trust proxy', true);
app.use(ipWhitelist);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/paradas', paradasRoutes);
app.use('/api/viaje-registro', viajeRegistroRoutes);
app.use('/api/viajes-detalle', viajesDetalleRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/conductor/cuentas', cuentasRoutes);
app.use('/api/conductor/', conductorRoutes);
app.use('/api/cuentas-viaje', cuentasViajeRoutes);
app.use('/api/pagos', require('./src/routes/pagos.routes'));


app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Transportes JM relizada por German Yair suerte en tu viaje, jaja');
});

const PORT = process.env.PORT || 3000;
console.log("servidor en el puerto 3000");
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Servidor escuchando en http://0.0.0.0:${PORT}`));

