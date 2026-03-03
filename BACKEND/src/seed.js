const db = require('./models');
const User = db.users;
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await db.sequelize.sync({ force: true }); // WARNING: This drops tables!
        console.log("Tables dropped and recreated.");

        const salt = await bcrypt.genSalt(10);
        const adminPass = await bcrypt.hash('admin123', salt);
        const practicantPass = await bcrypt.hash('123456', salt);

        // 1. Create Admin
        await User.create({
            username: 'admin',
            password: adminPass,
            role: 'ADMIN',
            names: 'Rosa',
            lastnames: 'Mendoza',
            area: 'Oficina de Gestión de Recursos Humanos'
        });
        console.log("Admin user created.");

        // 2. Create Practicant
        await User.create({
            dni: '71234567',
            password: practicantPass,
            role: 'PRACTICANT',
            names: 'María',
            lastnames: 'García López',
            area: 'Oficina TIC',
            shift: 'Mañana',
            university: 'UNSCH',
            career: 'Ingeniería de Sistemas',
            phone: '966123456'
        });
        console.log("Practicant user created.");

        console.log("✅ Database seeded successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    }
}

seed().then(() => process.exit());
