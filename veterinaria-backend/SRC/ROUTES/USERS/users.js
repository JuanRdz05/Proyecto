const { getAllUsers } = require("../../CONTROLLERS/USERS/users.js");

const usersRouter = require("express").Router();

//Ruta para mostrar todos los usuarios
usersRouter.get("/", getAllUsers);

module.exports = usersRouter;
