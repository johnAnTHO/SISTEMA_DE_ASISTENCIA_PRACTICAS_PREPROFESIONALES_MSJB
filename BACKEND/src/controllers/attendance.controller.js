const db = require('../models');
const Attendance = db.attendances;
const User = db.users;
const { Op } = require('sequelize');

// Registrar Entrada o Salida basado en el DNI
const registerForDni = async (req, res) => {
    try {
        const { dni } = req.body;

        // 1. Buscar Usuario
        const user = await User.findOne({ where: { dni } });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado con este DNI.' });
        }

        // 2. Obtener fecha de hoy y validar día laborable
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado

        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return res.status(400).json({
                message: 'Hoy no es un día laborable. El registro de asistencia solo está permitido de lunes a viernes.'
            });
        }

        const today = now.toISOString().split('T')[0];
        const nowTime = now.toLocaleTimeString('es-PE', { hour12: false });

        // 3. Buscar si ya tiene registro HOY
        let attendance = await Attendance.findOne({
            where: {
                userId: user.id,
                date: today
            }
        });

        if (!attendance) {
            // --- CASO 1: NO EXISTE REGISTRO -> ES ENTRADA ---

            // Definir rangos de hora según el turno
            let entryStart, entryEnd, entryLateLimit;

            if (user.shift === 'Mañana') {
                entryStart = '08:00:00';
                entryEnd = '09:00:00';
                entryLateLimit = '08:15:00';
            } else if (user.shift === 'Tarde') {
                entryStart = '14:00:00';
                entryEnd = '15:00:00';
                entryLateLimit = '14:15:00';
            } else {
                // Caso por defecto o error si no tiene turno definido
                return res.status(400).json({ message: 'El usuario no tiene un turno válido asignado.' });
            }

            // Validar rango de entrada
            if (nowTime < entryStart || nowTime > entryEnd) {
                return res.status(400).json({
                    message: `El registro de ENTRADA para el turno ${user.shift} solo está permitido entre ${entryStart} y ${entryEnd}.`
                });
            }

            const status = nowTime > entryLateLimit ? 'TARDANZA' : 'PUNTUAL';

            attendance = await Attendance.create({
                userId: user.id,
                date: today,
                entryTime: nowTime,
                status: status
            });

            return res.json({
                type: 'ENTRADA',
                time: nowTime,
                user: user.names,
                message: `Entrada registrada (${status})`
            });

        } else {
            // --- CASO 2: YA EXISTE REGISTRO ---

            if (!attendance.exitTime) {
                // --- VALIDACIONES DE SALIDA ---

                // Definir rangos de salida según el turno
                let exitStart, exitEnd;

                if (user.shift === 'Mañana') {
                    exitStart = '12:00:00';
                    exitEnd = '13:00:00';
                } else if (user.shift === 'Tarde') {
                    // Turno Tarde: 2:00 PM - 5:00 PM (3 horas de práctica)
                    exitStart = '17:00:00';
                    exitEnd = '18:00:00';
                } else {
                    return res.status(400).json({ message: 'El usuario no tiene un turno válido asignado.' });
                }

                // Validar rango de salida
                if (nowTime < exitStart || nowTime > exitEnd) {
                    return res.status(400).json({
                        message: `El registro de SALIDA para el turno ${user.shift} solo está permitido entre ${exitStart} y ${exitEnd}.`
                    });
                }

                attendance.exitTime = nowTime;

                // Calcular horas trabajadas
                const entryParts = attendance.entryTime.split(':');
                const nowParts = nowTime.split(':');
                const entryMinutes = parseInt(entryParts[0]) * 60 + parseInt(entryParts[1]);
                const nowMinutes = parseInt(nowParts[0]) * 60 + parseInt(nowParts[1]);
                const diffHours = (nowMinutes - entryMinutes) / 60;

                attendance.hours = parseFloat(diffHours.toFixed(2));

                await attendance.save();

                return res.json({
                    type: 'SALIDA',
                    time: nowTime,
                    user: user.names,
                    message: 'Salida registrada correctamente.'
                });

            } else {
                // --- CASO 2b: YA TIENE SALIDA -> ERROR ---
                return res.status(400).json({ message: 'Ya has registrado entrada y salida el día de hoy.' });
            }
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener estado de hoy para un usuario
const getTodayStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const today = new Date().toISOString().split('T')[0];

        const attendance = await Attendance.findOne({
            where: { userId, date: today }
        });

        res.json(attendance || { entryTime: null, exitTime: null });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener historial completo de un usuario
const getUserHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        const history = await Attendance.findAll({
            where: { userId },
            order: [['date', 'DESC'], ['entryTime', 'DESC']]
        });
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener toda la asistencia de hoy (para el Admin)
const getTodayAttendance = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendances = await Attendance.findAll({
            where: { date: today },
            include: [{
                model: User,
                as: 'user',
                attributes: ['names', 'lastnames', 'area', 'shift']
            }],
            order: [['entryTime', 'DESC']]
        });
        res.json(attendances);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getGlobalStats = async (req, res) => {
    try {
        console.log("Calculando estadísticas globales...");
        const totalPracticants = await User.count({ where: { role: 'PRACTICANT' } });
        const today = new Date().toISOString().split('T')[0];

        // Stats for cards
        const todayAttendance = await Attendance.findAll({ where: { date: today } });
        const presentToday = todayAttendance.length;
        const lateToday = todayAttendance.filter(a => a.status === 'TARDANZA').length;

        const allAttendance = await Attendance.findAll();
        const totalHours = allAttendance.reduce((acc, current) => acc + (current.hours || 0), 0);

        // Data for Area Chart
        const users = await User.findAll({ where: { role: 'PRACTICANT' }, attributes: ['area'] });
        const areaMap = {};
        users.forEach(u => {
            areaMap[u.area] = (areaMap[u.area] || 0) + 1;
        });

        const todayWithUsers = await Attendance.findAll({
            where: { date: today },
            include: [{ model: User, as: 'user', attributes: ['area'] }]
        });

        const finalAreaData = Object.keys(areaMap).map(name => {
            return {
                name,
                total: areaMap[name],
                present: todayWithUsers.filter(a => a.user?.area === name).length
            };
        });

        // Weekly Trend - Simplified
        const trendRaw = await Attendance.findAll({
            attributes: ['date'],
            order: [['date', 'ASC']]
        });

        const trendMap = {};
        trendRaw.forEach(a => {
            trendMap[a.date] = (trendMap[a.date] || 0) + 1;
        });

        const trendData = Object.keys(trendMap).sort().slice(-7).map(date => ({
            date,
            asistencias: trendMap[date]
        }));

        console.log("Estadísticas enviadas.");
        res.json({
            cards: {
                totalPracticants,
                presentToday,
                lateToday,
                totalHours: Math.round(totalHours)
            },
            areaData: finalAreaData,
            trendData: trendData
        });
    } catch (error) {
        console.error("Error en getGlobalStats:", error);
        res.status(500).json({ message: error.message });
    }
};

// Exportar historial completo de un practicante según su periodo de prácticas
const exportPracticantReport = async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Obtener datos del practicante
        const user = await User.findOne({
            where: { id: userId },
            attributes: ['id', 'names', 'lastnames', 'dni', 'area', 'shift', 'university', 'career', 'startDate', 'endDate']
        });

        if (!user) {
            return res.status(404).json({ message: 'Practicante no encontrado.' });
        }

        if (!user.startDate || !user.endDate) {
            return res.status(400).json({ message: 'El practicante no tiene fechas de inicio o fin de prácticas registradas.' });
        }

        // 2. Consultar asistencia dentro del rango startDate - endDate
        const attendances = await Attendance.findAll({
            where: {
                userId: user.id,
                date: {
                    [Op.between]: [user.startDate, user.endDate]
                }
            },
            order: [['date', 'ASC']]
        });

        // 3. Calcular días laborables en el rango (lunes a viernes)
        let laborableDays = 0;
        const start = new Date(user.startDate);
        const end = new Date(user.endDate);
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dow = d.getDay();
            if (dow !== 0 && dow !== 6) laborableDays++;
        }

        // 4. Calcular resumen
        const totalDiasAsistidos = attendances.length;
        const totalTardanzas = attendances.filter(a => a.status === 'TARDANZA').length;
        const totalPuntuales = attendances.filter(a => a.status === 'PUNTUAL').length;
        const totalHoras = attendances.reduce((acc, a) => acc + (a.hours || 0), 0);
        const diasAusentes = Math.max(0, laborableDays - totalDiasAsistidos);
        const porcentajeCumplimiento = laborableDays > 0
            ? Math.round((totalDiasAsistidos / laborableDays) * 100)
            : 0;

        res.json({
            practicant: {
                names: user.names,
                lastnames: user.lastnames,
                dni: user.dni,
                area: user.area,
                shift: user.shift,
                university: user.university || '',
                career: user.career || '',
                startDate: user.startDate,
                endDate: user.endDate
            },
            summary: {
                laborableDays,
                totalDiasAsistidos,
                totalPuntuales,
                totalTardanzas,
                diasAusentes,
                totalHoras: parseFloat(totalHoras.toFixed(2)),
                porcentajeCumplimiento
            },
            records: attendances.map(a => ({
                date: a.date,
                entryTime: a.entryTime,
                exitTime: a.exitTime || '--:--',
                hours: a.hours || 0,
                status: a.status
            }))
        });
    } catch (error) {
        console.error('Error en exportPracticantReport:', error);
        res.status(500).json({ message: error.message });
    }
};

// Resumen de todos los practicantes en su periodo de prácticas (para Control de Asistencia)
const getPeriodSummaryAll = async (req, res) => {
    try {
        // Traer todos los practicantes
        const practicants = await User.findAll({
            where: { role: 'PRACTICANT' },
            attributes: ['id', 'names', 'lastnames', 'dni', 'area', 'shift', 'university', 'career', 'startDate', 'endDate', 'status']
        });

        const results = await Promise.all(practicants.map(async (p) => {
            const base = {
                id: p.id,
                names: p.names,
                lastnames: p.lastnames,
                dni: p.dni,
                area: p.area,
                shift: p.shift,
                startDate: p.startDate,
                endDate: p.endDate,
                status: p.status
            };

            if (!p.startDate || !p.endDate) {
                return { ...base, laborableDays: null, totalAsistidos: 0, totalPuntuales: 0, totalTardanzas: 0, diasAusentes: null, porcentaje: null, sinFechas: true };
            }

            // Contar días laborables
            let laborableDays = 0;
            const start = new Date(p.startDate);
            const end   = new Date(p.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const dow = d.getDay();
                if (dow !== 0 && dow !== 6) laborableDays++;
            }

            // Contar asistencias en el periodo
            const attendances = await Attendance.findAll({
                where: {
                    userId: p.id,
                    date: { [Op.between]: [p.startDate, p.endDate] }
                }
            });

            const totalAsistidos  = attendances.length;
            const totalTardanzas  = attendances.filter(a => a.status === 'TARDANZA').length;
            const totalPuntuales  = attendances.filter(a => a.status === 'PUNTUAL').length;
            const totalHoras      = attendances.reduce((acc, a) => acc + (a.hours || 0), 0);
            const diasAusentes    = Math.max(0, laborableDays - totalAsistidos);
            const porcentaje      = laborableDays > 0 ? Math.round((totalAsistidos / laborableDays) * 100) : 0;

            return {
                ...base,
                laborableDays,
                totalAsistidos,
                totalPuntuales,
                totalTardanzas,
                totalHoras: parseFloat(totalHoras.toFixed(2)),
                diasAusentes,
                porcentaje,
                sinFechas: false
            };
        }));

        res.json(results);
    } catch (error) {
        console.error('Error en getPeriodSummaryAll:', error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerForDni, getTodayStatus, getUserHistory, getTodayAttendance, getGlobalStats, exportPracticantReport, getPeriodSummaryAll };
