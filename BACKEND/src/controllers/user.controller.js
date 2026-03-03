const db = require('../models');
const User = db.users;
const bcrypt = require('bcryptjs');

// Obtener todos los practicantes
const getAllPracticants = async (req, res) => {
    try {
        const practicants = await User.findAll({
            where: { role: 'PRACTICANT' },
            attributes: { exclude: ['password'] }
        });
        res.json(practicants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear un nuevo practicante
const createPracticant = async (req, res) => {
    try {
        const { dni, names, lastnames, area, shift, university, career, phone, startDate, endDate } = req.body;

        // Verificar si ya existe
        const existing = await User.findOne({ where: { dni } });
        if (existing) {
            return res.status(400).json({ message: 'Ya existe un usuario con este DNI.' });
        }

        // En un sistema real, el password inicial podría ser el DNI o uno por defecto
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(dni, salt); // Password inicial = DNI

        const newUser = await User.create({
            dni,
            password: hashedPassword,
            role: 'PRACTICANT',
            names,
            lastnames,
            area,
            shift,
            university,
            career,
            phone,
            startDate,
            endDate
        });

        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Actualizar practicante
const updatePracticant = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar permisos: Solo el Admin O el propio usuario pueden editar
        // Nota: req.userId y req.userRole vienen del middleware authJwt
        if (req.userRole !== 'ADMIN' && req.userId != id) {
            return res.status(403).json({ message: 'No tienes permiso para editar este perfil.' });
        }

        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        let updateData = { ...req.body };

        // Si se envía una contraseña, hay que encriptarla
        if (updateData.password && updateData.password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(updateData.password, salt);
        } else {
            // Si viene vacía o no viene, no la tocamos
            delete updateData.password;
        }

        // Evitar que un practicante se cambie a ADMIN o cambie su DNI (Usuario) si no es Admin
        if (req.userRole !== 'ADMIN') {
            delete updateData.role;
            delete updateData.dni; // El DNI es su usuario, mejor no permitir que se lo cambien ellos mismos por seguridad
        }

        await user.update(updateData);
        res.json({ message: 'Datos actualizados correctamente.', user: { ...user.dataValues, password: undefined } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar practicante
const deletePracticant = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        await user.destroy();
        res.json({ message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllPracticants,
    createPracticant,
    updatePracticant,
    deletePracticant
};
