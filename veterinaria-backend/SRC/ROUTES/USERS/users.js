const {
	getAllUsers,
	registerUser,
	getUser,
	getProfile,
} = require("../../CONTROLLERS/USERS/users.js");
const { loginUser, authRole } = require("../../CONTROLLERS/USERS/authUsers.js");
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { verificarToken, authRole } = require("../../MIDDLEWARES/authToken.js");

const usersRouter = require("express").Router();

//Ruta para mostrar todos los usuarios
usersRouter.get("/all", getAllUsers);
//Ruta para registrar un nuevo usuarios
usersRouter.post(
	"/register",
	noNumbers(["name", "paternalLastName", "maternalLastName"]),
	registerUser,
);
//Ruta para hacer login
usersRouter.post("/login", loginUser);
//Ruta para obtener el perfil del usuario
usersRouter.get("/profile", verificarToken, getProfile);
//Rutas para los administradores
usersRouter.get("/admin/home", authRole("admin"), loginUser);

module.exports = usersRouter;
