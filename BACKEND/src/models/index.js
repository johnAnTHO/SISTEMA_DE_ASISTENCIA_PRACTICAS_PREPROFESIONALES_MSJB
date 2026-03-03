const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// Fallback if env var fails to load, matching the hardcoded string I tried to use
// Fallback if env var fails to load, matching the hardcoded string I tried to use
const sequelize = new Sequelize("postgresql://postgres:BD2025jhon@localhost:5432/asistencia_db", {
    dialect: 'postgres',
    logging: false,
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require('./user.model.js')(sequelize, DataTypes);
db.attendances = require('./attendance.model.js')(sequelize, DataTypes);

// Asociaciones
db.users.hasMany(db.attendances, { as: "attendances" });
db.attendances.belongsTo(db.users, {
    foreignKey: "userId",
    as: "user",
});

module.exports = db;
