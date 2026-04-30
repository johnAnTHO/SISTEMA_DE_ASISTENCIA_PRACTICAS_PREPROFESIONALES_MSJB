const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

const authJwt = require('../middleware/authJwt');

router.post('/register', attendanceController.registerForDni);
router.get('/today-status/:userId', [authJwt.verifyToken], attendanceController.getTodayStatus);
router.get('/history/:userId', [authJwt.verifyToken], attendanceController.getUserHistory);

router.get('/today', [authJwt.verifyToken, authJwt.isAdmin], attendanceController.getTodayAttendance);
router.get('/stats/global', [authJwt.verifyToken, authJwt.isAdmin], attendanceController.getGlobalStats);

// Exportar reporte completo del periodo de prácticas de un practicante
router.get('/export/:userId', [authJwt.verifyToken, authJwt.isAdmin], attendanceController.exportPracticantReport);

// Resumen de todos los practicantes en su periodo de prácticas
router.get('/period-summary', [authJwt.verifyToken, authJwt.isAdmin], attendanceController.getPeriodSummaryAll);

module.exports = router;
