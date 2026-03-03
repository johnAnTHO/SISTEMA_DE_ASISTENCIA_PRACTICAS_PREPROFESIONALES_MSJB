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

module.exports = { login };
