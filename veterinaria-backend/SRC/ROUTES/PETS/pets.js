const mascotasRouter = require("express").Router();
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const {
	getAllPets,
	addPet,
	getPetsByUser,
	changeStatus,
	modifyPet,
	getPetById,
	adminTogglePetStatus,
} = require("../../CONTROLLERS/PETS/pets.js");
const { verificarToken, authRole } = require("../../MIDDLEWARES/authToken.js");

// Admin: obtener todas las mascotas paginadas
mascotasRouter.get("/all", verificarToken, authRole("admin"), getAllPets);

// Cliente: agregar mascota
mascotasRouter.post(
	"/add",
	verificarToken,
	noNumbers(["name", "petType"]),
	addPet,
);

// Cliente: ver sus propias mascotas
mascotasRouter.get("/get-user-pets", verificarToken, getPetsByUser);

// Admin: activar/desactivar cualquier mascota (con lógica disabledByAdmin)
mascotasRouter.patch(
	"/:id/admin-toggle",
	verificarToken,
	authRole("admin"),
	adminTogglePetStatus,
);

// Cliente: activar/desactivar su propia mascota (bloqueado si fue el admin quien desactivó)
mascotasRouter.patch("/:id/toggleActive", verificarToken, changeStatus);

// Cliente: ver mascota por id
mascotasRouter.get("/:id", verificarToken, getPetById);

// Cliente: modificar mascota
mascotasRouter.patch(
	"/:id",
	verificarToken,
	noNumbers(["name", "petType"]),
	modifyPet,
);

module.exports = mascotasRouter;
