const db = require('./src/models');
const User = db.users;
async function a() {
  const admin = await User.findOne({where:{role:'ADMIN'}});
  if(admin) console.log("ADMIN U_S_E_R_N_A_M_E IS:", admin.username);
  process.exit(0);
}
a();
