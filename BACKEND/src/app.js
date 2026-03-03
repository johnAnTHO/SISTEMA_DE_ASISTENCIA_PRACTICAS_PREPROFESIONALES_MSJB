const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();

app.use(cors());
app.use(express.json());

// Sync DB
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Database synced");
}).catch((err) => {
  console.log("Failed to sync db: " + err.message);
});

app.get('/', (req, res) => {
  res.send('Attendance System API Running');
});

const authRoutes = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const userRoutes = require('./routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/users', userRoutes);

// --- DESPLIEGUE: Servir Frontend Estático ---
const path = require('path');
// Servir archivos estáticos de la carpeta dist del frontend (se crea al hacer npm run build)
app.use(express.static(path.join(__dirname, '../../FRONTEND/dist')));

// Cualquier ruta que no sea API, devuelve el index.html (para que React maneje las rutas)
// Cualquier ruta que no sea API, devuelve el index.html (para que React maneje las rutas)
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../FRONTEND/dist', 'index.html'));
});

module.exports = { app };
