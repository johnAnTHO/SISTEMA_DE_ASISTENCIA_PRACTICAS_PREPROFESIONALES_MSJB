# Sistema de Asistencia Full Stack

## Requisitos
- Node.js
- PostgreSQL
- Git

## Configuración

### 1. Base de Datos
Asegúrese de tener una base de datos PostgreSQL creada llamada `asistencia_db`.
Actualice las credenciales en `server/.env` (si usa Prisma) o en `server/src/models/index.js` (Sequelize).

### 2. Backend (Server)
```bash
cd server
npm install
# Para inicializar datos (Seed) - asegúrese de que la DB esté corriendo
node src/seed.js
# Iniciar servidor
node src/index.js
```
El servidor correrá en `http://localhost:3000`.

### 3. Frontend (Client)
```bash
cd client
npm install
npm run dev
```
La aplicación abrirá en `http://localhost:5173`.

## Credenciales de Prueba (tras correr seed.js)
- **Practicante**: DNI: `71234567`, Pass: `123456`
- **Admin**: User: `admin`, Pass: `admin123`
