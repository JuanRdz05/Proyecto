const express = require("express");
const cors = require("cors");
const app = express();
const usersRouter = require("./ROUTES/USERS/users.js");
const mascotasRouter = require("./ROUTES/PETS/pets.js");

//Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Rutas para los usuarios
app.use("/users", usersRouter);
//Rutas para los animales
app.use("/pets", mascotasRouter);
app.get("/", (req, res) => {
	res.status(200).json({ message: "Hello World" });
});

//Ruta para ver el estatus del servidor
app.get("/health", (req, res) => {
	res.status(200).json({ message: "Server is running" });
});

//Manejo de rutas no encontradas
app.use((req, res) => {
	res.status(404).json({ message: "Route not found" });
});

module.exports = app;
