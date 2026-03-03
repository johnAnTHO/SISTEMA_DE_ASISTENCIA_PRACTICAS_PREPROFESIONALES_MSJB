module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        dni: {
            type: DataTypes.STRING,
            unique: true
        },
        username: {
            type: DataTypes.STRING,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.STRING, // 'ADMIN', 'PRACTICANT'
            defaultValue: 'PRACTICANT'
        },
        names: {
            type: DataTypes.STRING
        },
        lastnames: {
            type: DataTypes.STRING
        },
        area: {
            type: DataTypes.STRING
        },
        shift: {
            type: DataTypes.STRING
        },
        university: {
            type: DataTypes.STRING
        },
        career: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        email: {
            type: DataTypes.STRING
        },
        status: {
            type: DataTypes.STRING,
            defaultValue: 'Activo'
        },
        photo: {
            type: DataTypes.TEXT // Postgres uses TEXT for all lengths (supports unlimited size)
        },
        startDate: {
            type: DataTypes.DATEONLY
        },
        endDate: {
            type: DataTypes.DATEONLY
        }
    });

    return User;
};
