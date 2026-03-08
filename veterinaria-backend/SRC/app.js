const express = require("express");
const cors = require("cors");
const app = express();
const usersRouter = require("./ROUTES/USERS/users.js");
const mascotasRouter = require("./ROUTES/PETS/pets.js");
const logsRouter = require("./ROUTES/LOGS/logs.js");
const servicesRouter = require("./ROUTES/SERVICES/services.js");

//Middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

//Rutas para los usuarios
app.use("/users/v1", usersRouter);
//Rutas para las mascotas
app.use("/pets/v1", mascotasRouter);
//Rutas para los servicios
app.use("/services/v1", servicesRouter);
//Ruta para los logs
app.use("/logs/v1", logsRouter);

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
