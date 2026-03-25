const db = require('../models');
const User = db.users;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
    try {
        const { dni, username, password, type } = req.body;

        let user;
        if (type === 'practicant') {
            user = await User.findOne({ where: { dni } });
        } else {
            user = await User.findOne({ where: { username } });
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // For demo purposes, if password is plain text (initial seed) or hashed
        // We should check both or assume hashed.
        // Let's assume seeded users might have plain text in this prototype phase if not careful, 
        // but better to always hash.
        // For now, simple compare:
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        res.json({ token, user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { dni } = req.body;
        
        // Find user by DNI (for practicants) or username (for admins)
        let user = await User.findOne({ where: { dni } });
        let newPassword = dni;

        if (!user) {
            user = await User.findOne({ where: { username: dni } });
            newPassword = dni; // Para administradores será su mismo usuario
        }

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado. Asegúrese de ingresar correctamente su DNI o Usuario.' });
        }

        if (user.role === 'ADMIN') {
            return res.status(403).json({ message: 'Por razones de seguridad, los administradores no pueden restablecer su contraseña automáticamente. Contacte a soporte o al encargado del sistema.' });
        }

        // Restablecer la contraseña al DNI
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update user
        await user.update({ password: hashedPassword });

        res.json({ message: `Su contraseña ha sido restablecida exitosamente. Su nueva contraseña es su ${user.role === 'ADMIN' ? 'Usuario (' + newPassword + ')' : 'DNI (' + newPassword + ')'}. Ya puede iniciar sesión.` });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: 'Error interno en el servidor.' });
    }
};

module.exports = { login, forgotPassword };
