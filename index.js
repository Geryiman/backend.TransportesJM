require('dotenv').config();
require('./cron/finalizarViajes');
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/auth.routes');
const adminRoutes = require('./src/routes/adminAuth.routes');
const viajesRoutes = require('./src/routes/viajes.routes');
const paradasRoutes = require('./src/routes/paradas.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/viajes', viajesRoutes);
app.use('/api/paradas', paradasRoutes);


app.get('/', (req, res) => {
  res.send('Bienvenido a la API de Transportes');
});

const PORT = process.env.PORT || 3000;
console.log("servidor en el puerto 3000");
app.listen(PORT, '0.0.0.0', () => console.log(`✅ Servidor escuchando en http://0.0.0.0:${PORT}`));

