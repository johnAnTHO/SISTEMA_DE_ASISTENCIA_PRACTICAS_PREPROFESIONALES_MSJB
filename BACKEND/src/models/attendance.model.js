module.exports = (sequelize, DataTypes) => {
    const Attendance = sequelize.define("Attendance", {
        date: {
            type: DataTypes.DATEONLY,
            defaultValue: DataTypes.NOW
        },
        entryTime: {
            type: DataTypes.TIME
        },
        exitTime: {
            type: DataTypes.TIME
        },
        hours: {
            type: DataTypes.FLOAT,
            defaultValue: 0
        },
        status: {
            type: DataTypes.STRING, // 'PUNTUAL', 'TARDANZA', 'FALTA'
            defaultValue: 'PUNTUAL'
        }
    });

    return Attendance;
};
