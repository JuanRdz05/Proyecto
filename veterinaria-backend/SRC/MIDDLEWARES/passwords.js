const bcrypt = require("bcrypt");

function hashPassword(password) {
	console.log("===================================================");
	console.log("Comenzando procesos de encriptación...");
	return bcrypt.hashSync(password, 10);
}

module.exports = {
	hashPassword,
};
