const {
	getAllUsers,
	registerUser,
	getUser,
} = require("../../CONTROLLERS/USERS/users.js");
const { loginUser } = require("../../CONTROLLERS/USERS/authUsers.js");
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
//Ruta para hacer login
usersRouter.post("/login", loginUser);

module.exports = usersRouter;
