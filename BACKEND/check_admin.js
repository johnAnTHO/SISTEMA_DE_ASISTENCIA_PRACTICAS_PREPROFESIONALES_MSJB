const db = require('./src/models');
const User = db.users;

async function checkAdmin() {
    try {
        await db.sequelize.authenticate();
        console.log('Connection established.');

        const admins = await User.findAll({ where: { role: 'ADMIN' } });
        console.log(`Found ${admins.length} ADMIN users.`);
        
        for (const admin of admins) {
            console.log(`- Username: ${admin.username}, Names: ${admin.names}`);
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAdmin();
