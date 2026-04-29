const db = require('../models');
const User = db.users;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// ──────────────────────────────────────────────
//  Configuración de bloqueo por intentos fallidos
// ──────────────────────────────────────────────
const MAX_ATTEMPTS   = 8;          // intentos máximos antes del bloqueo
const LOCK_DURATION  = 15 * 60 * 1000; // 15 minutos en milisegundos

// Mapa en memoria: clave -> { attempts, lockedUntil }
// Clave: "practicant:<dni>" | "admin:<username>"
const loginAttempts = new Map();

/**
 * Devuelve el estado actual de intentos para una clave dada.
 * Si el bloqueo ya expiró lo limpia automáticamente.
 */
function getAttemptRecord(key) {
    const record = loginAttempts.get(key) || { attempts: 0, lockedUntil: null };
    // Si había bloqueo y ya expiró, reiniciar
    if (record.lockedUntil && Date.now() > record.lockedUntil) {
        const reset = { attempts: 0, lockedUntil: null };
        loginAttempts.set(key, reset);
        return reset;
    }
    return record;
}

/** Registra un intento fallido y aplica bloqueo si se superó el límite. */
function registerFailedAttempt(key) {
    const record = getAttemptRecord(key);
    record.attempts += 1;
    if (record.attempts >= MAX_ATTEMPTS) {
        record.lockedUntil = Date.now() + LOCK_DURATION;
    }
    loginAttempts.set(key, record);
    return record;
}

/** Limpia el registro al loguearse correctamente. */
function clearAttempts(key) {
    loginAttempts.delete(key);
}

// ──────────────────────────────────────────────
//  Controladores
// ──────────────────────────────────────────────

const login = async (req, res) => {
    try {
        const { dni, username, password, type } = req.body;

        // Determinar clave de bloqueo según tipo de usuario
        const identifier = type === 'practicant' ? dni : username;
        const lockKey    = `${type}:${identifier}`;

        // ── Verificar si está bloqueado ──
        const record = getAttemptRecord(lockKey);
        if (record.lockedUntil) {
            const remainingMs  = record.lockedUntil - Date.now();
            const remainingMin = Math.ceil(remainingMs / 60000);
            return res.status(429).json({
                message: `Cuenta bloqueada temporalmente por demasiados intentos fallidos. Inténtelo de nuevo en ${remainingMin} minuto${remainingMin !== 1 ? 's' : ''}.`,
                locked: true,
                lockedUntil: record.lockedUntil,
                remainingMs
            });
        }

        // ── Buscar usuario ──
        let user;
        if (type === 'practicant') {
            user = await User.findOne({ where: { dni } });
        } else {
            user = await User.findOne({ where: { username } });
        }

        if (!user) {
            // Contar intento aunque el usuario no exista (evita enumeración)
            const updated = registerFailedAttempt(lockKey);
            const remaining = MAX_ATTEMPTS - updated.attempts;
            const msg = updated.lockedUntil
                ? `Cuenta bloqueada por 15 minutos tras ${MAX_ATTEMPTS} intentos fallidos.`
                : `Usuario no encontrado. Intentos restantes: ${remaining}.`;
            return res.status(404).json({ message: msg, locked: !!updated.lockedUntil, attemptsRemaining: remaining });
        }

        // ── Verificar contraseña ──
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            const updated   = registerFailedAttempt(lockKey);
            const remaining = Math.max(0, MAX_ATTEMPTS - updated.attempts);
            const msg = updated.lockedUntil
                ? `Cuenta bloqueada por 15 minutos tras ${MAX_ATTEMPTS} intentos fallidos consecutivos.`
                : `Contraseña incorrecta. Intentos restantes: ${remaining}.`;
            return res.status(400).json({
                message: msg,
                locked: !!updated.lockedUntil,
                lockedUntil: updated.lockedUntil || null,
                attemptsRemaining: remaining
            });
        }

        // ── Login exitoso: limpiar intentos y emitir token ──
        clearAttempts(lockKey);

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

        // Limpiar intentos fallidos al restablecer contraseña
        clearAttempts(`practicant:${dni}`);

        res.json({ message: `Su contraseña ha sido restablecida exitosamente. Su nueva contraseña es su ${user.role === 'ADMIN' ? 'Usuario (' + newPassword + ')' : 'DNI (' + newPassword + ')'}. Ya puede iniciar sesión.` });

    } catch (error) {
        console.error("Forgot password error:", error);
        res.status(500).json({ message: 'Error interno en el servidor.' });
    }
};

module.exports = { login, forgotPassword };
