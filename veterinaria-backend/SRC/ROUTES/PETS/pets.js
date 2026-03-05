const mascotasRouter = require("express").Router();
const { noNumbers } = require("../../MIDDLEWARES/noNumbers.js");
const { getAllPets, addPet } = require("../../CONTROLLERS/PETS/pets.js");

mascotasRouter.get("/all", getAllPets);

mascotasRouter.post("/add", noNumbers(["name", "petType"]), addPet);

module.exports = mascotasRouter;
