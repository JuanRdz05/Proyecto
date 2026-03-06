const Pets = require("../../MODELS/pets.js");

async function getAllPets(req, res) {
	try {
		const pets = await Pets.find({}).select("-_id");
		console.log("===================================================");
		console.log("Mostrando todos las mascotas...");
		if (pets.length === 0) {
			console.log("===================================================");
			console.log("No hay mascotas por mostrar");
			return res
				.status(404)
				.json({ message: "No hay mascotas en la base de datos" });
		}
		res.status(200).json({ message: "Mascotas encontradas", pets });
	} catch (error) {
		console.error("Error al obtener las mascotas: ", error);
		res.status(500).json({ message: "Error al obtener las mascotas", error });
	}
}

async function addPet(req, res) {
	try {
		console.log("===================================================");
		console.log("Agregando mascota...");
		const userId = req.user.id;
		const petData = { ...req.body, owner: userId };
		const pet = new Pets(petData);
		await pet.save();
		console.log("===================================================");
		console.log("Mascota agregada exitosamente");
		res.status(201).json({ message: "Mascota agregada", pet });
	} catch (error) {
		console.error("Error al agregar la mascota: ", error);
		res.status(500).json({ message: "Error al agregar la mascota", error });
	}
}

module.exports = {
	getAllPets,
	addPet,
};
