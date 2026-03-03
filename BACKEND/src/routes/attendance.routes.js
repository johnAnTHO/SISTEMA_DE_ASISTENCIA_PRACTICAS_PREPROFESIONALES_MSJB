const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');

const authJwt = require('../middleware/authJwt');

router.post('/register', attendanceController.registerForDni);
router.get('/today-status/:userId', [authJwt.verifyToken], attendanceController.getTodayStatus);
router.get('/history/:userId', [authJwt.verifyToken], attendanceController.getUserHistory);

router.get('/today', [authJwt.verifyToken, authJwt.isAdmin], attendanceController.getTodayAttendance);
router.get('/stats/global', [authJwt.verifyToken, authJwt.isAdmin], attendanceController.getGlobalStats);

module.exports = router;
