const {
	getAllUsers,
	registerUser,
} = require("../../CONTROLLERS/USERS/users.js");
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");

const usersRouter = require("express").Router();

//Ruta para mostrar todos los usuarios
usersRouter.get("/all", getAllUsers);
//Ruta para registrar un nuevo usuarios
usersRouter.post(
	"/register",
	noNumbers(["name", "paternalLastName", "maternalLastName"]),
	registerUser,
);

module.exports = usersRouter;
