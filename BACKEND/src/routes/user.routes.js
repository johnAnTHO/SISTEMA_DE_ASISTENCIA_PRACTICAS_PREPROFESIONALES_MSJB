const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

const authJwt = require('../middleware/authJwt');

// Rutas para gestión de practicantes
router.get('/', [authJwt.verifyToken, authJwt.isAdmin], userController.getAllPracticants);
router.post('/', [authJwt.verifyToken, authJwt.isAdmin], userController.createPracticant);
router.put('/:id', [authJwt.verifyToken], userController.updatePracticant); // El controlador maneja si es self-update o admin
router.delete('/:id', [authJwt.verifyToken, authJwt.isAdmin], userController.deletePracticant);

module.exports = router;
