const mascotasRouter = require("express").Router();
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { getAllPets, addPet } = require("../../CONTROLLERS/PETS/pets.js");
const { verificarToken } = require("../../MIDDLEWARES/authToken.js");

//Ruta para obtener todas la mascotas
mascotasRouter.get("/all", getAllPets);
//Ruta para que un usuario agregue una mascota nueva
mascotasRouter.post(
	"/add",
	verificarToken,
	noNumbers(["name", "petType"]),
	addPet,
);

module.exports = mascotasRouter;
