const db = require('./src/models');
const User = db.users;
const bcrypt = require('bcryptjs');

async function resetAdmin() {
    try {
        await db.sequelize.authenticate();
        
        const admin = await User.findOne({ where: { role: 'ADMIN' } });
        if (!admin) {
            console.log('NO ADMIN FOUND');
            process.exit(1);
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        await admin.update({ password: hashedPassword });
        console.log(`\n\nADMIN_USERNAME: ${admin.username}\nADMIN_PASSWORD_RESET: admin123\n`);
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}
resetAdmin();
