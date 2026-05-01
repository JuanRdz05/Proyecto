const {
	getAllUsers,
	registerUser,
	getUser,
	getProfile,
	getAllVets,
	toggleVetStatus,
} = require("../../CONTROLLERS/USERS/users.js");
const {
	updateProfile,
	updatePassword,
} = require("../../CONTROLLERS/USERS/updateUsers.js");
const {
	loginUser,
	logoutUser,
} = require("../../CONTROLLERS/USERS/authUsers.js");
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { verificarToken, authRole } = require("../../MIDDLEWARES/authToken.js");
const { body, validationResult } = require("express-validator");

const upload = require("../../MIDDLEWARES/uploadImage.js");

const usersRouter = require("express").Router();

// Ruta para mostrar todos los usuarios
usersRouter.get("/all", getAllUsers);

// Ruta para registrar un nuevo usuarios
usersRouter.post(
	"/register",
	upload.single("profilePic"),
	noNumbers(["name", "paternalLastName", "maternalLastName"]),
	registerUser,
);

// Ruta para hacer login
usersRouter.post("/login", loginUser);

// Ruta para cerrar sesión
usersRouter.post("/logout", logoutUser);

// Ruta para obtener el perfil del usuario
usersRouter.get("/profile", verificarToken, getProfile);

// Ruta para actualizar el perfil del usuario (AHORA CON UPLOAD DE IMAGEN)
usersRouter.patch(
	"/profile",
	verificarToken,
	upload.single("profilePicture"), // ← Agregado para subir foto
	noNumbers(["name", "paternalLastName", "maternalLastName"]),
	updateProfile,
);

// Ruta par actualizar la contraseña del usuario
usersRouter.patch(
	"/change-password",
	verificarToken,
	body("currentPassword")
		.notEmpty()
		.withMessage("La constraseña actual es requerida"),
	body("newPassword")
		.notEmpty()
		.withMessage("La nueva contraseña es requerida"),
	updatePassword,
);

//Ruta para obtener todos los veterinarios
usersRouter.get("/vets", verificarToken, authRole("admin"), getAllVets);

//Ruta para activar o desactivar un veterinario
usersRouter.get(
	"/vets/:id",
	verificarToken,
	authRole("admin"),
	toggleVetStatus,
);

//Ruta para activar/desactivar veterinario
usersRouter.patch(
	"/vets/:id",
	verificarToken,
	authRole("admin"),
	toggleVetStatus,
);

// Rutas para los administradores
usersRouter.get("/admin/home", authRole("admin"), loginUser);

module.exports = usersRouter;
